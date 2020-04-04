import React, { useEffect, useRef, useState } from "react";
import download from "downloadjs";
import { format } from "date-fns";

function App() {
  const videoEl = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  useEffect(() => {
    const mediaRecorderOptions = { mimeType: "video/webm; codecs=vp8" };
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
      fetch("https://franks-gif-api.herokuapp.com/gif", {
        method: "POST",
        body: blob
      }).then(res => {
        res.blob().then(blob => {
          const timestamp = format(new Date(), "t");
          download(blob, `gif_${timestamp}.gif`, "image/gif");
        });
      });
    }
  }, [blob]);

  return (
    <div>
      <video autoPlay ref={videoEl}></video>
      <div>
        <button onClick={handleRecordGif}>
          record and download 3 second gif
        </button>
      </div>
    </div>
  );
}

export default App;
