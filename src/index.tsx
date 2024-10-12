import { Elysia } from 'elysia'
import { staticPlugin } from '@elysiajs/static'
import HomePage from './react/HomePage'

import { serverRender } from './server/serverRender'

const app = new Elysia()
  .use(staticPlugin())
  // .use(
  // reactPlugin({
  //   publicPath: 'public',
  //   verbose: true,
  // })
  // )
  .state('props', {
    message: 'Hello World',
  })
  .onStart(async () => {
    // console.log('[index] app started')
    // await Bun.build({
    //   entrypoints: ['./src/react/index.tsx'],
    //   outdir: 'server-components',
    // })
  })
  .get('/', async () => {
    return serverRender({
      // module: HomePageSource,
      module: 'src/react/HomePage.tsx',
      props: {
        message: 'Hello World',
      },
      buildConfig: {
        outdir: 'public',
        naming: {
          asset: '[name].[ext]',
        },
      },
    })
  })

  .get('/server-component', async () => {
    // console.log('[index] server-component called!')
    // const stream = await writeToStream({
    //   component: <ServerComponent />,
    //   clientBundle: {
    //     clientSideJS: '',
    //     clientTempTS: '',
    //     extraModules: [],
    //   },
    // })
    // return new Response(stream, {
    //   headers: {
    //     'Content-Type': 'text/html',
    //   },
    // })
  })
  .get('/hello', () => () => <HomePage message="Hello World" />)
  .get('/styles.css', () => {
    console.log('[index] serving styles.css')
    return Bun.file('public/styles.css')
  })
  .get('/author/:name', ({ params, set }) => {
    set.headers['Content-Type'] = 'application/json'
    console.log('[index] author name:', params.name)
    return {
      name: params.name,
    }
  })
  .listen(3000)

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
)
