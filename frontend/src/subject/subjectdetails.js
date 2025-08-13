// ...existing imports
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const SubjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [subject, setSubject] = useState(null);
  const [error, setError] = useState("");
  const [showMissedClasses, setShowMissedClasses] = useState(false);
  const [showAddMissedClass, setShowAddMissedClass] = useState(false);
  const [date, setDate] = useState("");
  const [timing, setTiming] = useState("");
  const [reason, setReason] = useState("");

  useEffect(() => {
    const fetchSubject = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/api/subject/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        const data = await response.json();
        if (!response.ok)
          throw new Error(data.message || "Failed to fetch data");
        setSubject(data);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchSubject();
  }, [id]);

  const handleDeleteSubject = async () => {
    if (!window.confirm("Are you sure you want to delete this subject?"))
      return;

    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/subject/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) throw new Error("Failed to delete subject.");
      navigate("/subject");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddMissedClass = async () => {
    if (!date || !timing) {
      setError("Date and timing are required.");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/api/subject/classnottaken/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ date, timings: timing, reason }),
        }
      );

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Failed to add missed class");

      setSubject((prev) => ({
        ...prev,
        classnottaken: data.classnottaken,
      }));

      setDate("");
      setTiming("");
      setReason("");
      setError("");
      setShowAddMissedClass(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdateSubject = () => {
    navigate(`/subject/update/${id}`);
  };

  if (error) return <p className="error">{error}</p>;
  if (!subject) return <p>Loading...</p>;

  return (
    <div className="subject-details">
      <h1>{subject.name}</h1>

      <div className="subject-info">
        <p>
          <strong>Branch:</strong> {subject.branch}
        </p>
        <p>
          <strong>Semester:</strong> {subject.sem}
        </p>
        <p>
          <strong>Total Classes:</strong> {subject.totalclasses}
        </p>
      </div>

      <h2>Class Schedule</h2>
      <ul>
        {Object.entries(subject.timings)
          .filter(([_, time]) => time !== "")
          .map(([day, time]) => (
            <li key={day}>
              <strong>{day.charAt(0).toUpperCase() + day.slice(1)}:</strong>{" "}
              {time}
            </li>
          ))}
      </ul>

      <div className="button-group">
        <button
          onClick={() => {
            setShowMissedClasses(!showMissedClasses);
            setShowAddMissedClass(false);
          }}
        >
          {showMissedClasses ? "Hide Missed Classes" : "Show Missed Classes"}
        </button>
        <button
          onClick={() => {
            setShowAddMissedClass(!showAddMissedClass);
            setShowMissedClasses(false);
          }}
        >
          {showAddMissedClass ? "Cancel" : "Add Missed Class"}
        </button>
        <button className="delete-button" onClick={handleDeleteSubject}>
          ❌ Delete Subject
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      {showMissedClasses && (
        <div className="missed-classes">
          <h2>Missed Classes</h2>
          {subject.classnottaken.length > 0 ? (
            <ul>
              {subject.classnottaken.map((c, index) => {
                const formattedDate = new Date(c.date)
                  .toLocaleDateString("en-GB")
                  .replace(/\//g, "-");
                return (
                  <li key={index}>
                    {formattedDate} - {c.timings} {c.reason && `(${c.reason})`}
                  </li>
                );
              })}
            </ul>
          ) : (
            <p>No missed classes recorded.</p>
          )}
        </div>
      )}

      {showAddMissedClass && (
        <div className="add-missed-class">
          <h3>Add Missed Class</h3>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
          <select
            value={timing}
            onChange={(e) => setTiming(e.target.value)}
            style={{ color: "white" }}
            required
          >
            <option value="" style={{ color: "black" }}>
              Select Timing
            </option>
            {[
              "9am-10am",
              "9am-11am",
              "10am-11am",
              "11:20am-12:20pm",
              "12:20pm-1:20pm",
              "11:20-1:20pm",
              "2pm-3pm",
              "2pm-4pm",
              "3pm-4pm",
              "2pm-5pm",
            ].map((slot) => (
              <option key={slot} value={slot} style={{ color: "black" }}>
                {slot}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Reason (optional)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <button onClick={handleAddMissedClass}>Add</button>
        </div>
      )}

      <div className="update-button-container" style={{ marginTop: "2rem" }}>
        <button className="update-button" onClick={handleUpdateSubject}>
          ✏️ Update Subject
        </button>
      </div>
    </div>
  );
};

export default SubjectDetails;
