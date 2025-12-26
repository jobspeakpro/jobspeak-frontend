// src/components/RootRouteHandler.jsx
import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import LandingPage from "../pages/marketing/LandingPage.jsx";

/**
 * Handles the root route (/) with redirect logic for logged-in users.
 * 
 * Condition for logged-in state: User has a userKey in localStorage
 * (indicating they've used the app before).
 * 
 * - Logged-in users: Redirect to /start
 * - Logged-out users: Show LandingPage
 */
export default function RootRouteHandler() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if user has an existing userKey (logged-in state)
    const STORAGE_KEY = "jobspeak_user_key";
    const existingUserKey = localStorage.getItem(STORAGE_KEY);
    
    // If user has a userKey, they're considered logged in
    // Redirect them to the start page
    if (existingUserKey) {
      navigate("/start", { replace: true });
      return;
    }
  }, [navigate]);

  // Show landing page for logged-out users
  return <LandingPage />;
}

