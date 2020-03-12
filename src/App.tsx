import React, { useEffect, useRef } from "react";

function App() {
  const videoEl = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
      if (videoEl.current) {
        videoEl.current.srcObject = stream;
      }
    });
  }, []);

  return (
    <div>
      <video autoPlay ref={videoEl}></video>
      <p>this is good shit</p>
    </div>
  );
}

export default App;
