import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const SubjectList = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/subject", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (Array.isArray(data)) {
          setSubjects(data);
        } else {
          console.error("Expected an array but got:", data);
          setSubjects([]); // Prevent `.map()` errors
        }
      } catch (error) {
        console.error("Error fetching subjects:", error);
        setSubjects([]); // Prevent errors if request fails
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, [token]);

  return (
    <div className="subject-list-container">
      <h2 className="subject-list-title">Subjects</h2>
      <button
        className="glass-button"
        onClick={() => navigate("/create-subject")}
      >
        Create Subject
      </button>

      {loading ? (
        <p className="loading-message">Loading subjects...</p>
      ) : subjects.length === 0 ? (
        <p className="no-subjects">No subjects available</p>
      ) : (
        <div className="subject-grid">
          {subjects.map((subject) => (
            <div
              key={subject._id}
              className="subject-card"
              onClick={() => navigate(`/subject-details/${subject._id}`)}
            >
              <h3 className="subject-name">{subject.name || "No Name"}</h3>
              <div className="subject-info">
                <div className="info-box">
                  <span>Branch:</span> {subject.branch || "N/A"}
                </div>
                <div className="info-box">
                  <span>Sem:</span> {subject.sem || "N/A"}
                </div>
              </div>
              <div className="subject-info">
                <div className="info-box">
                  <span>Total Classes:</span> {subject.totalclasses || 0}
                </div>
                <div className="info-box">
                  <span>Remaining Classes:</span>{" "}
                  {subject.remainingClasses || 0}
                </div>
              </div>
              <div className="subject-info">
                <div className="info-box">
                  <span>Working Days:</span>{" "}
                  {subject.sessionId?.workingdays || 0}
                </div>
                <div className="info-box">
                  <span>Remaining Days:</span> {subject.remainingDays || 0}
                </div>
              </div>
              <p className="remaining-message">
                {subject.message || "No message available"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SubjectList;
