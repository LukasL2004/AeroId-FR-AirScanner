import "./Results.css";
import { MdFingerprint } from "react-icons/md";
import { IoCheckmark } from "react-icons/io5";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import userDataService from "../../Services/Impl/UserData";
import type { LoginResponse } from "../../Services/Interfaces/UserDataInterface";

export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const { name, flight } = location.state || { name: "", flight: "" };

  const [flightData, setFlightData] = useState<LoginResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!name || !flight) {
      setError("No data provided by the scanner.");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await userDataService.login({ name, flight });
        setFlightData(data);
      } catch (err) {
        setError("Failed to fetch boarding pass data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [name, flight]);

  if (loading) {
    return (
      <div className="results">
        <div style={{ color: "white", textAlign: "center", marginTop: "40vh" }}>
          <h2>Loading Boarding Pass Info...</h2>
        </div>
      </div>
    );
  }

  if (error || !flightData) {
    return (
      <div className="results">
        <div style={{ color: "white", textAlign: "center", marginTop: "40vh" }}>
          <h2>{error || "An error occurred."}</h2>
          <button className="returnBtn" onClick={() => navigate("/scanner")}>
            Return to Scanner
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="results">
      <div className="headerResults">
        <div className="resultsIcon">
          <MdFingerprint className="logo" />
          <h1>
            Aero<span className="id">ID</span>
          </h1>
        </div>
        <div className="location">
          <p className="locTitle">Location</p>
          <p className="locInfo">Terminal B / Gate {flightData.gate || "TBD"}</p>
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
              <h1 className="flightNumber">{flightData.flightId || flight}</h1>
              <div className="time">&bull; ON TIME</div>
            </div>
            <div className="seat">
              <p className="subTitle">SEAT</p>
              <h1 className="seatNr">{flightData.seat || "TBD"}</h1>
            </div>
          </div>
          <div className="lineComp">
            <div className="line"></div>
          </div>
          <div className="passengerInfo">
            <div>
              <p className="subTitle">PASSENGER</p>
              <p className="name">{flightData.passengerName || name.replace("|", " ")}</p>
            </div>
            <div className="class">
              <p className="subTitle">CLASS</p>
              <div className="passengerClass">Economy</div>
            </div>
          </div>
        </div>
        <div className="bootomSection">
          <button className="passBtn" onClick={() => navigate("/boardingpass")}>
            View Boarding Pass
          </button>
          <button className="returnBtn" onClick={() => navigate("/scanner")}>
            Return
          </button>
        </div>
      </div>
      <div className="footerInfo">ID: 0x8f3...a9b2 &bull; VERIFIED</div>
    </div>
  );
}
