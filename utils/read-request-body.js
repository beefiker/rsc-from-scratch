// Helper function to read request body
export default async function readRequestBody(req) {
  try {
    if (req.method === "POST") {
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }
      const buffer = Buffer.concat(chunks);
      const body = JSON.parse(buffer.toString());
      return body;
    } else {
      if (req.method === "GET") {
        // do something
      }
    }
  } catch (err) {
    console.log("error in readRequestBody", err);
  }
}
