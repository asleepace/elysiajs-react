import React from "react";
import { renderToReadableStream } from 'react-dom/server.browser'


export type ReactSSRConfig = {}



export class ReactSSR {

  constructor(private config: ReactSSRConfig) {
    console.log("ReactSSR.constructor", config)
  }


  public async serve<P extends {}>(component: React.FC<P>, props?: P) {
    // create the react element
    const element = React.createElement(component, props)

    // render the element to a readable stream
    const stream = await renderToReadableStream(element, {
      bootstrapScriptContent: "",
      bootstrapScripts: [],
    })

    // return the response
    return new Response(stream, {
      headers: {
        "Content-Type": "text/html",
      },
    })
  }
}