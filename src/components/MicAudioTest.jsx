import React, { useEffect, useRef, useState } from "react";

export default function MicAudioTest() {
    const [status, setStatus] = useState("Idle");
    const [error, setError] = useState("");
    const [isRecording, setIsRecording] = useState(false);
    const [audioUrl, setAudioUrl] = useState("");
    const [hasMicSupport, setHasMicSupport] = useState(true);

    const streamRef = useRef(null);
    const recorderRef = useRef(null);
    const chunksRef = useRef([]);
    const timerRef = useRef(null);

    useEffect(() => {
        const ok =
            typeof navigator !== "undefined" &&
            !!navigator.mediaDevices &&
            typeof navigator.mediaDevices.getUserMedia === "function" &&
            typeof window !== "undefined" &&
            typeof window.MediaRecorder !== "undefined";
        setHasMicSupport(ok);

        return () => {
            cleanup();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function cleanup() {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
        if (recorderRef.current && recorderRef.current.state !== "inactive") {
            try {
                recorderRef.current.stop();
            } catch { }
        }
        recorderRef.current = null;

        if (streamRef.current) {
            try {
                streamRef.current.getTracks().forEach((t) => t.stop());
            } catch { }
            streamRef.current = null;
        }
    }

    function friendlyError(err) {
        const msg = (err && (err.message || err.name)) || String(err);
        if (msg.includes("NotAllowedError") || msg.includes("Permission")) {
            return "Microphone permission blocked. Please allow mic access in your browser site settings and try again.";
        }
        if (msg.includes("NotFoundError") || msg.includes("DevicesNotFound")) {
            return "No microphone detected. Plug in a mic (or enable one) and try again.";
        }
        if (msg.includes("NotReadableError")) {
            return "Your microphone is in use by another app (Zoom/Meet/etc). Close it and try again.";
        }
        if (msg.includes("SecurityError")) {
            return "Microphone access requires a secure context (HTTPS) or localhost.";
        }
        return msg;
    }

    async function startTest() {
        setError("");
        setAudioUrl("");
        setStatus("Requesting microphone…");

        if (!hasMicSupport) {
            setError("Your browser doesn't support microphone recording (MediaRecorder). Try Chrome/Edge.");
            setStatus("Unsupported");
            return;
        }

        // Secure context check (localhost is allowed)
        if (typeof window !== "undefined") {
            const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
            if (!window.isSecureContext && !isLocalhost) {
                setError("Microphone access requires HTTPS (or localhost).");
                setStatus("Blocked");
                return;
            }
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            chunksRef.current = [];
            const recorder = new MediaRecorder(stream);
            recorderRef.current = recorder;

            recorder.ondataavailable = (e) => {
                if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
            };

            recorder.onstart = () => {
                setIsRecording(true);
                setStatus("Recording… (3 seconds)");
            };

            recorder.onstop = () => {
                setIsRecording(false);
                setStatus("Processing…");
                const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
                const url = URL.createObjectURL(blob);
                setAudioUrl(url);
                setStatus("Done — press Play to confirm your audio");
                cleanup();
            };

            recorder.start();

            // record for 3 seconds
            timerRef.current = setTimeout(() => {
                try {
                    recorder.stop();
                } catch { }
            }, 3000);
        } catch (err) {
            setIsRecording(false);
            setError(friendlyError(err));
            setStatus("Failed");
            cleanup();
        }
    }

    function stopEarly() {
        setError("");
        if (recorderRef.current && recorderRef.current.state !== "inactive") {
            try {
                recorderRef.current.stop();
            } catch { }
        }
    }

    return (
        <div
            style={{
                border: "1px solid rgba(0,0,0,0.08)",
                borderRadius: 14,
                padding: 18,
                background: "white",
                boxShadow: "0 1px 8px rgba(0,0,0,0.04)",
            }}
        >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div>
                    <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Mic & Audio Test</div>
                    <div style={{ fontSize: 13, opacity: 0.75 }}>
                        Before you start, confirm your microphone works. We'll record ~3 seconds and play it back.
                    </div>
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                    <button
                        onClick={startTest}
                        disabled={isRecording}
                        style={{
                            padding: "10px 14px",
                            borderRadius: 10,
                            border: "1px solid rgba(0,0,0,0.12)",
                            background: isRecording ? "rgba(0,0,0,0.06)" : "#2563eb",
                            color: isRecording ? "rgba(0,0,0,0.55)" : "white",
                            cursor: isRecording ? "not-allowed" : "pointer",
                            fontWeight: 600,
                        }}
                    >
                        {isRecording ? "Recording…" : "Test Microphone"}
                    </button>

                    <button
                        onClick={stopEarly}
                        disabled={!isRecording}
                        style={{
                            padding: "10px 14px",
                            borderRadius: 10,
                            border: "1px solid rgba(0,0,0,0.12)",
                            background: !isRecording ? "rgba(0,0,0,0.06)" : "white",
                            color: "rgba(0,0,0,0.75)",
                            cursor: !isRecording ? "not-allowed" : "pointer",
                            fontWeight: 600,
                        }}
                    >
                        Stop
                    </button>
                </div>
            </div>

            <div style={{ marginTop: 12, fontSize: 13 }}>
                <div style={{ opacity: 0.8 }}>
                    <strong>Status:</strong> {status}
                </div>

                {error ? (
                    <div style={{ marginTop: 10, color: "#b91c1c", background: "rgba(185,28,28,0.06)", padding: 10, borderRadius: 10 }}>
                        {error}
                    </div>
                ) : null}

                {audioUrl ? (
                    <div style={{ marginTop: 12 }}>
                        <audio controls src={audioUrl} style={{ width: "100%" }} />
                        <div style={{ marginTop: 8, opacity: 0.7 }}>
                            If you can hear yourself clearly, you're good to go.
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
}
