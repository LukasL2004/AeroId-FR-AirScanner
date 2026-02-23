import "./Results.css";
import { MdFingerprint } from "react-icons/md";
import { IoCheckmark } from "react-icons/io5";
export default function Results() {
  return (
    <div className="results">
      <div className="headerResults">
        <div className="resultsIcon">
          <MdFingerprint className="logo" />
          <h1>
            Aero<h1 className="id">ID</h1>
          </h1>
        </div>
        <div className="location">
          <p className="locTitle">Location</p>
          <p className="locInfo">Terminal B / Gate 12</p>
        </div>
      </div>
      <div className="resultsBody">
        <IoCheckmark className="checkmark" />
        <div className="resultsTitles">
          <h2 className="resultsSubTitle">Boarding Authorized</h2>
          <p className="subTitle">
            Identity verified via AeroID Secure Enclave
          </p>
        </div>
        <div className="resultsMainComp">
          <div className="flightInfo">
            <div className="flight">
              <p className="subTitle">Fligth</p>
              <h1 className="flightNumber">RO305</h1>
              <div className="time">&bull; ON TIME</div>
            </div>
            <div className="seat">
              <p className="subTitle">SEAT</p>
              <h1 className="seatNr">12A</h1>
            </div>
          </div>
          <div className="lineComp">
            <div className="line"></div>
          </div>
          <div className="passengerInfo">
            <div>
              <p className="subTitle">PASSENGER</p>
              <p className="name">Laza Lukas</p>
            </div>
            <div className="class">
              <p className="subTitle">CLASS</p>
              <div className="passengerClass">Business</div>
            </div>
          </div>
        </div>
        <div className="bootomSection">
          <button className="passBtn">View Boarding Pass</button>
          <button className="returnBtn">Return</button>
        </div>
      </div>
      <div className="footerInfo">ID: 0x8f3...a9b2 &bull; VERIFIED</div>
    </div>
  );
}
