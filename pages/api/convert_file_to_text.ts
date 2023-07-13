export const config = {
  runtime: "edge",
};

const handler = async (req: Request): Promise<Response> => {
  let fileText: string | undefined;
  // Request contains a file to convert to text and was sent as form data
  if (req.headers.get("content-type")?.includes("multipart/form-data")) {
    const formData = await req.formData();
    const file = formData.get("file");

    const requestFormData = new FormData();
    requestFormData.append("file", file as Blob);
    // POST the file to the the python API endpoint which is defined in the env var `PYTHON_API_ENDPOINT`
    // The endpoint is expecting a form data object with a file attribute
    const response = await fetch(
      (process.env.PYTHON_API_ENDPOINT + "/convert-file-to-text") as string,
      {
        method: "POST",
        body: requestFormData,
      }
    );

    // Get the text from the response
    fileText = await response.text();
  }

  //Return JSON response with text attribute
  return new Response(JSON.stringify({ text: fileText }), {
    headers: { "content-type": "application/json" },
  });
};

export default handler;
