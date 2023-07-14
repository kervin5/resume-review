import {
  ChatGPTAgent,
  OpenAIStream,
  OpenAIStreamPayload,
} from "../../utils/OpenAIStream";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing env var from OpenAI");
}

export const config = {
  runtime: "edge",
};

const buildMessages = ({
  resume,
  jobDescription,
}: {
  resume: string;
  jobDescription: string;
}) => {
  return [
    {
      role: "system" as ChatGPTAgent,
      // content:
      //   "You are a recruiter reviewing a resume for a job opening. The job description is below. My resume is below that. You tell me if my resume is a good fit for the job. You tell me the reasons why it is or isn't a good fit. You give me advice about what can I do to improve my skills or experience if I'm not a good match. The review provides actional items specific to the job description.",
      content:
        "You are a recruiter reviewing a resume for a job opening. The job description is below. My resume is below that. You tell me if my resume is a good fit for the job. You tell me the reasons why it is or isn't a good fit. You tell me the top 5 things I need learn, add or rephrase or add to my resume to make it a better fit for the job. You tell me the specific lines or phrases I need to update",
    },
    {
      role: "user" as ChatGPTAgent,
      content:
        "Job Description: " +
        jobDescription +
        "\nResume: " +
        resume +
        "\nReview:",
    },
  ];
};

const handler = async (req: Request): Promise<Response> => {
  const { resume, jobDescription } = (await req.json()) as {
    resume: string;
    jobDescription: string;
  };

  const prompts = buildMessages({ resume, jobDescription });

  if (!prompts) {
    return new Response("No prompt in the request", { status: 400 });
  }

  const payload: OpenAIStreamPayload = {
    model: "gpt-3.5-turbo",
    messages: prompts,
    temperature: 0.5,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    // max_tokens: 200,
    stream: true,
    n: 1,
  };

  const stream = await OpenAIStream(payload);
  // return stream response (SSE)
  return new Response(stream, {
    headers: new Headers({
      // since we don't use browser's EventSource interface, specifying content-type is optional.
      // the eventsource-parser library can handle the stream response as SSE, as long as the data format complies with SSE:
      // https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events#sending_events_from_the_server

      // 'Content-Type': 'text/event-stream',
      "Cache-Control": "no-cache",
    }),
  });
};

export default handler;
