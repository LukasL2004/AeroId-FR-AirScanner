import "./Scanner.css";
import { MdFingerprint } from "react-icons/md";
import { BsQrCode } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { MdFace } from "react-icons/md";

export default function Scanner() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const facePhotoRef = useRef<HTMLCanvasElement>(null);
  const qrPhotoRef = useRef<HTMLCanvasElement>(null);
  // const qrVideoRef = useRef<HTMLVideoElement>(null);
  const [time, setTime] = useState<string>();
  const navigate = useNavigate();
  const [sw, setSw] = useState<boolean>(true);

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
    setSw(!sw);
  };

  const takeQrPhoto = () => {
    const width = 1000;
    const height = width / (16 / 27);

    const video = videoRef.current;
    const photo = qrPhotoRef.current;

    if (!video || !photo) return;

    photo.width = width;
    photo.height = height;

    const ctx = photo.getContext("2d");
    ctx?.drawImage(video, 0, 0, width, height);
    console.log("qrPhoto");
    setSw(!sw);
  };

  useEffect(() => {
    getVideo();

    setInterval(() => {
      const date = new Date();
      const hours = date.getHours();
      const mins = date.getMinutes();
      const seconds = date.getSeconds();

      const currentTime = hours + ":" + mins + ":" + seconds;
      setTime(currentTime);
    }, 1000);
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
              Please show your Digital Pass
            </p>
          ) : (
            <p onClick={takeQrPhoto} className="msg">
              Please show your Digital Pass
            </p>
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
