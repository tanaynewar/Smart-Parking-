import { useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import "../css/ocrpage.css";

const OcrPage = () => {
    const { backendUrl } = useContext(AppContext);
    const navigate = useNavigate();

    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [plateNumber, setPlateNumber] = useState("");
    const [ownerDetails, setOwnerDetails] = useState(null);
    const [error, setError] = useState("");

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
            setOwnerDetails(null);
            setPlateNumber("");
            setError("");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!image) {
            setError("Please select an image first.");
            return;
        }

        setLoading(true);
        setError("");
        setOwnerDetails(null);

        try {
            const formData = new FormData();
            formData.append("image", image);

            const { data } = await axios.post(
                `${backendUrl}/api/ocr/scan`,
                formData,
                { withCredentials: true }
            );

            if (data.success) {
                setPlateNumber(data.plateNumber);
                setOwnerDetails(data.owner);
            } else {
                setError(data.message || "Could not read the number plate.");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setImage(null);
        setPreview(null);
        setPlateNumber("");
        setOwnerDetails(null);
        setError("");
    };

    return (
        <div className="ocr-page">

            <h1>Number Plate Scanner</h1>

          
            <div className="ocr-upload-card">

                <form onSubmit={handleSubmit}>

                    <div className="ocr-upload-area">
                        {preview ? (
                            <img src={preview} alt="Preview" className="ocr-preview-img" />
                        ) : (
                            <div className="ocr-placeholder">
                                <div className="ocr-placeholder-icon">📷</div>
                                <p>Click to upload a number plate image</p>
                                <span>Supports JPG, PNG, JPEG</span>
                            </div>
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="ocr-file-input"
                        />
                    </div>

                    {error && (
                        <p className="ocr-error">{error}</p>
                    )}

               <div className="ocr-form-actions">
    <button
        type="submit"
        className="btn-primary"
        disabled={loading || !image}
    >
        {loading ? "Scanning..." : "Scan Plate"}
    </button>

    {(preview || ownerDetails) && (
        <>
            <button
                type="button"
                className="ocr-action-btn"
                onClick={handleReset}
            >
                Scan Another
            </button>

            <button
                type="button"
                className="ocr-action-btn"
                onClick={() => navigate("/")}
            >
                Home
            </button>
        </>
    )}
</div>

                </form>

            </div>

         
            {ownerDetails && (
                <div className="ocr-result-card">

                    <div className="ocr-result-header">
                        <h2>Scan Result</h2>
                        <span className="ocr-plate-badge">{plateNumber}</span>
                    </div>

                    <div className="ocr-details-grid">

                        <div className="ocr-detail-item">
                            <span className="ocr-detail-label">Owner Name</span>
                            <span className="ocr-detail-value">{ownerDetails.username || "-"}</span>
                        </div>

                        <div className="ocr-detail-item">
                            <span className="ocr-detail-label">Email</span>
                            <span className="ocr-detail-value">{ownerDetails.email || "-"}</span>
                        </div>

                        <div className="ocr-detail-item">
                            <span className="ocr-detail-label">Phone Number</span>
                            <span className="ocr-detail-value">{ownerDetails.phoneNumber || "-"}</span>
                        </div>

                        <div className="ocr-detail-item">
                            <span className="ocr-detail-label">Car Number</span>
                            <span className="ocr-detail-value">{ownerDetails.car_number || "-"}</span>
                        </div>

                        <div className="ocr-detail-item">
                            <span className="ocr-detail-label">User ID</span>
                            <span className="ocr-detail-value">{ownerDetails.id || "-"}</span>
                        </div>

                        <div className="ocr-detail-item">
                            <span className="ocr-detail-label">Account Status</span>
                            <span className={`badge ${ownerDetails.status}`}>
                                {ownerDetails.status || "-"}
                            </span>
                        </div>

                    </div>

                    <div className="ocr-result-actions">
                        <button
                            className="btn-primary"
                            onClick={() => navigate("/admin")}
                        >
                            Go to Admin Page
                        </button>
                        <button
                            className="btn-secondary"
                            onClick={() => navigate("/transactions")}
                        >
                            Go to Transactions
                        </button>
                    </div>

                </div>
            )}

        </div>
    );
};

export default OcrPage;