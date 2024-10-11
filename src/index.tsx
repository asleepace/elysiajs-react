import { Elysia } from 'elysia'
import { reactPlugin } from './reactPlugin'
import { staticPlugin } from '@elysiajs/static'
import HomePage from './HomePage'
import { writeToStream } from './utils/writeToStream'

const app = new Elysia()
  .use(staticPlugin())
  .use(
    reactPlugin({
      publicPath: 'public',
      verbose: true,
    })
  )
  .state('props', {
    message: 'Hello World',
  })
  .onStart(async () => {
    console.log('[index] app started')

    await Bun.build({
      entrypoints: ['./src/react/index.tsx'],
      outdir: 'server-components',
    })
  })
  .get('/', ({ store: { props } }) => <HomePage {...props} />)
  .get('/server-component', async () => {
    console.log('[index] server-component called!')

    const { default: ServerComponent }: any = await import(
      '../server-components/index.js'
    )

    console.log('[index] ServerComponent:', ServerComponent)
    const stream = await writeToStream({
      component: <ServerComponent />,
      clientBundle: {
        clientSideJS: '',
        clientTempTS: '',
        extraModules: [],
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/html',
      },
    })
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
