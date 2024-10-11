import { Elysia } from "elysia";
import { reactPlugin } from "./reactPlugin";
import HomePage from './test/HomePage';
import React from 'react';

const app = new Elysia()
  .use(reactPlugin({
    publicPath: 'public',
  }))
  .get('/', () => <HomePage message="Hello World!" />)
  .get('*', ({ request }) => {
    const publicFile = request.url.split('public/').pop()!
    return Bun.file(`./public/${publicFile}`)
  })
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
