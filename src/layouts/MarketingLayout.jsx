// src/layouts/MarketingLayout.jsx
import React from "react";
import { Link } from "react-router-dom";
import UniversalHeader from "../components/UniversalHeader.jsx";

export default function MarketingLayout({ children }) {

  return (
    <div className="marketing-root bg-white text-slate-900 font-display overflow-x-hidden">
      <div className="relative flex min-h-screen w-full flex-col group/design-root">
        {/* UNIVERSAL HEADER */}
        <UniversalHeader />

        {/* MAIN CONTENT */}
        <main className="flex-1">
          {children}
        </main>

        {/* FOOTER */}
        <footer className="w-full bg-white border-t border-slate-200 py-16 px-6 lg:px-40">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
              {/* Brand column */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="size-6 flex items-center justify-center rounded-full bg-blue-100 text-blue-600">
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: 18 }}
                    >
                      graphic_eq
                    </span>
                  </div>
                  <span className="text-slate-900 font-bold text-lg">
                    JobSpeak Pro
                  </span>
                </div>
                <p className="text-sm text-slate-600">
                  Practice your interview English with AI-powered feedback and improve your confidence.
                </p>
              </div>

              {/* Product column */}
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-4 uppercase tracking-wider">
                  Product
                </h3>
                <ul className="space-y-3">
                  <li>
                    <Link to="/how-it-works" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
                      How it works
                    </Link>
                  </li>
                  <li>
                    <Link to="/pricing" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
                      Pricing
                    </Link>
                  </li>
                  <li>
                    <Link to="/start" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
                      Practice
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Resources column */}
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-4 uppercase tracking-wider">
                  Resources
                </h3>
                <ul className="space-y-3">
                  <li>
                    <Link to="/help" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
                      Support
                    </Link>
                  </li>
                  <li>
                    <Link to="/privacy" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
                      Privacy Policy
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Company column */}
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-4 uppercase tracking-wider">
                  Company
                </h3>
                <ul className="space-y-3">
                  <li>
                    <Link to="/terms" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
                      Terms
                    </Link>
                  </li>
                  <li>
                    <Link to="/contact" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
                      Contact
                    </Link>
                  </li>
                  <li>
                    <Link to="/affiliate" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
                      Affiliate
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom row */}
            <div className="border-t border-slate-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-sm text-slate-500">
                © 2024 JobSpeak Pro. All rights reserved.
              </div>
              <div className="flex gap-6 text-sm text-slate-500">
                <Link to="/privacy" className="hover:text-slate-900 transition-colors">
                  Privacy
                </Link>
                <Link to="/terms" className="hover:text-slate-900 transition-colors">
                  Terms
                </Link>
                <a href="#" className="hover:text-slate-900 transition-colors">
                  Cookies
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div >
    </div >
  );
}

