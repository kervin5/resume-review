export const config = {
  runtime: "edge",
};

const handler = async (req: Request): Promise<Response> => {
  const { url } = (await req.json()) as {
    url: string;
  };

  let webSitetext = "";

  const response = await fetch(
    (process.env.PYTHON_API_ENDPOINT + "/website-to-text") as string,
    {
      method: "POST",
      body: JSON.stringify({ url: url }),
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  // Get the text from the response
  if (response.status === 200) {
    webSitetext = await response.text();
  }

  return new Response(JSON.stringify({ text: webSitetext }), {
    headers: { "content-type": "application/json" },
  });
};

export default handler;
