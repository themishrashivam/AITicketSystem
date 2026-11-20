import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

import {
  BrowserRouter,
  Route,
  Routes,
} from "react-router-dom";

import CheckAuth from "./components/CheckAuth.jsx";

import Tickets from "./pages/Tickets.jsx";
import TicketDetailsPage from "./pages/Ticket.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Admin from "./pages/Admin.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>

        {/* ==================== HOME ==================== */}
        <Route
          path="/"
          element={
            <CheckAuth protectedRoute={true}>
              <Tickets />
            </CheckAuth>
          }
        />

        {/* ==================== TICKET DETAILS ==================== */}
        <Route
          path="/tickets/:id"
          element={
            <CheckAuth protectedRoute={true}>
              <TicketDetailsPage />
            </CheckAuth>
          }
        />

        {/* ==================== LOGIN ==================== */}
        <Route
          path="/login"
          element={
            <CheckAuth protectedRoute={false}>
              <Login />
            </CheckAuth>
          }
        />

        {/* ==================== SIGNUP ==================== */}
        <Route
          path="/signup"
          element={
            <CheckAuth protectedRoute={false}>
              <Signup />
            </CheckAuth>
          }
        />

        {/* ==================== ADMIN ==================== */}
        <Route
          path="/admin"
          element={
            <CheckAuth protectedRoute={true}>
              <Admin />
            </CheckAuth>
          }
        />

        {/* ==================== 404 ==================== */}
        <Route
          path="*"
          element={
            <div className="min-h-screen flex items-center justify-center bg-base-200">
              <div className="text-center">
                <h1 className="text-6xl font-bold">
                  404
                </h1>

                <p className="text-xl mt-3">
                  Page Not Found
                </p>

                <a
                  href="/"
                  className="btn btn-primary mt-6"
                >
                  Go Home
                </a>
              </div>
            </div>
          }
        />

      </Routes>
    </BrowserRouter>
  </StrictMode>
);