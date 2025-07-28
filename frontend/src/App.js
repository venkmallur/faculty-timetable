import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useLocation,
} from "react-router-dom";

import Navbar from "./Navbar";
import SessionList from "./session/sessionList";
import UpdateSession from "./session/updateSession";
import HolidaysPage from "./session/holidaysPage";
import SessionDetails from "./session/SessionDetails";
import CreateSession from "./session/createSession";
import Timetable from "./Timetable";
import SubjectList from "./subject/allsubjects";
import CreateSubject from "./subject/createsubject";
import SubjectDetails from "./subject/subjectdetails";
import AuthPage from "./login/authlogin";
import UpdateSubject from "./subject/UpdateSubject";

// A wrapper component to protect routes
const PrivateRoute = ({ isLoggedIn, children }) => {
  const location = useLocation();
  return isLoggedIn ? (
    children
  ) : (
    <Navigate to="/" replace state={{ from: location }} />
  );
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true); // <- Add loading

  useEffect(() => {
    const token = localStorage.getItem("token");
    const name = localStorage.getItem("userName");

    if (token) {
      setIsLoggedIn(true);
      setUserName(name || "");
    } else {
      setIsLoggedIn(false);
      setUserName("");
    }

    setLoading(false); // <- Set loading to false after check
  }, []);

  const handleAuth = () => {
    const name = localStorage.getItem("userName");
    setIsLoggedIn(true);
    setUserName(name || "");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    setIsLoggedIn(false);
    setUserName("");
  };

  // Don't render routes until localStorage check finishes
  if (loading) return null;

  return (
    <Router>
      <div className="App">
        {isLoggedIn && (
          <Navbar
            isAuthenticated={isLoggedIn}
            userName={userName}
            onLogout={handleLogout}
          />
        )}
        <Routes>
          {/* Public Route: root */}
          <Route
            path="/"
            element={
              isLoggedIn ? (
                <Navigate to="/session" />
              ) : (
                <AuthPage onAuth={handleAuth} />
              )
            }
          />

          {/* Protected Routes */}
          <Route
            path="/session"
            element={
              <PrivateRoute isLoggedIn={isLoggedIn}>
                <SessionList />
              </PrivateRoute>
            }
          />
          <Route
            path="/create-session"
            element={
              <PrivateRoute isLoggedIn={isLoggedIn}>
                <CreateSession />
              </PrivateRoute>
            }
          />
          <Route
            path="/session/update/:id"
            element={
              <PrivateRoute isLoggedIn={isLoggedIn}>
                <UpdateSession />
              </PrivateRoute>
            }
          />
          <Route
            path="/session/holidays/:id"
            element={
              <PrivateRoute isLoggedIn={isLoggedIn}>
                <HolidaysPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/session/:id"
            element={
              <PrivateRoute isLoggedIn={isLoggedIn}>
                <SessionDetails />
              </PrivateRoute>
            }
          />
          <Route
            path="/Timetable"
            element={
              <PrivateRoute isLoggedIn={isLoggedIn}>
                <Timetable />
              </PrivateRoute>
            }
          />
          <Route
            path="/subject"
            element={
              <PrivateRoute isLoggedIn={isLoggedIn}>
                <SubjectList />
              </PrivateRoute>
            }
          />
          <Route
            path="/create-subject"
            element={
              <PrivateRoute isLoggedIn={isLoggedIn}>
                <CreateSubject />
              </PrivateRoute>
            }
          />
          <Route
            path="/subject-details/:id"
            element={
              <PrivateRoute isLoggedIn={isLoggedIn}>
                <SubjectDetails />
              </PrivateRoute>
            }
          />
          <Route
            path="/subject/update/:id"
            element={
              <PrivateRoute isLoggedIn={isLoggedIn}>
                <UpdateSubject />
              </PrivateRoute>
            }
          />

          {/* Catch-all redirect */}
          <Route
            path="*"
            element={<Navigate to={isLoggedIn ? "/session" : "/"} />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
