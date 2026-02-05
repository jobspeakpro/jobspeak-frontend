import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function MockInterviewGate({ entitlements }) {
    const navigate = useNavigate();
    const { isAuthed } = useAuth();

    const mockData = entitlements?.mockInterview || {};
    const reason = mockData.reason || 'AUTH_REQUIRED';
    const referralCredits = mockData.referralCredits || 0;
    const freeUsed = mockData.freeUsed || false;
    const trialAvailable = mockData.trialAvailable || false;

    // Determine message based on reason
    let title = "Create a free account to start your mock interview";
    let subtitle = "Mock interviews are available after signup. It only takes a moment.";

    if (reason === 'AUTH_REQUIRED' && !isAuthed) {
        title = "Sign in to start a mock interview";
        subtitle = "Mock interviews require an account. Sign in or create a free account to get started.";
    } else if (reason === 'NO_CREDITS' && freeUsed) {
        title = "You've used your free mock interview";
        subtitle = "Earn credits via referrals or upgrade to Pro for unlimited mock interviews.";
    }

    return (
        <div style={{ minHeight: "calc(100vh - 60px)", display: "grid", placeItems: "center", padding: 24 }}>
            <div style={{ maxWidth: 520, width: "100%", textAlign: "center" }}>
                <div style={{ fontSize: 42, marginBottom: 12 }}>🔒</div>
                <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
                    {title}
                </h1>
                <p style={{ opacity: 0.8, marginBottom: 24 }}>
                    {subtitle}
                </p>

                {/* Show referral credits if any */}
                {referralCredits > 0 && (
                    <div style={{
                        padding: "12px 16px",
                        background: "rgba(59, 130, 246, 0.1)",
                        borderRadius: 8,
                        marginBottom: 16,
                        border: "1px solid rgba(59, 130, 246, 0.3)"
                    }}>
                        <p style={{ fontWeight: 600, color: "#3b82f6" }}>
                            🎉 You have {referralCredits} mock interview credit{referralCredits > 1 ? 's' : ''}
                        </p>
                    </div>
                )}

                <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                    {!isAuthed ? (
                        <>
                            <button
                                onClick={() => navigate("/signup")}
                                style={{
                                    padding: "12px 18px",
                                    borderRadius: 10,
                                    border: "none",
                                    cursor: "pointer",
                                    fontWeight: 600,
                                    background: "#3b82f6",
                                    color: "white"
                                }}
                            >
                                Create Free Account
                            </button>

                            <button
                                onClick={() => navigate("/signin")}
                                style={{
                                    padding: "12px 18px",
                                    borderRadius: 10,
                                    border: "1px solid rgba(0,0,0,0.15)",
                                    background: "transparent",
                                    cursor: "pointer",
                                    fontWeight: 600,
                                }}
                            >
                                Sign In
                            </button>
                        </>
                    ) : (
                        <>
                            {trialAvailable && (
                                <button
                                    onClick={() => navigate("/pricing")}
                                    style={{
                                        padding: "12px 18px",
                                        borderRadius: 10,
                                        border: "none",
                                        cursor: "pointer",
                                        fontWeight: 600,
                                        background: "#3b82f6",
                                        color: "white"
                                    }}
                                >
                                    Start 1-Week Free Trial
                                </button>
                            )}

                            <button
                                onClick={() => navigate("/pricing")}
                                style={{
                                    padding: "12px 18px",
                                    borderRadius: 10,
                                    border: "1px solid rgba(0,0,0,0.15)",
                                    background: "transparent",
                                    cursor: "pointer",
                                    fontWeight: 600,
                                }}
                            >
                                Upgrade to Pro
                            </button>
                        </>
                    )}
                </div>

                {/* Referral invitation */}
                {isAuthed && (
                    <div style={{ marginTop: 24, padding: "16px", background: "rgba(0,0,0,0.03)", borderRadius: 8 }}>
                        <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
                            💡 Invite friends → earn mock interview credits
                        </p>
                        <button
                            onClick={() => navigate("/referrals")}
                            style={{
                                padding: "8px 16px",
                                borderRadius: 6,
                                border: "none",
                                cursor: "pointer",
                                fontWeight: 600,
                                background: "#10b981",
                                color: "white",
                                fontSize: 13
                            }}
                        >
                            Get Referral Link
                        </button>
                    </div>
                )}

                <div style={{ marginTop: 18, fontSize: 13, opacity: 0.7 }}>
                    Free users get 1 mock interview. Upgrade anytime for unlimited.
                </div>
            </div>
        </div>
    );
}
