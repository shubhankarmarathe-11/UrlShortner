import { Route, Routes } from "react-router-dom";
import LandingPage from "./pages/Landing/LandingPage";
import Login from "./pages/Auth/Login";
import Signup from "./pages/Auth/Signup";
import Dashboard from "./pages/Profile/Dashboard";
import { AnalyticsPage } from "./pages/Profile/AnalyticsPage";

function App() {
  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <>
              <LandingPage />
            </>
          }
        />
        <Route
          path="/sign-in"
          element={
            <>
              <Login />
            </>
          }
        />
        <Route
          path="/register"
          element={
            <>
              <Signup />
            </>
          }
        />

        <Route
          path="/dashboard"
          element={
            <>
              <Dashboard />
            </>
          }
        />

        <Route
          path="/dashboard/:_id"
          element={
            <>
              <AnalyticsPage />
            </>
          }
        />
      </Routes>
    </>
  );
}

export default App;
