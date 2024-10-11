# ElysiaJS - React SSR

This package provides a simple way to server side render your React application with ElysiaJS.

```tsx
const app = new Elysia()
  .use(
    reactPlugin({
      publicPath: "public",
    })
  )
  .get("/", () => <HomePage message="Hello World!" />)
  .listen(3000);
```

## Installation

```bash
bun add asleepace/elysiajs-react
```

## Usage

To get started import the `reactPlugin` from the package and use it with the `use` method of the Elysia instance, you can specify several configuration options to customize the behavior of the plugin.

```tsx
import { reactPlugin } from "elysiajs-react";

const app = new Elysia()
  .use(
    reactPlugin({
      publicPath: "public",
      waitForStream: true,
      tempDir: "src",
    })
  )
  .get("/", () => <HomePage message="Hello World!" />)
  .listen(3000);
```

## Caveats

You will need to create an `HTMLContainer` component that will be used to render the React application, this component will receive the `children` prop that will be the React application.

```tsx
import React from "react";

export const HTMLContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <html>
    <head>
      <title>ElysiaJS React SSR</title>
    </head>
    <body>
      <div id="root">{children}</div>
    </body>
  </html>
);
```

Then when creating new pages you will need to wrap the component with the `HTMLContainer` component.

```tsx
import React from "react";
import { HTMLContainer } from "./HTMLContainer";

export const HomePage: React.FC<{ message: string }> = ({ message }) => (
  <HTMLContainer>
    <h1>{message}</h1>
  </HTMLContainer>
);
```

Otherwise the plugin will insert the scripts / initial props outside the `#root` div.