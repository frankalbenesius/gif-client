import React, { useEffect, useRef, useState } from "react";

function App() {
  const videoEl = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  useEffect(() => {
    const mediaRecorderOptions = { mimeType: "video/webm; codecs=vp9" };
    navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
      if (videoEl.current) {
        videoEl.current.srcObject = stream;
        mediaRecorderRef.current = new MediaRecorder(
          stream,
          mediaRecorderOptions
        );
        mediaRecorderRef.current.ondataavailable = handleDataAvailable;
      }
    });
  }, []);

  function handleRecordGif(e: React.MouseEvent) {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.start();
      setTimeout(() => {
        if (mediaRecorderRef.current) {
          mediaRecorderRef.current.stop();
        }
      }, 3000);
    }
  }

  const [blob, setBlob] = useState<Blob>();
  function handleDataAvailable(event: BlobEvent) {
    console.log("data-available");
    setBlob(event.data);
  }
  useEffect(() => {
    if (blob) {
      var url = URL.createObjectURL(blob);
      let a = document.createElement("a");
      document.body.appendChild(a);
      // a.style = "display: none";
      a.href = url;
      a.download = "test.webm";
      a.click();
      window.URL.revokeObjectURL(url);
    }
  }, [blob]);

  return (
    <div>
      <video autoPlay ref={videoEl}></video>
      <div>
        <button onClick={handleRecordGif}>record gif</button>
      </div>
    </div>
  );
}

export default App;
