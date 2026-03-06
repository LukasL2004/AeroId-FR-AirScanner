import "./Scanner.css";
import { MdFingerprint } from "react-icons/md";
import { BsQrCode } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { MdFace } from "react-icons/md";
import jsQR from "jsqr";
import type { verifyPassanger } from "../../Services/Interfaces/Verify";
import verify from "../../Services/Impl/VerifyService";

export default function Scanner() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const facePhotoRef = useRef<HTMLCanvasElement>(null);
  const qrPhotoRef = useRef<HTMLCanvasElement>(null);
  // const qrVideoRef = useRef<HTMLVideoElement>(null);
  const [time, setTime] = useState<string>();
  const requestRef = useRef<number>(null);
  const navigate = useNavigate();
  const [sw, setSw] = useState<boolean>(false);
  const [qr, setQrData] = useState<string>();
  const isScanning = useRef<boolean>(true);

  const scanContinuously = () => {
    if (!isScanning.current) return;

    const video = videoRef.current;
    const canvas = qrPhotoRef.current;

    if (video && video.readyState === video.HAVE_ENOUGH_DATA && canvas) {
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert",
        });

        if (code && code.data.trim().length > 10) {
          isScanning.current = false;

          console.log("Token VALID extras:", code.data);
          setQrData(code.data);

          if (requestRef.current) cancelAnimationFrame(requestRef.current);

          setSw(true);
          return;
        }
      }
    }

    if (isScanning.current) {
      requestRef.current = requestAnimationFrame(scanContinuously);
    }
  };

  const getVideo = () => {
    navigator.mediaDevices
      .getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 1620 } },
      })
      .then((stream) => {
        const video = videoRef.current;

        if (video) {
          video.srcObject = stream;
          video.play();
          scanContinuously();
        }
      })
      .catch((e) => {
        console.error(e);
        console.log(
          "Sorry something went wrong with the video please refresh the page",
        );
      });
  };

  const takeFacePhoto = () => {
    const width = 1000;
    const height = width / (16 / 27);

    const video = videoRef.current;
    const photo = facePhotoRef.current;

    if (!video || !photo) return;

    photo.width = width;
    photo.height = height;

    const ctx = photo.getContext("2d");
    ctx?.drawImage(video, 0, 0, width, height);
    console.log("facePhoto");
    photo.toBlob(
      async (blob) => {
        if (!blob) {
          console.log("An error occured while creating the blob");
          return;
        }
        const data = {
          qrData: qr!,
          livePhoto: blob,
        };

        await verifyData(data);
        console.log("yupiii");
      },
      "image/jpg",
      0.9,
    );
  };

  const verifyData = async (formData: verifyPassanger) => {
    try {
      const resp = await verify.verifySerice(formData);
      console.log(resp);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    getVideo();

    const interval = setInterval(() => {
      const date = new Date();
      const hours = date.getHours();
      const mins = date.getMinutes();
      const seconds = date.getSeconds();

      const currentTime = hours + ":" + mins + ":" + seconds;
      setTime(currentTime);
    }, 1000);

    return () => {
      clearInterval(interval);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [sw]);

  const toResults = () => {
    navigate("/Results");
  };

  return (
    <div className="cont">
      <div className="scanner">
        <div className="scannerNav">
          <div className="logoSide">
            <MdFingerprint className="logo" />
            <div className="titleSide">
              <h1>
                Aero<h1 className="id">ID</h1>
              </h1>
              <p className="subTitle">DECENTRALIZED BIOMETRIC</p>
            </div>
          </div>
          <div className="infoSide">TERMINAL A - SECURITY</div>
          <div className="statusSide">
            <div className="status">
              <div className="dot"></div>
              <div onClick={toResults} className="statusNow">
                Online
              </div>
            </div>
            <div className="time">
              <div>{time}</div>
            </div>
          </div>
        </div>
        <div className="scannerFace">
          <div className="facecam">
            {sw ? (
              <video ref={videoRef} className="screen" playsInline muted />
            ) : (
              <MdFace className="faceIcon" />
            )}
          </div>
          <div className="face"></div>
        </div>
        <div className="scannerQR">
          {!sw ? (
            <video ref={videoRef} className="screen" playsInline muted />
          ) : (
            <BsQrCode />
          )}
        </div>
        <div className="scannerFooter">
          <div className="dot"></div>
          {sw ? (
            <p onClick={takeFacePhoto} className="msg">
              Please take Face Photo
            </p>
          ) : (
            <p className="msg"> Scanning Digital Pass...</p>
          )}
        </div>
        <div className="credentials">
          &bull; AEROID SECURE PROTOCOL &bull; DO NOT OBSTRUCT CAMERA
        </div>
        <canvas style={{ display: "none" }} ref={qrPhotoRef}></canvas>
        <canvas style={{ display: "none" }} ref={facePhotoRef}></canvas>
      </div>
    </div>
  );
}
