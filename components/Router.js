import sanitizeFilename from "sanitize-filename";
import IndexPage from "../pages/IndexPage.js";
import PostPage from "../pages/PostPage.js";
import Layout from "./Layout.js";

export default function Router({ url }) {
  let page;
  if (url.pathname === "/") {
    page = <IndexPage />;
  } else {
    const postSlug = sanitizeFilename(url.pathname.slice(1));
    page = <PostPage postSlug={postSlug} />;
  }
  return <Layout>{page}</Layout>;
}
