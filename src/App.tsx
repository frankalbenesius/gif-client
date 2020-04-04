import React, { useEffect, useRef, useState } from "react";
import download from "downloadjs";
import { format } from "date-fns";

function App() {
  const videoEl = useRef<HTMLVideoElement>(null);
  const [record, blob] = useMediaRecorder(videoEl);
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
        <button onClick={() => record()}>
          record and download 3 second gif
        </button>
      </div>
    </div>
  );
}

export default App;


type HookValues = [() => void, Blob | null]
function useMediaRecorder(videoRef: React.RefObject<HTMLVideoElement>): HookValues {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  useEffect(() => {
    const mediaRecorderOptions = { mimeType: "video/webm; codecs=vp8" };
    navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        mediaRecorderRef.current = new MediaRecorder(
          stream,
          mediaRecorderOptions
        );
        mediaRecorderRef.current.ondataavailable = handleDataAvailable;
      }
    });
  }, [videoRef]);

  function record() {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.start();
      setTimeout(() => {
        if (mediaRecorderRef.current) {
          mediaRecorderRef.current.stop();
        }
      }, 3000);
    }
  }

  const [blob, setBlob] = useState<Blob | null>(null);
  function handleDataAvailable(event: BlobEvent) {
    console.log("data-available");
    setBlob(event.data);
  }

  return [record, blob]
}