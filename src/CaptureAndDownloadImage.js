import React, { useRef, useState, useMemo, useEffect } from 'react';
import {
  BrowserMultiFormatReader,
  NotFoundException,
  DecodeHintType,
  BarcodeFormat,
} from "@zxing/library";

const CaptureAndDownloadImage = () => {
  const videoRef = useRef(null);
  const codeReaderRef = useRef(null);
  const [stream, setStream] = useState(null);
  const hints = useMemo(() => new Map(), []);
  const formats = [BarcodeFormat.PDF_417, BarcodeFormat.QR_CODE, BarcodeFormat.CODE_39];
  hints.set(DecodeHintType.POSSIBLE_FORMATS, formats);
  const [info,setinfo] = useState("")
  useEffect(() => {
    const initCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Error accessing webcam:", error);
      }
    };

    initCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const handleCapture = () => {
    // Handle capturing image from video (if needed)
    const canvas = document.createElement('canvas');
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Continue with your capture logic using the captured canvas image
    // ...
  };

  const decode = () => {
    const video = videoRef.current;
    const codeReader = new BrowserMultiFormatReader(hints, 100);
    
    // Clone the video stream for decoding
    const clonedMediaForDecoding = video.captureStream();

    codeReader.decodeFromStream(
      clonedMediaForDecoding,
      video,
      (result, err) => {
        if (result) {
          const carInfo = result.text.split("%");
          setinfo(carInfo)
          console.log("Barcode detected and decoded:", carInfo);
          codeReader.stopContinuousDecode();
          // ... Handle your result logic
        } else {
          console.log("No barcode detected");        }
      }
    );
  };

  const reset = () => {
    window.location.reload();
  };

  return (
    <div>
      <div>
      <video ref={videoRef} autoPlay playsInline />
      <button onClick={decode}>Decode from Stream</button>
      <button onClick={reset}>Reset</button>
      </div>
      <div>decoded text: {info}</div>
    </div>
  );
};

export default CaptureAndDownloadImage;
