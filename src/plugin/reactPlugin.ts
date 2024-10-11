import Elysia from "elysia";
import { ReactSSR, type ReactSSRConfig } from "./ReactSSR";
import { renderToReadableStream } from "react-dom/server.browser";
import { source } from './source'
import { findImports } from "./findImports";
import { plugin } from 'bun';

export const reactPlugin = (config: ReactSSRConfig) => (app: Elysia) =>
  app
    .decorate('reactSources', new Array<string>())
    .decorate('ssr', new ReactSSR(config))
    .onStart(async ({ decorator }) => {
      const sources = await findImports(Bun.main)
      decorator.reactSources.push(...sources)
    })
    .onStart(async (ctx) => {
      // delete the client side js file
    })
    .onAfterHandle(async ({ response, reactSources }) => {
      console.log("[reactPlugin] onAfterHandler", response)
      console.log("[reactPlugin] type", typeof response)
      console.log("[reactPlugin] is React Element", reactSources)

      if ('$$typeof' in response) {
        console.log("[reactPlugin] React Element")
      } else {
        return response
      }

      Object.entries(response).forEach(([key, value]) => {
        console.log(`[reactPlugin] ${key}:`, value)
      })

      const componentName = response['type']['name']
      const importStatement = await source(response, reactSources)
      const generatedSource = `
import React from 'react'
import { hydrateRoot } from 'react-dom/client'
${importStatement}

const props = window.__INITIAL_PROPS__ || {}

hydrateRoot(document, <${componentName} {...props} />)`



      const tempFile = await Bun.write('./src/client.tsx', generatedSource)
      console.log("[reactPlugin] tempFile", tempFile)

      const build = await Bun.build({
        entrypoints: ['./src/client.tsx'],
        outdir: 'public',
        naming: '[name]-[hash].[ext]',
      })

      console.log("[reactPlugin] build", build)

      const clientSideJS = build.outputs[0].path

      if (!clientSideJS) {
        throw new Error('Client side JS not found')
      }

      console.log("[reactPlugin] generatedClient", clientSideJS)

      const props = JSON.stringify(response['props'] || {})

      const stream = await renderToReadableStream(response, {
        bootstrapScriptContent: `window.__INITIAL_PROPS__ = ${props}`,
        bootstrapScripts: [clientSideJS],
      })

      return new Response(stream, {
        headers: {
          "Content-Type": "text/html",
        },
      })
    })