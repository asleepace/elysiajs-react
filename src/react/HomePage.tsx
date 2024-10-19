import { useEffect, useState } from 'react'
import { InitialProps } from '../server/serverRender'
import '../styles.css'

export type HomePageProps = {
  message: string
}

export const getPageProps = (): InitialProps<HomePageProps> => ({
  message: 'Hello World',
  assetMap: {
    sourceFile: import.meta.url,
    // sourceFile: import.meta.path,
    cssStyles: '/styles.css',
  },
})

export default function HomePage({
  assetMap = {},
  ...props
}: InitialProps<HomePageProps>) {
  const [counter, setCounter] = useState(0)

  useEffect(() => {
    console.log('[effect] HomePage mounted: ', props)
    return () => {
      console.log('[cleanup] HomePage unmounted')
    }
  }, [])

  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="stylesheet" href={assetMap.cssStyles} />
        <title>Test</title>
      </head>
      <body>
        <div id="container">
          <h1>React Application</h1>
          <p>{props.message}</p>
          <p>Counter: {counter}</p>
          <button onClick={() => setCounter(counter + 1)}>Increment</button>
        </div>
      </body>
    </html>
  )
}
