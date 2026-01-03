// src/pages/marketing/SignInPage.jsx
import React from "react";
import { useNavigate, Link } from "react-router-dom";
import UniversalHeader from "../../components/UniversalHeader.jsx";

export default function SignInPage() {
  const navigate = useNavigate();

  return (
    <>`n      <UniversalHeader />
      <div className="w-full bg-white min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* 
            PASTE YOUR STITCH HTML CONTENT HERE
            Replace this comment section with your HTML from Stitch
            
            Make sure to:
            1. Convert HTML attributes to JSX (className instead of class, etc.)
            2. Convert any <a> tags to <Link> components for internal navigation
            3. Update the "Start Practicing Now" button below to use the navigate function
          */}
          
          {/* Primary CTA - "Start Practicing Now" button links to /start */}
          <div className="flex justify-center items-center pt-8">
            <button
              onClick={() => navigate("/start")}
              className="w-full flex justify-center items-center px-8 py-4 bg-blue-600 text-white text-lg font-bold rounded-full hover:bg-blue-700 transition-colors shadow-sm"
            >
              Start Practicing Now
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

