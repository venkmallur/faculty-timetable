import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const UpdateSession = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch existing session data when component mounts
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/api/session/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (!response.ok) throw new Error("Failed to fetch session");

        const data = await response.json();
        setStartDate(data.startdate.split("T")[0]); // Format date
        setEndDate(data.enddate.split("T")[0]);
      } catch (err) {
        setError("Error fetching session details.");
      }
    };
    fetchSession();
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`http://localhost:8000/api/session/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ startdate: startDate, enddate: endDate }),
      });

      if (!response.ok) throw new Error("Failed to update session");

      navigate(`/session/${id}`);
    } catch (err) {
      setError("Error updating session.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Update Session</h1>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleUpdate}>
        <label>Start Date:</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          required
        />
        <label>End Date:</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          required
        />
        <button className="btn" type="submit" disabled={loading}>
          {loading ? "Updating..." : "Update"}
        </button>
      </form>
    </div>
  );
};

export default UpdateSession;
