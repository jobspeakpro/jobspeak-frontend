import React, { useState, useEffect } from "react";
import Joyride, { STATUS } from "react-joyride";
import { useLocation } from "react-router-dom";

export default function PracticeTour() {
    const location = useLocation();
    const [run, setRun] = useState(false);

    // Dev-only reset helper
    useEffect(() => {
        if (import.meta.env.DEV) {
            window.resetPracticeTour = () => {
                localStorage.removeItem("jsp_practice_tour_done_v1");
                console.log("Tour reset. Refresh page to see it again.");
            };
        }
    }, []);

    useEffect(() => {
        // Only run on /practice
        if (location.pathname !== "/practice") return;

        // Check if tour is already done
        const done = localStorage.getItem("jsp_practice_tour_done_v1");
        if (!done) {
            setRun(true);
        }
    }, [location.pathname]);

    const handleJoyrideCallback = (data) => {
        const { status } = data;
        const finishedStatuses = [STATUS.FINISHED, STATUS.SKIPPED];

        if (finishedStatuses.includes(status)) {
            setRun(false);
            localStorage.setItem("jsp_practice_tour_done_v1", "1");
        }
    };

    const steps = [
        {
            target: '[data-tour="voice-select"]',
            content: (
                <div className="text-left">
                    <h4 className="font-bold text-lg mb-2">Choose your voice</h4>
                    <p className="text-sm">Pick a voice and optionally enable autoplay.</p>
                </div>
            ),
            disableBeacon: true,
        },
        {
            target: '[data-tour="mic-button"]',
            content: (
                <div className="text-left">
                    <h4 className="font-bold text-lg mb-2">Answer out loud</h4>
                    <p className="text-sm">Tap the mic to record. You can retry as many times as you want.</p>
                </div>
            ),
        },
        {
            target: '[data-tour="guidance"]',
            content: (
                <div className="text-left">
                    <h4 className="font-bold text-lg mb-2">Get instant feedback</h4>
                    <p className="text-sm">We'll rewrite your answer and show what to improve.</p>
                </div>
            ),
            placement: "top", // usually guidance is low on screen
        },
        {
            target: '[data-tour="free-banner"]',
            content: (
                <div className="text-left">
                    <h4 className="font-bold text-lg mb-2">Free questions</h4>
                    <p className="text-sm">You can try a few questions free each day.</p>
                </div>
            ),
        },
    ];

    if (!run) return null;

    return (
        <Joyride
            steps={steps}
            run={run}
            continuous
            showSkipButton
            showProgress
            callback={handleJoyrideCallback}
            styles={{
                options: {
                    zIndex: 10000,
                    primaryColor: '#2563eb', // Blue-600 to match primary
                    backgroundColor: '#ffffff',
                    arrowColor: '#ffffff',
                    textColor: '#1e293b',
                    overlayColor: 'rgba(0, 0, 0, 0.6)', // Dark overlay
                },
                buttonNext: {
                    backgroundColor: '#2563eb',
                    fontSize: '14px',
                    padding: '8px 16px',
                    fontWeight: 'bold',
                    borderRadius: '6px',
                },
                buttonBack: {
                    color: '#64748b',
                    marginRight: 10,
                },
                buttonSkip: {
                    color: '#64748b',
                    fontSize: '14px',
                },
                tooltip: {
                    borderRadius: '12px',
                    padding: '12px',
                },
                tooltipContainer: {
                    textAlign: "left"
                }
            }}
            floaterProps={{
                disableAnimation: true,
            }}
        />
    );
}
