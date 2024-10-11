import { Elysia } from 'elysia'
import { reactPlugin } from './reactPlugin'
import { staticPlugin } from '@elysiajs/static'
import HomePage from './HomePage'
import React from 'react'

const app = new Elysia()
  .use(staticPlugin())
  .use(
    reactPlugin({
      publicPath: 'public',
      verbose: true,
    })
  )
  .get('/', () => <HomePage message="Another One" />)
  .get('/hello', () => () => <HomePage message="Hello World" />)
  .get('/styles.css', () => {
    console.log('[index] serving styles.css')
    return Bun.file('public/styles.css')
  })
  .listen(3000)

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
)
