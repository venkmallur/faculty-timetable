import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const timingsOptions = [
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
  "",
];

const semesters = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];

const UpdateSubject = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    totalclasses: "",
    branch: "",
    sem: "",
    timings: {
      monday: "",
      tuesday: "",
      wednesday: "",
      thursday: "",
      friday: "",
    },
    classnottaken: [],
  });

  const [error, setError] = useState("");

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
          throw new Error(data.message || "Failed to fetch subject");

        setFormData({
          name: data.name,
          totalclasses: data.totalclasses,
          branch: data.branch,
          sem: data.sem,
          timings: data.timings,
          classnottaken: data.classnottaken || [],
        });
      } catch (err) {
        setError(err.message);
      }
    };

    fetchSubject();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (
      ["monday", "tuesday", "wednesday", "thursday", "friday"].includes(name)
    ) {
      setFormData((prev) => ({
        ...prev,
        timings: { ...prev.timings, [name]: value },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleRemoveMissedClass = async (indexToRemove) => {
    const updatedClassnottaken = formData.classnottaken.filter(
      (_, index) => index !== indexToRemove
    );

    setFormData((prev) => ({
      ...prev,
      classnottaken: updatedClassnottaken,
    }));

    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/subject/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ classnottaken: updatedClassnottaken }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to update missed classes");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/subject/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Update failed");

      navigate(`/subject/${id}`);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="update-subject-form">
      <h2>Update Subject Details</h2>
      {error && <p className="error">{error}</p>}

      <form onSubmit={handleSubmit}>
        <h3>Subject Name</h3>
        <input
          type="text"
          name="name"
          value={formData.name}
          placeholder="Subject Name"
          onChange={handleChange}
          required
        />

        <h3>Total Classes</h3>
        <input
          type="number"
          name="totalclasses"
          value={formData.totalclasses}
          placeholder="Total Classes"
          onChange={handleChange}
          required
        />

        <h3>Branch</h3>
        <input
          type="text"
          name="branch"
          value={formData.branch}
          placeholder="Branch (e.g., CSE, ECE)"
          onChange={handleChange}
          required
        />

        <h3>Semester</h3>
        <select
          name="sem"
          value={formData.sem}
          onChange={handleChange}
          required
        >
          <option value="">Select Semester</option>
          {semesters.map((s) => (
            <option key={s} value={s}>
              Semester {s}
            </option>
          ))}
        </select>

        <h3>Weekly Timings</h3>
        {Object.keys(formData.timings).map((day) => (
          <div key={day} className="timing-row">
            <label>{day.charAt(0).toUpperCase() + day.slice(1)}</label>
            <select
              name={day}
              value={formData.timings[day]}
              onChange={handleChange}
            >
              {timingsOptions.map((t) => (
                <option key={t} value={t}>
                  {t || "None"}
                </option>
              ))}
            </select>
          </div>
        ))}

        <h3>Missed Classes</h3>
        {formData.classnottaken.length === 0 && <p>No missed classes</p>}
        {formData.classnottaken.map((missed, index) => (
          <details key={index} className="missed-class-item">
            <summary>
              {new Date(missed.date).toLocaleDateString()} - {missed.timings}
            </summary>
            <div>
              <p>
                <strong>Reason:</strong> {missed.reason || "N/A"}
              </p>
              <button
                type="button"
                onClick={() => handleRemoveMissedClass(index)}
              >
                Remove
              </button>
            </div>
          </details>
        ))}

        <button type="submit" className="update-btn">
          Update Subject
        </button>
      </form>
    </div>
  );
};

export default UpdateSubject;
