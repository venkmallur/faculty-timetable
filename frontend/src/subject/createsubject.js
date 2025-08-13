import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const CreateSubject = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    totalclasses: "",
    sessionId: "",
    branch: "",
    sem: "I",
    timings: {
      monday: "",
      tuesday: "",
      wednesday: "",
      thursday: "",
      friday: "",
    },
  });

  const timingOptions = [
    "",
    "9am-10am",
    "9am-11am",
    "10am-11am",
    "11:20am-12:20pm",
    "12:20pm-1:20pm",
    "11:20-1:20pm",
    "2pm-3pm",
    "2pm-4pm",
    "3pm-4pm",
    "4pm-5pm",
    "2pm-5pm",
  ];

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("${process.env.REACT_APP_API_BASE_URL}/api/session", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          setSessions(data);
        } else {
          console.error("Error fetching sessions:", data.error);
        }
      } catch (error) {
        console.error("Error fetching sessions:", error);
      }
    };
    fetchSessions();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name in formData.timings) {
      setFormData((prev) => ({
        ...prev,
        timings: { ...prev.timings, [name]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("${process.env.REACT_APP_API_BASE_URL}/api/subject", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        navigate("/subject");
      } else {
        const err = await response.json();
        console.error("Error creating subject:", err.error);
      }
    } catch (error) {
      console.error("Error creating subject:", error);
    }
  };

  return (
    <div className="glass-container">
      <h2>Create Subject</h2>
      <form onSubmit={handleSubmit}>
        <label>Subject Name:</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <label>Total Classes:</label>
        <input
          type="number"
          name="totalclasses"
          value={formData.totalclasses}
          onChange={handleChange}
          required
        />

        <label>Session:</label>
        <select
          name="sessionId"
          value={formData.sessionId}
          onChange={handleChange}
          required
        >
          <option value="">Select Session</option>
          {sessions.map((session) => (
            <option key={session._id} value={session._id}>
              {session.name}
            </option>
          ))}
        </select>

        <label>Branch:</label>
        <input
          type="text"
          name="branch"
          value={formData.branch}
          onChange={handleChange}
          required
        />

        <label>Semester:</label>
        <select name="sem" value={formData.sem} onChange={handleChange}>
          {["I", "II", "III", "IV", "V", "VI", "VII", "VIII"].map((sem) => (
            <option key={sem} value={sem}>
              {sem}
            </option>
          ))}
        </select>

        <h3>Class Timings:</h3>
        {["monday", "tuesday", "wednesday", "thursday", "friday"].map((day) => (
          <div key={day}>
            <label>{day.charAt(0).toUpperCase() + day.slice(1)}:</label>
            <select
              name={day}
              value={formData.timings[day]}
              onChange={handleChange}
            >
              {timingOptions.map((option) => (
                <option key={option} value={option}>
                  {option || "No class"}
                </option>
              ))}
            </select>
          </div>
        ))}

        <button type="submit">Create Subject</button>
      </form>
    </div>
  );
};

export default CreateSubject;
