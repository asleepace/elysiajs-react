import { Elysia } from 'elysia'
import { staticPlugin } from '@elysiajs/static'
import HomePage, { getPageProps } from './react/HomePage'

import { ssr } from './server/serverRender'
import { reactPlugin } from './reactPlugin'

const app = new Elysia()
  .use(staticPlugin())
  .use(reactPlugin({}))
  .state('props', {
    message: 'Hello World',
  })
  .get('/', async () => {
    return ssr({
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

  .get('/rsc/*', async () => {
    // TODO: Track all server components
  })
  .get('/hello', () => <HomePage {...getPageProps()} />)
  .get('/styles.css', () => Bun.file('public/styles.css'))
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
