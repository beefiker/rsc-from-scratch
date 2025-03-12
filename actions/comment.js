import { readFile, writeFile } from "fs/promises";
import readRequestBody from "../utils/read-request-body.js";

export default async function addCommentToPost(req, res) {
  const requestBody = await readRequestBody(req);
  const body = JSON.stringify(requestBody);
  const { postId, comment, author } = JSON.parse(body);

  let comments = [];
  try {
    const file = await readFile(`./comments/${postId}.json`, "utf8");
    comments = JSON.parse(file);
  } catch (e) {
    console.log("error reading comments file", e);
  }

  const newComment = {
    id: comments.length + 1,
    content: comment,
    author,
    createdAt: new Date().toISOString(),
  };

  comments.push(newComment);
  await writeFile(
    `./comments/${postId}.json`,
    JSON.stringify(comments, null, 2),
    "utf8"
  );
  res.statusCode = 200;
  res.end(JSON.stringify({ message: "Comment added" }));
}
