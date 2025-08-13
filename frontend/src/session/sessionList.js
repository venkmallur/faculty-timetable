import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const SessionList = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/session`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // ✅ Send token
          },
        });

        const data = await res.json();
        // console.log("Fetched sessions:", data);

        // Ensure it's an array before setting
        if (Array.isArray(data)) {
          setSessions(data);
        } else {
          setSessions([]); // fallback to empty
        }
      } catch (err) {
        console.error("Error fetching sessions:", err);
        setSessions([]); // in case of error
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  return (
    <div className="container">
      <h1 className="title">Sessions</h1>
      <button className="btn" onClick={() => navigate("/create-session")}>
        Create Session
      </button>

      {loading ? (
        <p>Loading...</p>
      ) : sessions.length === 0 ? (
        <p className="no-session">No sessions available. Create a new one.</p>
      ) : (
        <div className="card-container">
          {sessions.map((session) => (
            <div
              key={session._id}
              className="card"
              onClick={() => navigate(`/session/${session._id}`)}
            >
              <h2>{session.name}</h2>
              <p>Start Date: {new Date(session.startdate).toDateString()}</p>
              <p>End Date: {new Date(session.enddate).toDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SessionList;
