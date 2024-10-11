import React, { useEffect } from "react";
import { HTMLPage } from "./HTMLPage";

export type HomePageProps = {
  message: string;
};

export default function HomePage(props: HomePageProps) {
  const [counter, setCounter] = React.useState(0);

  useEffect(() => {
    console.log("[effect] HomePage mounted");
    return () => {
      console.log("[cleanup] HomePage unmounted");
    };
  }, []);

  return (
    <HTMLPage>
      <div>
        <h1>Hello, world!</h1>
        <p>{props.message}</p>
        <p>Counter: {counter}</p>
        <button onClick={() => setCounter(counter + 1)}>Increment</button>
      </div>
    </HTMLPage>
  );
}
