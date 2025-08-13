import { useState } from "react";
import { useNavigate } from "react-router-dom";

const CreateSession = () => {
  const [name, setName] = useState("");
  const [startdate, setStartdate] = useState("");
  const [enddate, setEnddate] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // ✅ Include Bearer token
        },
        body: JSON.stringify({ name, startdate, enddate }),
      });

      if (response.ok) {
        navigate("/session");
      } else {
        const data = await response.json();
        setError(data.error || "Failed to create session");
      }
    } catch (err) {
      console.error("Error creating session:", err);
      setError("Something went wrong");
    }
  };

  return (
    <div className="container">
      <h1 className="title">Create Session</h1>
      <form className="form" onSubmit={handleSubmit}>
        <label>Session Name:</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <label>Start Date:</label>
        <input
          type="date"
          value={startdate}
          onChange={(e) => setStartdate(e.target.value)}
          required
        />
        <label>End Date:</label>
        <input
          type="date"
          value={enddate}
          onChange={(e) => setEnddate(e.target.value)}
          required
        />
        <button className="btn" type="submit">
          Submit
        </button>
        {error && <p className="error">{error}</p>}
      </form>
    </div>
  );
};

export default CreateSession;
