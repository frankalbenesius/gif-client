import { useRef, useEffect, useState } from "react";

type HookValues = [() => void, Blob | null];
export function useMediaRecorder(
  videoRef: React.RefObject<HTMLVideoElement>
): HookValues {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  useEffect(() => {
    const mediaRecorderOptions = { mimeType: "video/webm; codecs=vp8" };
    navigator.mediaDevices
      .getUserMedia({
        audio: false,
        video: {
          aspectRatio: { exact: 4 / 3 },
          width: { min: 640, max: 640 },
          height: { min: 480, max: 480 },
        },
      })
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
    setBlob(event.data);
  }

  return [record, blob];
}
