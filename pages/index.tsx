import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useRef, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import Footer from "../components/Footer";
import Github from "../components/GitHub";
import Header from "../components/Header";
import LoadingDots from "../components/LoadingDots";
import {
  createParser,
  ParsedEvent,
  ReconnectInterval,
} from "eventsource-parser";
import Upload from "../components/Upload";
// import { useCompletion } from "ai/react";

const Home: NextPage = () => {
  // const {
  //   completion,
  //   input,
  //   stop,
  //   isLoading,
  //   handleInputChange,
  //   handleSubmit,
  // } = useCompletion({
  //   api: "/api/generate_hugging_face",
  // });

  const [loading, setLoading] = useState(false);
  const [jobDescription, setJobDescription] = useState("");
  const [resume, setResume] = useState<File | null>(null);

  const [generatedRecommendations, setGeneratedRecommendations] =
    useState<string>("");

  const recommendationsRef = useRef<null | HTMLDivElement>(null);

  const scrollToRecommendations = () => {
    if (recommendationsRef.current !== null) {
      recommendationsRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const convertFileToText = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch("/api/convert_file_to_text", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    const data = await response.json();
    return data.text;
  };

  const jobDescriptionIsLink = (jobDescription: string) => {
    return jobDescription.startsWith("http");
  };

  const generateRecommendations = async (e: any) => {
    e.preventDefault();
    setGeneratedRecommendations("");
    setLoading(true);

    let jobDescriptionText = jobDescription;

    if (jobDescriptionIsLink(jobDescription)) {
      const response = await fetch("/api/convert_website_to_text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: jobDescription,
        }),
      });

      if (!response.ok) {
        throw new Error(response.statusText);
      }

      const data = await response.json();
      jobDescriptionText = data.text;
    }

    console.log({ jobDescriptionText });

    const resumeText = await convertFileToText(resume as File);

    const response = await fetch("/api/generate_open_ai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jobDescription: jobDescriptionText,
        resume: resumeText,
      }),
    });

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    // This data is a ReadableStream
    const data = response.body;

    if (!data) {
      return;
    }

    const onParse = (event: ParsedEvent | ReconnectInterval) => {
      if (event.type === "event") {
        const data = event.data;
        try {
          const text = JSON.parse(data).text ?? "";
          setGeneratedRecommendations((prev) => prev + text);
        } catch (e) {
          console.error(e);
        }
      }
    };

    // https://web.dev/streams/#the-getreader-and-read-methods
    const reader = data.getReader();

    const decoder = new TextDecoder();
    const parser = createParser(onParse);

    let done = false;
    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;

      const chunkValue = decoder.decode(value);
      // setGeneratedRecommendations((prev) => prev + chunkValue);
      parser.feed(chunkValue);
    }
    scrollToRecommendations();
    setLoading(false);
  };

  return (
    <div className="flex max-w-5xl mx-auto flex-col items-center justify-center py-2 min-h-screen">
      <Head>
        <title>Resume Reviewer</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />
      <main className="flex flex-1 w-full flex-col items-center justify-center text-center px-4 mt-12 sm:mt-20">
        {/* <a
          className="flex max-w-fit items-center justify-center space-x-2 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm text-gray-600 shadow-md transition-colors hover:bg-gray-100 mb-5"
          href="https://github.com/kervin5/resume-reviewer"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Github />
          <p>Star on GitHub</p>
        </a> */}
        <h1 className="sm:text-6xl text-4xl max-w-[708px] font-bold text-slate-900">
          Determine if your resume is a good fit for a job description.
        </h1>
        <p className="text-slate-500 mt-5">47,118 resumes reviewed.</p>
        <div className="max-w-xl w-full">
          <div className="flex mt-10 items-center space-x-3">
            <Image
              src="/1-black.png"
              width={30}
              height={30}
              alt="1 icon"
              className="mb-5 sm:mb-0"
            />
            <p className="text-left font-medium">
              Enter the job description{" "}
              <span className="text-slate-500">
                (or a link to the job description)
              </span>
              .
            </p>
          </div>
          <textarea
            required
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows={4}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black my-5"
            placeholder={
              "e.g. https://resources.workable.com/mortgage-loan-officer-job-description\n or \nWe are looking for a chef to join our team. You will be responsible for preparing and cooking meals for our customers. You will also be responsible for cleaning and maintaining the kitchen."
            }
          />
          <div className="flex mb-5 items-center space-x-3">
            <Image src="/2-black.png" width={30} height={30} alt="1 icon" />
            <p className="text-left font-medium">
              Upload your resume.{" "}
              <span className="text-slate-500">
                (Image, PDF, or Word Document)
              </span>
            </p>
          </div>
          {/* <div className="block">
            <DropDown vibe={vibe} setVibe={(newVibe) => setVibe(newVibe)} />
          </div> */}

          <div className="block">
            <Upload handleFileUpload={(file) => setResume(file)} />
          </div>

          {!loading && (
            <button
              className="bg-black rounded-xl text-white font-medium px-4 py-2 sm:mt-10 mt-8 hover:bg-black/80 w-full"
              onClick={(e) => generateRecommendations(e)}
            >
              Review resume &rarr;
            </button>
          )}
          {loading && (
            <button
              className="bg-black rounded-xl text-white font-medium px-4 py-2 sm:mt-10 mt-8 hover:bg-black/80 w-full"
              disabled
            >
              <LoadingDots color="white" style="large" />
            </button>
          )}
        </div>
        <Toaster
          position="top-center"
          reverseOrder={false}
          toastOptions={{ duration: 2000 }}
        />
        <hr className="h-px bg-gray-700 border-1 dark:bg-gray-700" />
        <div className="space-y-10 my-10">
          {generatedRecommendations && (
            <>
              <div>
                <h2
                  className="sm:text-4xl text-3xl font-bold text-slate-900 mx-auto"
                  ref={recommendationsRef}
                >
                  Resume Review
                </h2>
              </div>
              <div className="space-y-8 flex flex-col items-center justify-center max-w-xl mx-auto">
                {generatedRecommendations.length > 0 && (
                  <div
                    className="bg-white rounded-xl shadow-md p-4 hover:bg-gray-100 transition cursor-copy border"
                    onClick={() => {
                      navigator.clipboard.writeText(generatedRecommendations);
                      toast("Recommendations copied to clipboard", {
                        icon: "✂️",
                      });
                    }}
                    key={generatedRecommendations}
                  >
                    {generatedRecommendations.split("\n").map((line, i) => (
                      <p
                        key={i}
                        className="text-left mb-2
                      "
                      >
                        {line}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Home;

// .substring(generatedRecommendations.indexOf("1") + 3)
// .split("Bio")
// .filter((generatedBio) => generatedBio.length > 0)
// .slice(0, 2)
