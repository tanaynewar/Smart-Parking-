import { useEffect, useRef, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import "../css/qrpage.css";

// ── Notes on the backend contract (routes/qrRoute.js + controllers/qrController.js) ──
// POST /api/qr/scan
//   - expects multipart/form-data with a single file field named "image"
//     (middleware/upload.js -> upload.single("image"))
//   - the backend decodes the QR itself from the image (qrcode-reader + Jimp),
//     looks the user up by car_number (the QR just encodes the raw car number
//     string — see controllers/authcontroller.js where it's generated),
//     checks the parking fee for that vehicle type, debits the wallet, and
//     creates a transaction — all in one call.
//   - success: { success: true, message, owner, transaction }
//   - insufficient balance: { success: false, message: "...Insufficient...", owner } (HTTP 400)
//   - other errors: { success: false, message }
//
// Both the live-camera flow and the manual-upload flow below ultimately do the
// exact same thing: get an image file, then POST it to /api/qr/scan.

const DETECT_INTERVAL_MS = 350; // how often we check the live feed for a QR code
const SCAN_COOLDOWN_MS = 4000; // prevent re-submitting the same QR repeatedly

const QrPage = () => {

    const { backendUrl } = useContext(AppContext);
    const navigate = useNavigate();

    // "live" | "upload"
    const [mode, setMode] = useState("live");

    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);
    const detectTimerRef = useRef(null);
    const lastScannedRef = useRef(null);
    const lastScanTimeRef = useRef(0);
    const isSubmittingRef = useRef(false);
    const fileInputRef = useRef(null);

    const [status, setStatus] = useState("idle"); // idle | scanning | processing | success | insufficient | error
    const [message, setMessage] = useState("");
    const [scannedUser, setScannedUser] = useState(null);
    const [transaction, setTransaction] = useState(null);
    const [cameraError, setCameraError] = useState(false);
    const [uploadPreview, setUploadPreview] = useState(null);

    // ── Load jsQR dynamically ──────────────────────────────────────────────
    const loadJsQR = () =>
        new Promise((resolve, reject) => {
            if (window.jsQR) return resolve(window.jsQR);
            const script = document.createElement("script");
            script.src = "https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js";
            script.onload = () => resolve(window.jsQR);
            script.onerror = () => reject(new Error("Failed to load jsQR"));
            document.head.appendChild(script);
        });

    // ── Start camera ──────────────────────────────────────────────────────
    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } }
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
            }
            setStatus("scanning");
        } catch {
            setCameraError(true);
            setStatus("error");
            setMessage("Camera access denied. Please allow camera permissions and refresh.");
        }
    };

    // ── Stop camera ────────────────────────────────────────────────────────
    const stopCamera = () => {
        if (detectTimerRef.current) clearInterval(detectTimerRef.current);
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((t) => t.stop());
            streamRef.current = null;
        }
    };

    // ── Grab the current video frame as a Blob (real image file) ──────────
    const captureFrameAsBlob = () =>
        new Promise((resolve) => {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
                return resolve(null);
            }
            const ctx = canvas.getContext("2d");
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.92);
        });

    // ── Detection loop: only checks IF a QR is visible in frame ───────────
    // jsQR runs purely client-side just to know *when* to submit a frame —
    // we never send the decoded text anywhere. The backend does its own
    // decode from the uploaded image, so the image itself is the payload.
    const detectLoop = async (jsQR) => {
        const video = videoRef.current;
        const canvas = canvasRef.current;

        if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
            return;
        }

        const ctx = canvas.getContext("2d");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert",
        });

        if (!code || isSubmittingRef.current) return;

        const now = Date.now();
        const isDuplicate =
            code.data === lastScannedRef.current &&
            now - lastScanTimeRef.current < SCAN_COOLDOWN_MS;

        if (isDuplicate) return;

        lastScannedRef.current = code.data;
        lastScanTimeRef.current = now;

        const blob = await captureFrameAsBlob();
        if (blob) {
            submitImage(blob, "qr-frame.jpg");
        }
    };

    // ── Submit an image (Blob or File) to the backend ──────────────────────
    const submitImage = async (fileOrBlob, filename) => {
        if (isSubmittingRef.current) return;
        isSubmittingRef.current = true;

        setStatus("processing");
        if (detectTimerRef.current) clearInterval(detectTimerRef.current);

        try {
            const formData = new FormData();
            // Field name MUST be "image" — matches upload.single("image")
            // in middleware/upload.js used by routes/qrRoute.js
            formData.append("image", fileOrBlob, filename);

            const { data } = await axios.post(
                `${backendUrl}/api/qr/scan`,
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );

            // Backend responds via sendSuccess(res, 200, "Auto-debit successful", { owner, transaction })
            if (data.success) {
                setScannedUser(data.owner);
                setTransaction(data.transaction);
                setStatus("success");
                setMessage(
                    `₹${data.transaction?.transactionAmount} debited successfully from ${data.owner?.username || "user"}'s wallet.`
                );
                stopCamera();

                setTimeout(() => {
                    navigate(`/transactions`);
                }, 2500);
            } else {
                handleFailure(data);
            }
        } catch (error) {
            handleFailure(error?.response?.data);
        } finally {
            isSubmittingRef.current = false;
        }
    };

    // ── Failure handling (insufficient balance vs other errors) ────────────
    const handleFailure = (data) => {
        const msg = data?.message || "Something went wrong. Please try again.";

        // qrController.js returns { success: false, message: "Insufficient wallet balance for auto-debit", owner } with a 400
        if (msg.toLowerCase().includes("insufficient") || msg.toLowerCase().includes("balance")) {
            setScannedUser(data?.owner || null);
            setStatus("insufficient");
            setMessage(msg);
        } else {
            setStatus("error");
            setMessage(msg);
        }
        stopCamera();
    };

    // ── Upload mode: handle file selection ─────────────────────────────────
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setScannedUser(null);
        setTransaction(null);
        setMessage("");
        setUploadPreview(URL.createObjectURL(file));
        setStatus("processing");

        submitImage(file, file.name);
    };

    // ── Reset (shared by both modes) ────────────────────────────────────────
    const resetState = () => {
        setStatus("idle");
        setMessage("");
        setScannedUser(null);
        setTransaction(null);
        setUploadPreview(null);
        lastScannedRef.current = null;
        lastScanTimeRef.current = 0;
        isSubmittingRef.current = false;
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    // ── Retry (re-arms whichever mode is active) ────────────────────────────
    const handleRetry = async () => {
        resetState();

        if (mode === "live") {
            const jsQR = await loadJsQR();
            await startCamera();
            detectTimerRef.current = setInterval(() => detectLoop(jsQR), DETECT_INTERVAL_MS);
        }
    };

    // ── Switch between Live Camera / Upload ─────────────────────────────────
    const switchMode = async (nextMode) => {
        if (nextMode === mode) return;

        stopCamera();
        resetState();
        setCameraError(false);
        setMode(nextMode);

        if (nextMode === "live") {
            try {
                const jsQR = await loadJsQR();
                await startCamera();
                detectTimerRef.current = setInterval(() => detectLoop(jsQR), DETECT_INTERVAL_MS);
            } catch {
                setCameraError(true);
                setStatus("error");
                setMessage("Could not initialize QR scanner.");
            }
        }
    };

    // ── Init: start in live mode ─────────────────────────────────────────────
    useEffect(() => {
        let mounted = true;

        (async () => {
            try {
                const jsQR = await loadJsQR();
                if (!mounted) return;
                await startCamera();
                if (!mounted) return;
                detectTimerRef.current = setInterval(() => detectLoop(jsQR), DETECT_INTERVAL_MS);
            } catch {
                if (mounted) {
                    setCameraError(true);
                    setStatus("error");
                    setMessage("Could not initialize QR scanner.");
                }
            }
        })();

        return () => {
            mounted = false;
            stopCamera();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── UI helpers ────────────────────────────────────────────────────────
    const isProcessing = status === "processing";
    const isDone = ["success", "insufficient", "error"].includes(status);

    return (
        <div className="qr-page">

            <div className="qr-page-header">
                <button className="btn-secondary" onClick={() => { stopCamera(); navigate(-1); }}>
                    ← Back
                </button>
                <h1>Scan QR to Debit</h1>
            </div>

            {/* Mode toggle */}
            <div className="qr-mode-toggle">
                <button
                    type="button"
                    className={`qr-mode-btn ${mode === "live" ? "qr-mode-btn--active" : ""}`}
                    onClick={() => switchMode("live")}
                >
                    📷 Live Camera
                </button>
                <button
                    type="button"
                    className={`qr-mode-btn ${mode === "upload" ? "qr-mode-btn--active" : ""}`}
                    onClick={() => switchMode("upload")}
                >
                    🖼 Upload Image
                </button>
            </div>

            <div className="qr-card">

                {/* ── LIVE CAMERA MODE ───────────────────────────────────── */}
                {mode === "live" && !isDone && !cameraError && (
                    <div className={`qr-viewport ${isProcessing ? "qr-viewport--processing" : ""}`}>
                        <video ref={videoRef} className="qr-video" playsInline muted />
                        <canvas ref={canvasRef} className="qr-canvas-hidden" />

                        {/* Corner guides */}
                        <div className="qr-frame">
                            <span className="qr-corner qr-corner--tl" />
                            <span className="qr-corner qr-corner--tr" />
                            <span className="qr-corner qr-corner--bl" />
                            <span className="qr-corner qr-corner--br" />
                        </div>

                        {/* Scan line animation */}
                        {status === "scanning" && (
                            <div className="qr-scanline" />
                        )}

                        {isProcessing && (
                            <div className="qr-processing-overlay">
                                <div className="qr-spinner" />
                                <p>Processing transaction…</p>
                            </div>
                        )}
                    </div>
                )}

                {/* ── UPLOAD MODE ────────────────────────────────────────── */}
                {mode === "upload" && !isDone && (
                    <div className="ocr-upload-area">

                        <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="ocr-file-input"
                            id="qr-file-input"
                            disabled={isProcessing}
                        />

                        {!uploadPreview && (
                            <div className="ocr-placeholder">
                                <div className="ocr-placeholder-icon">🖼️</div>
                                <p>Click to upload QR image</p>
                                <span>PNG, JPG, JPEG supported</span>
                            </div>
                        )}

                        {uploadPreview && (
                            <img src={uploadPreview} alt="QR Preview" className="ocr-preview-img" />
                        )}

                        {isProcessing && uploadPreview && (
                            <div className="qr-processing-overlay">
                                <div className="qr-spinner" />
                                <p>Processing transaction…</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Result card (shared by both modes) */}
                {isDone && (
                    <div className={`qr-result qr-result--${status}`}>

                        <div className="qr-result-icon">
                            {status === "success"  && "✓"}
                            {status === "insufficient" && "⚠"}
                            {status === "error"    && "✕"}
                        </div>

                        <p className="qr-result-title">
                            {status === "success"      && "Payment Successful"}
                            {status === "insufficient" && "Insufficient Balance"}
                            {status === "error"        && "Transaction Failed"}
                        </p>

                        {scannedUser && (
                            <p className="qr-result-user">
                                {scannedUser.username}
                                {scannedUser.car_number ? ` • ${scannedUser.car_number}` : ""}
                            </p>
                        )}

                        <p className="qr-result-msg">{message}</p>

                        {status === "success" && transaction?.receiptNo && (
                            <span className="badge approved">Receipt: {transaction.receiptNo}</span>
                        )}

                        {status === "success" && (
                            <p className="qr-result-redirect">Redirecting to dashboard…</p>
                        )}

                        {(status === "insufficient" || status === "error") && (
                            <button className="btn-primary" onClick={handleRetry}>
                                Scan Again
                            </button>
                        )}

                    </div>
                )}

                {/* Hint text */}
                {mode === "live" && status === "scanning" && (
                    <p className="qr-hint">Point the camera at the user's QR code</p>
                )}

                {mode === "live" && cameraError && !isDone && (
                    <p className="qr-hint qr-hint--error">
                        Camera unavailable. Try the "Upload Image" option instead.
                    </p>
                )}

            </div>
        </div>
        
    );
};

export default QrPage;