export type HTMLContainerProps = React.PropsWithChildren<{
  title?: string
}>

export default function HTMLContainer(props: HTMLContainerProps) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="stylesheet" href="/styles.css" />
        <title>props.title</title>
      </head>
      <body>
        <div id="container">
          <h1>React Application</h1>
          {props.children}
        </div>
      </body>
    </html>
  )
}
