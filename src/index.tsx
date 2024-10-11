import { Elysia } from "elysia";
import { reactPlugin } from "./plugin/reactPlugin";
import HomePage from './test/HomePage';
import React from 'react';

const app = new Elysia()
  .use(reactPlugin({

  }))
  .get("/", () => "Hello Elysia")
  .get("/home", ({ ssr }) => ssr.serve(HomePage, { message: "Hello World!" }))
  .get('/elem', () => <HomePage message="Hello World!" />)
  .get('*', ({ request }) => {
    const publicFile = request.url.split('public/').pop()!
    return Bun.file(`./public/${publicFile}`)
  })
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
