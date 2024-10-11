import React, { useEffect } from "react";
import { HTMLPage } from "./HTMLPage";

export type HomePageProps = {
  message: string;
};

export default function HomePage(props: HomePageProps) {
  const [counter, setCounter] = React.useState(0);

  useEffect(() => {
    console.log("[effect] HomePage mounted: ", props);
    return () => {
      console.log("[cleanup] HomePage unmounted");
    };
  }, []);

  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Document</title>
      </head>
      <body>
        <div>
          <h1>React Application</h1>
          <p>{props.message}</p>
          <p>Counter: {counter}</p>
          <button onClick={() => setCounter(counter + 1)}>Increment</button>
        </div>
      </body>
    </html>
  );
}
