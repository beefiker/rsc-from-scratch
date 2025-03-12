export default function throwNotFound(cause) {
  const notFound = new Error("Not found.", { cause });
  notFound.statusCode = 404;
  throw notFound;
}
