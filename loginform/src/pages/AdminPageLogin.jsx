import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import * as faceapi from "face-api.js";
import { AppContext } from "../context/AppContext";

const AdminFaceLogin = () => {
    const {backendUrl} = useContext(AppContext)
    const videoRef = useRef(null);
    const streamRef = useRef(null);

    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [verifying, setVerifying] = useState(false);

    useEffect(() => {
        initialize();

        return () => {
            stopCamera();
        };
    }, []);

    const initialize = async () => {
        try {
            await loadModels();
            await startCamera();
            setLoading(false);
        } catch (error) {
            console.error(error);
            alert("Failed to initialize face recognition");
        }
    };

    const loadModels = async () => {
        await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
        await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
        await faceapi.nets.faceRecognitionNet.loadFromUri("/models");
    };

    const startCamera = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: "user"
            }
        });

        streamRef.current = stream;

        if (videoRef.current) {
            videoRef.current.srcObject = stream;
            await videoRef.current.play();
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }
    };

    const verifyFace = async () => {
        try {
            setVerifying(true);

            const detection = await faceapi
                .detectSingleFace(
                    videoRef.current,
                    new faceapi.TinyFaceDetectorOptions()
                )
                .withFaceLandmarks()
                .withFaceDescriptor();

            if (!detection) {
                alert("No face detected");
                return;
            }

            const descriptor = Array.from(detection.descriptor);

            const response = await axios.post(
                `${backendUrl}/api/admin/verify-face`,
                {
                    descriptor
                }
            );

            if (response.data.success) {
                localStorage.setItem(
                    "adminVerified",
                    "true"
                );

                stopCamera();

                navigate("/");
            } else {
                alert("Face not matched");
            }
        } catch (error) {
            console.error(error);
            alert("Verification failed");
        } finally {
            setVerifying(false);
        }
    };

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "20px",
                padding: "30px"
            }}
        >
            <h2>Admin Face Verification</h2>

            {loading ? (
                <p>Loading Camera...</p>
            ) : (
                <>
                    <video
                        ref={videoRef}
                        autoPlay
                        muted
                        playsInline
                        width="500"
                        style={{
                            border: "2px solid #ccc",
                            borderRadius: "10px"
                        }}
                    />

                    <button
                        onClick={verifyFace}
                        disabled={verifying}
                        style={{
                            padding: "12px 24px",
                            cursor: "pointer"
                        }}
                    >
                        {verifying
                            ? "Verifying..."
                            : "Verify Face"}
                    </button>
                </>
            )}
        </div>
    );
};

export default AdminFaceLogin;