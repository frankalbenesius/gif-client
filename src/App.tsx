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
        body: blob,
      }).then((res) => {
        res.blob().then((blob) => {
          const timestamp = format(new Date(), "t");
          download(blob, `gif_${timestamp}.gif`, "image/gif");
        });
      });
    }
  }, [blob]);

  return (
    <div style={{ maxWidth: "640px", margin: "0 auto", padding: "1rem" }}>
      <div
        style={{
          width: "100%",
          maxWidth: "640px",
          backgroundColor: "black",
          position: "relative",
          marginBottom: "0.25rem",
        }}
      >
        <div
          style={{
            width: "100%",
            paddingTop: "75%",
          }}
        ></div>
        <video
          style={{ top: 0, left: 0, position: "absolute", width: "100%" }}
          autoPlay
          ref={videoEl}
        ></video>
      </div>
      <div>
        <button
          style={{
            border: 0,
            background: "green",
            color: "white",
            width: "100%",
            padding: "0.5rem",
            fontSize: "1.5rem",
            textTransform: "uppercase",
          }}
          onClick={() => record()}
        >
          record gif
        </button>
      </div>
    </div>
  );
}

export default App;

type HookValues = [() => void, Blob | null];
function useMediaRecorder(
  videoRef: React.RefObject<HTMLVideoElement>
): HookValues {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  useEffect(() => {
    const mediaRecorderOptions = { mimeType: "video/webm; codecs=vp8" };
    navigator.mediaDevices
      .getUserMedia({ audio: false, video: { width: 640, height: 480 } })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          mediaRecorderRef.current = new MediaRecorder(
            stream,
            mediaRecorderOptions
          );
          mediaRecorderRef.current.ondataavailable = handleDataAvailable;
        }
      })
      .catch((e) => {
        console.error("mediaDevices.getUserMedia failed with error:", e);
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

  return [record, blob];
}
