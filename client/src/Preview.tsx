import { createRef, useEffect } from "react";
import { store } from "./utils";

export const Preview = () => {
  const frame = createRef<HTMLIFrameElement>();
  const swc = store.app.value.swc.subscribe((val) => console.log("swc", val));

  useEffect(() => {
    if (!frame.current) {
      return;
    }

    frame.current.addEventListener("message", (ev) => {
      // console.log(ev);
    });

    return () => {
      swc.unsubscribe();
    };
  }, [frame.current]);

  return (
    <div>
      <iframe
        src="https://vzr7nv-3001.preview.csb.app"
        ref={frame}
        style={{
          width: "100%",
          height: "100vh",
        }}
      ></iframe>
    </div>
  );
};
