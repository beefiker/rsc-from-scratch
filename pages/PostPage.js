import CommentForm from "../components/CommentForm.js";
import CommentList from "../components/CommentList.js";
import Post from "../components/Post.js";

export default function PostPage({ postSlug }) {
  return (
    <div key={postSlug}>
      <Post slug={postSlug} />
      <CommentForm slug={postSlug} />
      <CommentList slug={postSlug} />
    </div>
  );
}
