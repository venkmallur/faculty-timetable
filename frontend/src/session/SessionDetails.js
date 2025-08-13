import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const SessionDetails = () => {
  const { id } = useParams();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/session/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (!res.ok) {
          throw new Error("Session not found");
        }
        const data = await res.json();
        setSession(data);
      } catch (err) {
        console.error("Error fetching session:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [id]);

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this session? This will also delete all associated subjects. This action cannot be undone."
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(`http://localhost:8000/api/session/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        alert("Session and associated subjects deleted successfully.");
        navigate("/session");
      } else {
        alert("Error deleting session.");
      }
    } catch (error) {
      alert("An error occurred while deleting the session.");
    }
  };

  if (loading) {
    return <p>Loading session details...</p>;
  }

  if (!session) {
    return <p>Session not found.</p>;
  }

  return (
    <div className="container">
      <h1 className="title">{session.name}</h1>
      <p>Start Date: {new Date(session.startdate).toDateString()}</p>
      <p>End Date: {new Date(session.enddate).toDateString()}</p>
      <p>Working Days: {session.workingdays}</p>
      <button
        className="btn"
        onClick={() => navigate(`/session/holidays/${id}`)}
      >
        View Holidays
      </button>
      <button className="btn" onClick={() => navigate(`/session/update/${id}`)}>
        Update Session
      </button>
      <button className="btn delete" onClick={handleDelete}>
        Delete Session 🗑️
      </button>
    </div>
  );
};

export default SessionDetails;
