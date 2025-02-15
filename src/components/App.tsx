import React, { useEffect, useRef, useState } from "react";
import download from "downloadjs";
import { format } from "date-fns";
import { useMediaRecorder } from "../hooks/useMediaRecorder";
import { track } from "../lib/analytics";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

type Phase = "READY" | "COUNTDOWN" | "RECORDING" | "PROCESSING" | "DONE";
function App() {
  const videoEl = useRef<HTMLVideoElement>(null);
  const [record, webmBlob] = useMediaRecorder(videoEl);
  const imgRef = useRef<HTMLImageElement>(null);
  const [gifBlob, setGifBlob] = useState<Blob | null>(null);
  if (gifBlob && imgRef.current) {
    imgRef.current.src = URL.createObjectURL(gifBlob);
  }

  useEffect(() => {
    setGifBlob(null);
    if (webmBlob) {
      setPhase("PROCESSING");
      fetch("https://franks-gif-api.herokuapp.com/gif", {
        method: "POST",
        body: webmBlob,
      }).then((res) => {
        res.blob().then((blob) => {
          setPhase("DONE");
          setGifBlob(blob);
        });
      });
    }
  }, [webmBlob, setGifBlob]);

  const [phase, setPhase] = useState<Phase>("READY");

  async function beginRecordingSequence(e: React.MouseEvent) {
    track("start recording");
    setPhase("COUNTDOWN");
    await wait(3000);
    setPhase("RECORDING");
    record();
  }

  function resetRecorder(e: React.MouseEvent) {
    track("reset");
    setPhase("READY");
  }

  function downloadGif() {
    track("download gif", { size: gifBlob?.size });
    if (gifBlob) {
      const timestamp = format(new Date(), "t");
      download(gifBlob, `gif_${timestamp}.gif`, "image/gif");
    }
  }

  let buttonState: {
    disabled: boolean;
    color: string;
    text: string;
    onClick?: (e: React.MouseEvent) => any;
  } = {
    disabled: false,
    color: "green",
    text: "record gif",
  };
  switch (phase) {
    case "READY": {
      buttonState = {
        disabled: false,
        color: "green",
        text: "record gif",
        onClick: beginRecordingSequence,
      };
      break;
    }
    case "COUNTDOWN": {
      buttonState = { disabled: true, color: "orange", text: "get ready..." };
      break;
    }
    case "RECORDING": {
      buttonState = { disabled: true, color: "red", text: "recording" };
      break;
    }
    case "PROCESSING": {
      buttonState = { disabled: true, color: "gray", text: "processing..." };
      break;
    }
    case "DONE": {
      buttonState = {
        disabled: false,
        color: "blue",
        text: "reset",
        onClick: resetRecorder,
      };
      break;
    }
  }

  return (
    <div style={{ maxWidth: "480px", margin: "0 auto", padding: "1rem" }}>
      <h3>gif yourself</h3>
      <div
        style={{
          marginBottom: "0.25rem",
        }}
      >
        <video
          ref={videoEl}
          style={{
            display: phase === "DONE" ? "none" : "block",
            width: "100%",
          }}
          autoPlay
        ></video>
        <img
          ref={imgRef}
          alt="the gif you recorded"
          style={{
            display: phase === "DONE" ? "block" : "none",
            width: "100%",
          }}
        />
      </div>
      <div>
        {phase === "DONE" && gifBlob !== null && (
          <button
            style={{
              display: "block",
              marginBottom: "0.25rem",
              border: 0,
              background: "black",
              color: "white",
              width: "100%",
              padding: "0.5rem",
              fontSize: "1.5rem",
              textTransform: "uppercase",
            }}
            onClick={downloadGif}
          >
            download GIF
          </button>
        )}
        <button
          disabled={buttonState.disabled}
          style={{
            display: "block",
            marginBottom: "0.25rem",
            border: 0,
            background: buttonState.color,
            color: "white",
            width: "100%",
            padding: "0.5rem",
            fontSize: "1.5rem",
            textTransform: "uppercase",
            position: "relative",
            overflow: "hidden",
          }}
          onClick={buttonState.onClick}
        >
          <div
            style={{
              top: 0,
              left:
                phase === "COUNTDOWN" || phase === "RECORDING"
                  ? "100%"
                  : "-100%",
              width: "100%",
              height: "100%",
              position: "absolute",
              opacity: 0.3,
              background: "white",
              transition:
                phase === "COUNTDOWN" || phase === "RECORDING"
                  ? "left 6s linear"
                  : "none",
            }}
          />
          {buttonState.text}
        </button>
      </div>
    </div>
  );
}

export default App;
