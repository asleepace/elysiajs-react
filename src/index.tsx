import { Elysia } from "elysia";
import { reactPlugin } from "./reactPlugin";
import { staticPlugin } from "@elysiajs/static";
import HomePage from "./test/HomePage";
import React from "react";

const app = new Elysia()
  .use(staticPlugin())
  .use(
    reactPlugin({
      publicPath: "public",
    })
  )
  .get("/", () => <HomePage message="Another One" />)
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
