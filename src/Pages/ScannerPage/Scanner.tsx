import "./Scanner.css";
import { MdFingerprint } from "react-icons/md";
export default function Scanner() {
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
              <div className="statusNow">Online</div>
            </div>
            <div className="time">
              <div>14: 42: 09</div>
            </div>
          </div>
        </div>
        <div className="scannerBody"></div>
        <div className="scannerFooter"></div>
      </div>
    </div>
  );
}
