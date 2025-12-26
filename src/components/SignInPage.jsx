// src/components/SignInPage.jsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function SignInPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to interview practice page (no separate sign-in needed)
    navigate("/interview", { replace: true });
  }, [navigate]);

  return null;
}

