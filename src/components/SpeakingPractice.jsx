// src/components/SpeakingPractice.jsx
import React from "react";

export default function SpeakingPractice() {
  return (
    <div className="min-h-screen bg-rose-50 text-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">
          Speaking Practice
        </h1>

        <div className="bg-white border border-rose-100 rounded-2xl p-6 shadow-sm space-y-6">
          {/* Transcript Box */}
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-2 block">
              Transcript
            </label>
            <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-8 min-h-[200px] flex items-center justify-center">
              <p className="text-sm text-slate-400 text-center">
                Your transcript will appear here.
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="px-5 py-2.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold shadow-sm transition"
            >
              Record
            </button>
            <button
              type="button"
              className="px-5 py-2.5 rounded-full bg-slate-500 hover:bg-slate-600 text-white text-sm font-semibold shadow-sm transition"
            >
              Stop
            </button>
            <button
              type="button"
              className="px-5 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold shadow-sm transition"
            >
              Listen
            </button>
          </div>

          {/* Attempts Label */}
          <div className="bg-rose-50 border border-rose-100 rounded-lg px-4 py-3">
            <p className="text-sm text-slate-700">
              <span className="font-semibold">Free attempts today:</span>{" "}
              <span className="text-rose-600 font-bold">0/3</span>
            </p>
          </div>

          {/* Upgrade Message Area (hidden by default) */}
          <div className="hidden bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
            <p className="text-sm text-amber-900">
              Upgrade message will appear here.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

