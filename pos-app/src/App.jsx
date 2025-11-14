import "./App.css";
import { useEffect, useState } from "react";
import useIdleTimeout from "./hooks/useIdleTimeout";
import Home from "./Components/Home/Home";
import Order from "./Components/Order/Order";
import Login from "./Components/Auth/Login";
import Signup from "./Components/Auth/Signup";
import PrivateRoute from "./Components/Auth/PrivateRoute";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";
import { checkDatabaseConnection } from "./utils/database";

function App() {
  const [dbStatus, setDbStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const status = await checkDatabaseConnection();
        setDbStatus(status);
      } catch (err) {
        console.warn(err);
        setDbStatus({ server: "error", database: "disconnected" });
      } finally {
        setLoading(false);
      }
    };

    checkConnection();
    // Check connection every 30 seconds
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto"></div>
          <p className="mt-4 text-gray-600">Connecting to server...</p>
        </div>
      </div>
    );
  }

  if (!dbStatus || dbStatus.database === "disconnected") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-600">
          <h2 className="text-2xl font-bold mb-2">Database Connection Error</h2>
          <p>Unable to connect to the database. Please try again later.</p>
        </div>
      </div>
    );
  }

  // Idle handler must run inside Router so useNavigate works
  function IdleHandler() {
    const navigate = useNavigate();

    const signOut = (notify = true) => {
      try {
        localStorage.removeItem("token");
      } catch {
        /* ignore */
      }
      if (notify) alert("You have been signed out due to inactivity.");
      navigate("/login");
    };

    // Default timeout: 15 minutes. Use smaller number for testing (e.g., 30000 = 30s).
    useIdleTimeout(() => signOut(true), 15 * 60 * 1000);
    return null;
  }

  return (
    <Router>
      <IdleHandler />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        />
        <Route
          path="/order"
          element={
            <PrivateRoute>
              <Order />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

// function App() {
//   const [dbStatus, setDbStatus] = useState(null);
//   const [loading, setLoading] = useState(true);

//   // IdleHandler component will be rendered inside Router so it can use routing hooks
//   function IdleHandler() {
//     const { useNavigate } = require("react-router-dom");
//     // avoid using hook conditionally; use a real hook
//     // However dynamic require can't return hook — instead import useNavigate at top is needed.
//     return null;
//   }

//   useEffect(() => {
//     const checkConnection = async () => {
//       try {
//         const status = await checkDatabaseConnection();
//         setDbStatus(status);
//       } catch (error) {
//         setDbStatus({ server: "error", database: "disconnected" });
//       } finally {
//         setLoading(false);
//       }
//     };

//     checkConnection();
//     // Check connection every 30 seconds
//     const interval = setInterval(checkConnection, 30000);
//     return () => clearInterval(interval);
//   }, []);

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto"></div>
//           <p className="mt-4 text-gray-600">Connecting to server...</p>
//         </div>
//       </div>
//     );
//   }

//   if (!dbStatus || dbStatus.database === "disconnected") {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="text-center text-red-600">
//           <h2 className="text-2xl font-bold mb-2">Database Connection Error</h2>
//           <p>Unable to connect to the database. Please try again later.</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <Router>
//       <Routes>
//         <Route path="/login" element={<Login />} />
//         <Route path="/signup" element={<Signup />} />
//         <Route
//           path="/"
//           element={
//             <PrivateRoute>
//               <Home />
//             </PrivateRoute>
//           }
//         />
//         <Route
//           path="/order"
//           element={
//             <PrivateRoute>
//               <Order />
//             </PrivateRoute>
//           }
//         />
//       </Routes>
//     </Router>
//   );
// }

export default App;
