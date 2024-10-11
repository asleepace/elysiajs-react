# ElysiaJS - React SSR

This package provides a simple way to server side render your React application with ElysiaJS.

```tsx
const app = new Elysia()
  .use(
    reactPlugin({
      publicPath: 'public',
    })
  )
  .get('/', () => <HomePage message="Hello World!" />)
  .listen(3000)
```

## Installation

```bash
bun add asleepace/elysiajs-react
```

## Usage

To get started import the `reactPlugin` from the package and use it with the `use` method of the Elysia instance, you can specify several configuration options to customize the behavior of the plugin.

```tsx
import { reactPlugin } from 'elysiajs-react'

const app = new Elysia()
  .use(
    reactPlugin({
      publicPath: 'public',
      waitForStream: true,
      tempDir: 'src',
    })
  )
  .get('/', () => <HomePage message="Hello World!" />)
  .listen(3000)
```

## React Server Components

The following section is about React Server Components, if you are not using React Server Components you can skip this section.

https://react.dev/blog/2024/04/25/react-19-upgrade-guide

## Troubleshooting

If you encounter any hydration try checking the following things:

- Disable all browser extensions
- Remove any `new Date()` rendered on the server & client
- Make sure all the HTML is valid
- Check TS config settings below

## TSConfig

Please add the following to your `tsconfig.json` file, for more information please visit https://legacy.reactjs.org/blog/2020/09/22/introducing-the-new-jsx-transform.html

```json
{
  "compilerOptions": {
    "target": "ES2021",
    "jsx": "react-jsx",
    // "jsxFactory": "React.createElement",
    "moduleResolution": "node",
    "types": ["bun-types"],
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true
  }
}
```
