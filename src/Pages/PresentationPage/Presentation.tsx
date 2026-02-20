import "./Presentation.css";
import { MdFace } from "react-icons/md";
import { MdQrCode2 } from "react-icons/md";
import { FaLock } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function Presentation() {
  const navigate = useNavigate();
  const toScanner = () => {
    navigate("/Scanner");
  };

  return (
    <div className="presentation">
      <div className="infoTop">
        <div className="dot"></div>
        <p>TERMINAL A - SECURITY - ID #8842</p>
      </div>
      <div className="ScanBtn">
        <div className="layer1">
          <div className="layer2">
            <div className="layer3">
              <MdFace className="icon" />
            </div>
          </div>
        </div>
      </div>
      <div className="presentationTitle">
        <h1 className="first">
          Approach & <h1 className="sec"> Scan</h1>
        </h1>
        <h3 className="subTitle">To Unlock Services</h3>
      </div>
      <div onClick={toScanner} className="qrBtn">
        <MdQrCode2 className="qr" />
      </div>
      <div className="presentationFooter">
        <FaLock className="lock" />
        <div className="PresFooterInfo">
          <p className="smallTitle">PRIVACY PROTECTED</p>
          <p className="bigTitle">
            Zero-knowledge Proof <p> &bull; No Data Stored</p>
          </p>
        </div>
      </div>
    </div>
  );
}
