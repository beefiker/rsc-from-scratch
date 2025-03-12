export default async function CommentForm({ slug }) {
  return (
    <form action="/api/comment" method="POST">
      <input type="text" name="author" placeholder="Beefiker" />
      <input type="text" name="comment" placeholder="Enter your comment" />
      <input type="hidden" name="postId" value={slug} />
      <button type="submit">Add</button>
    </form>
  );
}
