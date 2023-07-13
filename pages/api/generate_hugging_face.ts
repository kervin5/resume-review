import { OpenAIStream, OpenAIStreamPayload } from "../../utils/OpenAIStream";

import { HfInference } from "@huggingface/inference";
import { HuggingFaceStream, StreamingTextResponse } from "ai";

// Create a new Hugging Face Inference instance
const Hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

export const config = {
  runtime: "edge",
};

const handler = async (req: Request): Promise<Response> => {
  // Extract the `prompt` from the body of the request
  const { prompt } = await req.json();

  const response = await Hf.textGenerationStream({
    model: "OpenAssistant/oasst-sft-4-pythia-12b-epoch-3.5",
    inputs: `<|prompter|>${prompt}<|endoftext|><|assistant|>`,
    parameters: {
      max_new_tokens: 200,
      // @ts-ignore (this is a valid parameter specifically in OpenAssistant models)
      typical_p: 0.2,
      repetition_penalty: 1,
      truncate: 1000,
      return_full_text: false,
    },
  });

  console.log(response);

  // Convert the response into a friendly text-stream
  const stream = HuggingFaceStream(response);

  // Respond with the stream
  return new StreamingTextResponse(stream);
};

export default handler;

// export async function POST(req: Request) {
//   // Extract the `messages` from the body of the request
//   const { messages } = await req.json()

//   // Initialize a text-generation stream using the Hugging Face Inference SDK
//   const response = await Hf.textGenerationStream({
//     model: 'OpenAssistant/oasst-sft-4-pythia-12b-epoch-3.5',
//     inputs: buildOpenAssistantPrompt(messages),
//     parameters: {
//       max_new_tokens: 200,
//       // @ts-ignore (this is a valid parameter specifically in OpenAssistant models)
//       typical_p: 0.2,
//       repetition_penalty: 1,
//       truncate: 1000,
//       return_full_text: false
//     }
//   })

//   // Convert the async generator into a friendly text-stream
//   const stream = HuggingFaceStream(response)

//   // Respond with the stream, enabling the client to consume the response
//   return new StreamingTextResponse(stream)
// }
