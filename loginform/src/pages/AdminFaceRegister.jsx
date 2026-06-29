import { useRef, useEffect, useContext, useState } from "react";
import * as faceapi from "face-api.js";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import "../css/adminFace.css";

function RegisterFace() {
  const { backendUrl } = useContext(AppContext);
  const videoRef = useRef();
  const streamRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [registered, setRegistered] = useState(false);

  useEffect(() => {
    initialize();
    return () => stopCamera();
  }, []);

  const initialize = async () => {
    try {
      await loadModels();
      await startCamera();
      setLoading(false);
    } catch (error) {
      console.error(error);
      alert("Failed to initialize camera");
    }
  };

  const loadModels = async () => {
    await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
    await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
    await faceapi.nets.faceRecognitionNet.loadFromUri("/models");
  };

  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    streamRef.current = stream;
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }
  };

  const registerFace = async () => {
    try {
      setRegistering(true);
      const detection = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        alert("No face detected. Please look directly at the camera.");
        return;
      }

      await axios.post(`${backendUrl}/api/admin/register-face`, {
        descriptor: Array.from(detection.descriptor),
      });

      setRegistered(true);
      stopCamera();
      alert("Face registered successfully!");
    } catch (error) {
      console.error(error);
      alert("Registration failed. Please try again.");
    } finally {
      setRegistering(false);
    }
  };

  return (
    <div className="admin-face-page">
      <div className="admin-face-card">
        {/* Header */}
        <div className="head">
          <h1>Smart Parking</h1>
        </div>
        <h3>Admin Face Registration</h3>

        {/* Icon badge */}
        <div className="face-icon-badge">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
        </div>

        {/* Status pill */}
        <div className={`status-pill ${loading ? "loading" : "ready"}`}>
          <span className="dot" />
          {loading ? "Initialising camera…" : registered ? "Face registered" : "Camera ready"}
        </div>

        {/* Video / loading area */}
        {loading ? (
          <div className="loading-placeholder">
            <div className="spinner" />
            <span style={{ fontSize: 13, color: "#6b7280" }}>Loading face recognition models…</span>
          </div>
        ) : !registered ? (
          <>
            <div className="video-wrapper">
              <video ref={videoRef} autoPlay muted playsInline />
            </div>

            <button
              className="admin-face-btn"
              onClick={registerFace}
              disabled={registering}
            >
              {registering ? (
                <>
                  <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                  Registering…
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width={16} height={16}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Register Face
                </>
              )}
            </button>

            <p className="face-hint">
              Position your face clearly within the frame before clicking Register.
            </p>
          </>
        ) : (
          <p style={{ fontSize: 14, color: "#166534", fontWeight: 500, textAlign: "center" }}>
            ✓ Face registered. You can now use face login to access the admin dashboard.
          </p>
        )}
      </div>
    </div>
  );
}

export default RegisterFace;