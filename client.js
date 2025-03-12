import { hydrateRoot } from "react-dom/client";

const root = hydrateRoot(document, getInitialClientJSX());
let currentPathname = window.location.pathname;

const backgroundColorMap = new Map();
function setRandomBackgroundColor(pathname) {
  const body = document.body;
  const backgroundColor = `#${Math.floor(Math.random() * 16777215).toString(
    16
  )}`;
  backgroundColorMap.set(pathname, backgroundColor);
  body.style.backgroundColor = backgroundColor;
}

const cacheMap = new Map();
cacheMap.set(currentPathname, getInitialClientJSX());
setRandomBackgroundColor(currentPathname);

async function navigate(pathname, cache = false) {
  currentPathname = pathname;

  if (backgroundColorMap.has(pathname)) {
    document.body.style.backgroundColor = backgroundColorMap.get(pathname);
  } else {
    setRandomBackgroundColor(pathname);
  }
  if (cache && cacheMap.has(pathname)) {
    console.log(`[CACHE] ${pathname} is cached`);
    root.render(cacheMap.get(pathname));
    return;
  }

  const clientJSX = await fetchClientJSX(pathname);
  cacheMap.set(pathname, clientJSX);
  if (pathname === currentPathname) {
    root.render(clientJSX);
  }
}

function getInitialClientJSX() {
  const clientJSX = JSON.parse(window.__INITIAL_CLIENT_JSX_STRING__, parseJSX);
  return clientJSX;
}

async function fetchClientJSX(pathname) {
  const response = await fetch(pathname + "?jsx");
  const clientJSXString = await response.text();
  const clientJSX = JSON.parse(clientJSXString, parseJSX);
  return clientJSX;
}

function parseJSX(key, value) {
  if (value === "$RE") {
    return Symbol.for("react.transitional.element");
  } else if (typeof value === "string" && value.startsWith("$$")) {
    return value.slice(1);
  } else {
    return value;
  }
}

window.addEventListener(
  "click",
  (e) => {
    if (e.target.tagName !== "A") {
      return;
    }
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
      return;
    }
    const href = e.target.getAttribute("href");
    if (!href.startsWith("/")) {
      return;
    }
    e.preventDefault();
    window.history.pushState(null, null, href);
    navigate(href);
  },
  true
);

window.addEventListener("popstate", () => {
  navigate(window.location.pathname, true);
});

window.addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);
  const response = await fetch(form.action, {
    method: form.method,
    body: JSON.stringify(Object.fromEntries(formData)),
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (response.ok) {
    navigate(window.location.pathname);
    // resets the values of the form
    for (const input of form.elements) {
      if (input.type === "submit") {
        //
      } else {
        input.value = "";
      }
    }
  }
});
