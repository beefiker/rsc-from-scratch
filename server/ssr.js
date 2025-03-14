import { readFile } from "fs/promises";
import { createServer } from "http";
import { renderToString } from "react-dom/server";
import readRequestBody from "../utils/read-request-body.js";

// This is a server to host CDN distributed resources like static files and SSR.

createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    if (url.pathname.startsWith("/api/")) {
      await forwardRequest(req, res);
      return;
    }

    if (url.pathname === "/client.js") {
      const content = await readFile("./client.js", "utf8");
      res.setHeader("Content-Type", "text/javascript");
      res.end(content);
      return;
    }
    const response = await fetch("http://127.0.0.1:3001" + url.pathname);
    if (!response.ok) {
      res.statusCode = response.status;
      res.end();
      return;
    }
    const clientJSXString = await response.text();

    if (url.searchParams.has("jsx")) {
      res.setHeader("Content-Type", "application/json");
      res.end(clientJSXString);
    } else {
      const clientJSX = JSON.parse(clientJSXString, parseJSX);
      let html = renderToString(clientJSX);
      html += `<script>window.__INITIAL_CLIENT_JSX_STRING__ = `;
      html += JSON.stringify(clientJSXString).replace(/</g, "\\u003c");
      html += `</script>`;
      html += `
        <script type="importmap">
          {
            "imports": {
              "react": "https://esm.sh/react@19.0.0",
              "react-dom/client": "https://esm.sh/react-dom@19.0.0/client",
              "react-dom/server": "https://esm.sh/react-dom@19.0.0/server"
            }
          }
        </script>
        <script type="module" src="/client.js"></script>
      `;
      res.setHeader("Content-Type", "text/html");
      res.end(html);
    }
  } catch (err) {
    console.error(err);
    res.statusCode = err.statusCode ?? 500;
    res.end();
  }
}).listen(3000);

function parseJSX(key, value) {
  if (value === "$RE") {
    return Symbol.for("react.transitional.element");
  } else if (typeof value === "string" && value.startsWith("$$")) {
    return value.slice(1);
  } else {
    return value;
  }
}

async function forwardRequest(req, res) {
  const reqBody = await readRequestBody(req);
  const body = JSON.stringify(reqBody);
  const url = new URL(req.url, `http://${req.headers.host}`);
  const response = await fetch(
    "http://127.0.0.1:3001" +
      url.pathname +
      (url.searchParams.size > 0 ? "?" + url.searchParams.toString() : ""),
    {
      method: req.method,
      body,
    }
  );
  const responseBody = await response.text();
  res.setHeader("Content-Type", "application/json");
  res.end(responseBody);
}
