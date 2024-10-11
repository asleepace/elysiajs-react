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

## Troubleshooting

If you encounter any hydration try checking the following things:

- Disable all browser extensions
- Remove any `new Date()` rendered on the server & client
- Make sure all the HTML is valid