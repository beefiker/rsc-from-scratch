import { readdir } from "fs/promises";
import Footer from "./Footer.js";
export default async function Layout({ children }) {
  const postFileList = await readdir("./posts");
  const postSlugs = postFileList.map((file) =>
    file.slice(0, file.lastIndexOf("."))
  );
  const author = "Beefiker";
  return (
    <html>
      <body>
        <nav style={{ display: "flex", gap: "10px" }}>
          <a href="/">Home</a>
          {postSlugs.map((slug) => (
            <a key={slug} href={`/${slug}`}>
              {slug}
            </a>
          ))}
        </nav>
        <main>{children}</main>
        <Footer author={author} />
      </body>
    </html>
  );
}
