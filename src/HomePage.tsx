import { useEffect, useState } from 'react'
import './styles.css'

export type HomePageProps = {
  message: string
}

export default function HomePage(props: HomePageProps) {
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
        <link rel="stylesheet" href="/styles.css" />
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
