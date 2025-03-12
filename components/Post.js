import { readFile } from "fs/promises";
import Markdown from "react-markdown";
import throwNotFound from "../utils/not-found.js";

export default async function Post({ slug }) {
  let content;
  try {
    content = await readFile("./posts/" + slug + ".md", "utf8");
  } catch (err) {
    throwNotFound(err);
  }
  return (
    <section>
      <h2>
        <a href={"/" + slug}>{slug}</a>
      </h2>
      <article key={slug}>
        <Markdown key={slug}>{content}</Markdown>
      </article>
    </section>
  );
}
