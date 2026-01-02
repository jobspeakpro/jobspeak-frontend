import { useNavigate } from "react-router-dom";

export default function MockInterviewGate() {
    const navigate = useNavigate();

    return (
        <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
            <div style={{ maxWidth: 520, width: "100%", textAlign: "center" }}>
                <div style={{ fontSize: 42, marginBottom: 12 }}>🔒</div>
                <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
                    Create a free account to start your mock interview
                </h1>
                <p style={{ opacity: 0.8, marginBottom: 24 }}>
                    Mock interviews are available after signup. It only takes a moment.
                </p>

                <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                    <button
                        onClick={() => navigate("/signup")}
                        style={{
                            padding: "12px 18px",
                            borderRadius: 10,
                            border: "none",
                            cursor: "pointer",
                            fontWeight: 600,
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
                </div>

                <div style={{ marginTop: 18, fontSize: 13, opacity: 0.7 }}>
                    Free users get 1 mock interview. Upgrade anytime for unlimited.
                </div>
            </div>
        </div>
    );
}
