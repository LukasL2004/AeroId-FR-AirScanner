import "./Scanner.css";
import { MdFingerprint, MdFace } from "react-icons/md";
import { BsQrCode } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState, useCallback } from "react";
import jsQR from "jsqr";
import * as faceapi from "face-api.js";
import type { verifyPassanger } from "../../Services/Interfaces/Verify";
import verify from "../../Services/Impl/VerifyService";

export default function Scanner() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [time, setTime] = useState<string>();
  const [sw, setSw] = useState<boolean>(false); // false = QR Mode, true = Face Mode
  const [qr, setQrData] = useState<string>("");
  const [modelsLoaded, setModelsLoaded] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const requestRef = useRef<number>(0);
  const isScanningQR = useRef<boolean>(true);
  const isScanningFace = useRef<boolean>(false);
  const qrConfirmedRef = useRef<boolean>(false);   // true = QR confirmat, în delay 1s
  const faceConfirmedRef = useRef<boolean>(false); // true = față detectată, în delay 1.5s

  const navigate = useNavigate();

  // --- 1. Încărcare Modele AI ---
  useEffect(() => {
    const loadModels = async () => {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
        setModelsLoaded(true);
        console.log("AI: Modele pregătite.");
      } catch (e) {
        console.error("AI: Eroare modele:", e);
      }
    };
    loadModels();
  }, []);

  // --- 2. Trimitere Date ---
  const verifyData = useCallback(
    async (formData: verifyPassanger) => {
      try {
        const result = await verify.verifySerice(formData);
        console.group("✅ AeroID — Verdict API");
        console.log("isMatch      :", result.isMatch);
        console.log("passengerName:", result.passengerName);
        console.log("flight       :", result.flight);
        console.log("message      :", result.message);
        console.log("aiMessage    :", result.aiMessage);
        console.log("distance     :", result.distance);
        console.groupEnd();

        if (result.isMatch) {
          // Acces permis → pagina de rezultate
          setTimeout(() => navigate("/results"), 1000);
        } else {
          // Acces respins → facem poză iar (nu ne întoarcem la QR)
          console.warn("❌ Acces respins — reîncercăm fața.");
          setLoading(false);
          // Rămânem în modul FAȚĂ (sw = true) și cu QR-ul păstrat
          isScanningFace.current = true;
          faceConfirmedRef.current = false;
        }
      } catch (e) {
        console.error("Server Error:", e);
        setLoading(false);
        // Eroare API → reîncercăm fața (ca să nu te pună sa scanezi QR iar)
        isScanningFace.current = true;
        faceConfirmedRef.current = false;
      }
    },
    [navigate],
  );

  // --- 3. Curăță overlay-ul canvas ---
  const clearOverlay = useCallback(() => {
    const overlay = overlayCanvasRef.current;
    if (overlay) {
      const ctx = overlay.getContext("2d");
      ctx?.clearRect(0, 0, overlay.width, overlay.height);
    }
  }, []);

  // --- 4. Captură Foto ---
  const takePhoto = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    clearOverlay();

    const width = 800; // Redus de la 1000
    const height = 480; // Redus de la 600
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    ctx?.drawImage(video, 0, 0, width, height);

    canvas.toBlob(
      async (blob) => {
        if (blob) {
          setLoading(true);
          await verifyData({ qrData: qr, livePhoto: blob });
        }
      },
      "image/jpeg",
      0.7, // Redus de la 0.9 pentru a micșora dimensiunea fișierului
    );
  }, [qr, verifyData, clearOverlay]);

  // --- 5. Motor Scanare UNIC (Switchable) ---
  const runScanner = useCallback(
    async function process() {
      const video = videoRef.current;
      if (!video || video.readyState !== video.HAVE_ENOUGH_DATA) {
        requestRef.current = requestAnimationFrame(process);
        return;
      }

      // LOGICA QR
      if (isScanningQR.current) {
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = video.videoWidth;
        tempCanvas.height = video.videoHeight;
        const ctx = tempCanvas.getContext("2d", { willReadFrequently: true });

        if (ctx) {
          ctx.drawImage(video, 0, 0);
          const imgData = ctx.getImageData(
            0,
            0,
            tempCanvas.width,
            tempCanvas.height,
          );
          const code = jsQR(imgData.data, imgData.width, imgData.height);

          // Overlay canvas — chenar pe QR detectat (orice cod, nu doar cel valid)
          const overlay = overlayCanvasRef.current;
          if (overlay) {
            if (
              overlay.width !== overlay.offsetWidth ||
              overlay.height !== overlay.offsetHeight
            ) {
              overlay.width = overlay.offsetWidth;
              overlay.height = overlay.offsetHeight;
            }
            const oc = overlay.getContext("2d");
            if (oc) {
              oc.clearRect(0, 0, overlay.width, overlay.height);

              if (code) {
                const sx = overlay.width / video.videoWidth;
                const sy = overlay.height / video.videoHeight;

                // jsQR dă cei 4 colți — computaăm bounding-rect după oglindire (CSS scaleX(-1))
                const mirror = (px: number) => (video.videoWidth - px) * sx;
                const xs = [
                  mirror(code.location.topLeftCorner.x),
                  mirror(code.location.topRightCorner.x),
                  mirror(code.location.bottomRightCorner.x),
                  mirror(code.location.bottomLeftCorner.x),
                ];
                const ys = [
                  code.location.topLeftCorner.y * sy,
                  code.location.topRightCorner.y * sy,
                  code.location.bottomRightCorner.y * sy,
                  code.location.bottomLeftCorner.y * sy,
                ];
                const rx = Math.min(...xs);
                const ry = Math.min(...ys);
                const rw = Math.max(...xs) - rx;
                const rh = Math.max(...ys) - ry;
                const cornerLen = Math.min(rw, rh) * 0.28;

                // 1. Fill semitransparent
                oc.fillStyle = "rgba(0, 122, 255, 0.06)";
                oc.fillRect(rx, ry, rw, rh);

                // 2. Colțuri L-shape — identic cu fața
                oc.save();
                oc.strokeStyle = "#007aff";
                oc.lineWidth = 3;
                oc.lineCap = "round";
                oc.shadowBlur = 16;
                oc.shadowColor = "#007aff";

                // Top-left
                oc.beginPath();
                oc.moveTo(rx, ry + cornerLen); oc.lineTo(rx, ry); oc.lineTo(rx + cornerLen, ry);
                oc.stroke();
                // Top-right
                oc.beginPath();
                oc.moveTo(rx + rw - cornerLen, ry); oc.lineTo(rx + rw, ry); oc.lineTo(rx + rw, ry + cornerLen);
                oc.stroke();
                // Bottom-left
                oc.beginPath();
                oc.moveTo(rx, ry + rh - cornerLen); oc.lineTo(rx, ry + rh); oc.lineTo(rx + cornerLen, ry + rh);
                oc.stroke();
                // Bottom-right
                oc.beginPath();
                oc.moveTo(rx + rw - cornerLen, ry + rh); oc.lineTo(rx + rw, ry + rh); oc.lineTo(rx + rw, ry + rh - cornerLen);
                oc.stroke();

                oc.restore();

                // 3. Label "QR" deasupra — identic ca stil cu fața
                const labelText = "QR";
                const fontSize = Math.max(11, rw * 0.12);
                oc.font = `600 ${fontSize}px Inter, sans-serif`;
                oc.textAlign = "center";
                const labelX = rx + rw / 2;
                const labelY = ry - 10;

                const textW = oc.measureText(labelText).width + 16;
                oc.fillStyle = "rgba(0, 122, 255, 0.18)";
                oc.beginPath();
                oc.roundRect(labelX - textW / 2, labelY - fontSize - 2, textW, fontSize + 8, 4);
                oc.fill();

                oc.fillStyle = "#007aff";
                oc.shadowBlur = 8;
                oc.shadowColor = "#007aff";
                oc.fillText(labelText, labelX, labelY);
                oc.shadowBlur = 0;
              }
            }
          }

          if (code && code.data.trim().length > 10 && !qrConfirmedRef.current) {
            console.log("QR Detectat! Aștept 1s pe cadru...");
            qrConfirmedRef.current = true;
            
            // Ține chenarul 1 secundă fix, apoi mută instant la față
            setTimeout(() => {
              setQrData(code.data);
              setSw(true);
              isScanningQR.current = false;
              clearOverlay();
              
              // Scanarea feței începe imediat după ce a dispărut QR-ul
              isScanningFace.current = true;
            }, 1000);
          }
        }
      }
      // LOGICA FAȚĂ
      else if (isScanningFace.current && modelsLoaded) {
        const detection = await faceapi.detectSingleFace(
          video,
          new faceapi.TinyFaceDetectorOptions({
            inputSize: 224,
            scoreThreshold: 0.7,
          }),
        );

        // Desenează chenarul în timp real pe overlay canvas
        const overlay = overlayCanvasRef.current;
        if (overlay) {
          // Sincronizează dimensiunile canvas-ului cu viewport-ul afișat
          if (
            overlay.width !== overlay.offsetWidth ||
            overlay.height !== overlay.offsetHeight
          ) {
            overlay.width = overlay.offsetWidth;
            overlay.height = overlay.offsetHeight;
          }

          const ctx = overlay.getContext("2d");
          if (ctx) {
            ctx.clearRect(0, 0, overlay.width, overlay.height);

            if (detection) {
              const scaleX = overlay.width / video.videoWidth;
              const scaleY = overlay.height / video.videoHeight;
              const { x, y, width, height } = detection.box;

              // Video-ul e oglindit CSS cu scaleX(-1), deci oglindim și x
              const rx = (video.videoWidth - x - width) * scaleX;
              const ry = y * scaleY;
              const rw = width * scaleX;
              const rh = height * scaleY;

              const cornerLen = Math.min(rw, rh) * 0.25;
              const lw = 3;

              // 1. Fill semitransparent pe zona feței
              ctx.fillStyle = "rgba(0, 122, 255, 0.06)";
              ctx.fillRect(rx, ry, rw, rh);

              // 2. Colțuri tip bracket (L-shapes) — glow cyan
              ctx.save();
              ctx.strokeStyle = "#007aff";
              ctx.lineWidth = lw;
              ctx.lineCap = "round";
              ctx.shadowBlur = 16;
              ctx.shadowColor = "#007aff";

              // Top-left
              ctx.beginPath();
              ctx.moveTo(rx, ry + cornerLen);
              ctx.lineTo(rx, ry);
              ctx.lineTo(rx + cornerLen, ry);
              ctx.stroke();

              // Top-right
              ctx.beginPath();
              ctx.moveTo(rx + rw - cornerLen, ry);
              ctx.lineTo(rx + rw, ry);
              ctx.lineTo(rx + rw, ry + cornerLen);
              ctx.stroke();

              // Bottom-left
              ctx.beginPath();
              ctx.moveTo(rx, ry + rh - cornerLen);
              ctx.lineTo(rx, ry + rh);
              ctx.lineTo(rx + cornerLen, ry + rh);
              ctx.stroke();

              // Bottom-right
              ctx.beginPath();
              ctx.moveTo(rx + rw - cornerLen, ry + rh);
              ctx.lineTo(rx + rw, ry + rh);
              ctx.lineTo(rx + rw, ry + rh - cornerLen);
              ctx.stroke();

              ctx.restore();

              // 3. Label "FACE" deasupra
              const labelText = "FACE";
              const fontSize = Math.max(11, rw * 0.1);
              ctx.font = `600 ${fontSize}px Inter, sans-serif`;
              ctx.textAlign = "center";
              const labelX = rx + rw / 2;
              const labelY = ry - 10;

              // Pastilă fundal pentru text
              const textW = ctx.measureText(labelText).width + 16;
              ctx.fillStyle = "rgba(0, 122, 255, 0.18)";
              ctx.beginPath();
              ctx.roundRect(labelX - textW / 2, labelY - fontSize - 2, textW, fontSize + 8, 4);
              ctx.fill();

              ctx.fillStyle = "#007aff";
              ctx.shadowBlur = 8;
              ctx.shadowColor = "#007aff";
              ctx.fillText(labelText, labelX, labelY);
              ctx.shadowBlur = 0;
            }
          }
        }

        if (detection && !faceConfirmedRef.current) {
          console.log("Față Detectată! Fac poza în 1.5s...");
          faceConfirmedRef.current = true; // blochează re-triggerarea
          // Loopul continuă să ruleze și să deseneze chenarul în timp real
          setTimeout(() => {
            isScanningFace.current = false;
            clearOverlay();
            takePhoto();
          }, 1500);
        }
      }

      requestRef.current = requestAnimationFrame(process);
    },
    [modelsLoaded, takePhoto],
  );

  // --- 6. Pornire Cameră ---
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: { width: 1280, height: 720, facingMode: "user" } })
      .then((stream) => {
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().then(() => runScanner());
        }
      });

    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString("ro-RO", { hour12: false }));
    }, 1000);

    return () => {
      clearInterval(interval);
      cancelAnimationFrame(requestRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [runScanner]);

  return (
    <div className="cont">
      <div className="scanner">
        <div className="scannerNav">
          <div className="logoSide">
            <MdFingerprint className="logo" />
            <div className="titleSide">
              <h1>
                Aero<span className="id">ID</span>
              </h1>
              <p className="subTitle">DECENTRALIZED BIOMETRIC</p>
            </div>
          </div>
          <div className="infoSide">TERMINAL A - SECURITY</div>
          <div className="statusSide">
            <div className="status">
              <div className="dot"></div>
              <div className="statusNow">Online</div>
            </div>
            <div className="time">{time}</div>
          </div>
        </div>

        {/* ECRANUL UNIC */}
        <div className="scannerMain">
          <div className="viewport">
            <video ref={videoRef} className="screenMain" playsInline muted />
            {/* Canvas overlay pentru chenarul feței */}
            <canvas ref={overlayCanvasRef} className="faceOverlay" />
            <div className={`scanOverlay ${sw ? "faceMode" : "qrMode"}`}></div>

            {/* Mesaj jos în poza */}
            <div className="scannerFooter">
              <div className="modeIcon">
                {sw ? (
                  <MdFace className="activeIcon" />
                ) : (
                  <BsQrCode className="activeIcon" />
                )}
              </div>
              <p className="msg">
                {sw
                  ? "Vă rugăm să priviți camera..."
                  : "Scanați codul QR de pe bilet..."}
              </p>
            </div>
          </div>
        </div>

        <div className="credentials">
          &bull; AEROID SECURE PROTOCOL &bull; BIOMETRIC DATA ENCRYPTED
        </div>
        <canvas style={{ display: "none" }} ref={canvasRef}></canvas>
      </div>

      {/* LOADING OVERLAY */}
      {loading && (
        <div className="loadingOverlay">
          <div className="loadingCard">
            <MdFingerprint className="loadingLogo" />
            <div className="loadingRing" />
            <p className="loadingTitle">Se verifică identitatea</p>
            <p className="loadingSubtitle">Verificare biometrică în curs...</p>
          </div>
        </div>
      )}
    </div>
  );
}
