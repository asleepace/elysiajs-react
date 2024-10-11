import { Elysia } from "elysia";
import { reactPlugin } from "./reactPlugin";
import { staticPlugin } from "@elysiajs/static";
import HomePage from "./test/HomePage";
import React from "react";

const app = new Elysia()
  .use(
    staticPlugin({
      prefix: "public",
    })
  )
  .use(
    reactPlugin({
      publicPath: "public",
    })
  )
  .get("/", () => <HomePage message="Another One" />)
  .get("/hello", (ctx) => (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Document</title>
      </head>
      <body>
        <h1>Hello World</h1>
      </body>
    </html>
  ))
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
