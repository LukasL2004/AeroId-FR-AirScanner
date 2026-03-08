import "./Results.css";
import { MdFlightTakeoff } from "react-icons/md";
import { IoCheckmark, IoClose } from "react-icons/io5";
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
        <div className="headerResults" style={{ opacity: 0 }}>
          <div className="resultsIcon">
            <MdFlightTakeoff className="logo" />
            <h1>Aero<span className="id">ID</span></h1>
          </div>
        </div>
        <div className="loading-container">
          <div className="spinner"></div>
          <h2>Verifying Identity...</h2>
        </div>
      </div>
    );
  }

  if (error || !flightData) {
    return (
      <div className="results">
        <div className="headerResults">
          <div className="resultsIcon">
            <MdFlightTakeoff className="logo" />
            <h1>Aero<span className="id">ID</span></h1>
          </div>
        </div>
        <div className="resultsBody errorBody">
          <div className="errorMarkContainer">
            <IoClose className="checkmark errorMark" style={{ background: 'linear-gradient(135deg, #ff3b30, #b30000)', boxShadow: '0 0 20px rgba(255, 59, 48, 0.5)' }} />
          </div>
          <div className="resultsTitles">
            <h2 className="resultsSubTitle" style={{ color: '#ff3b30' }}>Verification Failed</h2>
            <p className="subTitle">{error || "An error occurred."}</p>
          </div>
          <div className="bottomSection" style={{ width: '85%', padding: '0 1.5rem', marginBottom: '1.5rem' }}>
            <button className="returnBtn" onClick={() => navigate("/scanner")}>
              Return to Scanner
            </button>
          </div>
        </div>
        <div className="footerInfo errorFooter">ID: 0x8f3...a9b2 &bull; ERROR</div>
      </div>
    );
  }

  return (
    <div className="results">
      <div className="headerResults">
        <div className="resultsIcon">
          <MdFlightTakeoff className="logo" />
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
              <p className="subTitle">Flight</p>
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
        <div className="bottomSection">
          <button className="returnBtn" onClick={() => navigate("/scanner")}>
            Return
          </button>
        </div>
      </div>
      <div className="footerInfo">ID: 0x8f3...a9b2 &bull; VERIFIED</div>
    </div>
  );
}
