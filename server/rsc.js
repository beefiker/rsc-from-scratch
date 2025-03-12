import { createServer } from "http";
import Router from "../components/Router.js";
// This is a server to host data-local resources like databases and RSC.

createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    if (url.pathname.startsWith("/api/")) {
      // get rid of /api/
      const actionName = url.pathname.slice(5);
      await action(actionName, req, res);
      return;
    }
    await sendJSX(res, <Router url={url} />);
  } catch (err) {
    res.statusCode = err.statusCode ?? 500;
    res.end();
  }
}).listen(3001);

async function sendJSX(res, jsx) {
  const clientJSX = await renderJSXToClientJSX(jsx);
  const clientJSXString = JSON.stringify(clientJSX, stringifyJSX);
  res.setHeader("Content-Type", "application/json");
  res.end(clientJSXString);
}

function stringifyJSX(key, value) {
  if (value === Symbol.for("react.transitional.element")) {
    return "$RE";
  } else if (typeof value === "string" && value.startsWith("$")) {
    return "$" + value;
  } else {
    return value;
  }
}

async function renderJSXToClientJSX(jsx) {
  if (
    typeof jsx === "string" ||
    typeof jsx === "number" ||
    typeof jsx === "boolean" ||
    jsx == null
  ) {
    return jsx;
  } else if (Array.isArray(jsx)) {
    return Promise.all(jsx.map((child) => renderJSXToClientJSX(child)));
  } else if (jsx != null && typeof jsx === "object") {
    if (jsx.$$typeof === Symbol.for("react.transitional.element")) {
      if (typeof jsx.type === "string") {
        return {
          ...jsx,
          props: await renderJSXToClientJSX(jsx.props),
        };
      } else if (typeof jsx.type === "function") {
        const Component = jsx.type;
        const props = jsx.props;
        const returnedJsx = await Component(props);
        return renderJSXToClientJSX(returnedJsx);
      } else if (jsx.type === Symbol.for("react.fragment")) {
        return await renderJSXToClientJSX(jsx.props.children);
      } else {
        console.log("jsx.type does not exist", jsx.type);
        throw new Error("Not implemented.");
      }
    } else {
      return Object.fromEntries(
        await Promise.all(
          Object.entries(jsx).map(async ([propName, value]) => [
            propName,
            await renderJSXToClientJSX(value),
          ])
        )
      );
    }
  } else {
    throw new Error("Not implemented");
  }
}

async function action(name, req, res) {
  const module = await import(`../actions/${name}.js`);
  const moduleFn = module.default;
  await moduleFn(req, res);
}
