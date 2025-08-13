import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

const HolidaysPage = () => {
  const { id } = useParams();
  const [holidays, setHolidays] = useState([]);
  const [newHoliday, setNewHoliday] = useState("");
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_BASE_URL}/api/session/holidays/${id}/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch holidays");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data.holidays)) {
          setHolidays(
            data.holidays.map(
              (date) => new Date(date).toISOString().split("T")[0]
            )
          );
        } else {
          setHolidays([]);
        }
      })
      .catch((err) => setError(err.message));
  }, [id, token]);

  const addHoliday = async () => {
    setError("");

    if (!newHoliday) {
      setError("Please select a valid date.");
      return;
    }

    if (holidays.includes(newHoliday)) {
      setError("This holiday already exists.");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/api/session/add-holiday/${id}/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ holidays: [newHoliday] }),
        }
      );

      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.message || "Failed to add holiday.");
      }

      setHolidays((prevHolidays) => [newHoliday, ...prevHolidays]);
      setNewHoliday("");
    } catch (error) {
      setError(error.message);
    }
  };

  const removeHoliday = async (holiday) => {
    setError("");

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/api/session/remove-holiday/${id}/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ holidays: [holiday] }),
        }
      );

      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.message || "Failed to remove holiday.");
      }

      setHolidays((prevHolidays) => prevHolidays.filter((h) => h !== holiday));
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="holidays-page">
      <div className="container">
        <h1>Holidays</h1>
        {error && <p className="error">{error}</p>}

        {holidays.length > 0 ? (
          <ul>
            {holidays.map((holiday, index) => (
              <li key={index}>
                {holiday}
                <button onClick={() => removeHoliday(holiday)}>Remove</button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No holidays added yet.</p>
        )}

        <input
          type="date"
          value={newHoliday}
          onChange={(e) => setNewHoliday(e.target.value)}
        />
        <button className="btn" onClick={addHoliday} disabled={!newHoliday}>
          Add Holiday
        </button>
      </div>
    </div>
  );
};

export default HolidaysPage;
