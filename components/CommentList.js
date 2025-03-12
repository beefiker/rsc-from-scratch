import { readFile } from "fs/promises";
import throwNotFound from "../utils/not-found.js";

export default async function CommentList({ slug }) {
  let comments;
  try {
    const commentsData = await readFile(`./comments/${slug}.json`, "utf8");
    comments = JSON.parse(commentsData);
  } catch (err) {
    throwNotFound(err);
  }
  return (
    <div>
      {comments.map((comment, idx) => (
        <div
          key={comment.id}
          style={{
            borderBottom:
              idx === comments.length - 1 ? "none" : "1px solid #ccc",
          }}
        >
          <p style={{ marginBlock: "3px" }}>{comment.content}</p>
          <span style={{ fontSize: "12px", marginRight: "6px" }}>
            {comment.author}
          </span>
          <span style={{ fontSize: "12px" }}>{comment.createdAt}</span>
        </div>
      ))}
    </div>
  );
}
