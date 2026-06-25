import { useEffect, useState, useContext } from "react";
import axios from "axios";
import "../css/ParkingFees.css";
import { AppContext } from "../context/AppContext";

const VEHICLE_LABELS = {
    2: {
        label: "2 Wheeler",
        icon: "🛵",
        description: "Motorcycles & Scooters",
    },
    3: {
        label: "3 Wheeler",
        icon: "🛺",
        description: "Auto Rickshaws",
    },
    4: {
        label: "4 Wheeler",
        icon: "🚗",
        description: "Cars & SUVs",
    },
};

export default function ParkingFees() {

    const { backendUrl } = useContext(AppContext);

    const [fees, setFees] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchFees = async () => {

        try {

            const { data } = await axios.get(
                `${backendUrl}/api/fees`,
                {
                    withCredentials: true,
                }
            );

            if (data.success) {
                setFees(data.fees);
            }

        } catch (error) {

            console.log(error);
            alert("Failed to load fees");

        } finally {

            setLoading(false);

        }

    };

    useEffect(() => {
        fetchFees();
    }, []);

    const handleChange = (
        vehicleType,
        value
    ) => {

        setFees((prev) =>
            prev.map((fee) =>
                fee.vehicle_type === vehicleType
                    ? {
                          ...fee,
                          amount: value,
                      }
                    : fee
            )
        );

    };

    const saveFee = async (
        vehicleType,
        amount
    ) => {

        try {

            const { data } = await axios.put(
                `${backendUrl}/api/fees`,
                {
                    vehicleType,
                    amount,
                },
                {
                    withCredentials: true,
                }
            );

            if (data.success) {
                alert("Fee Updated Successfully");
            }

        } catch (error) {

            console.log(error);
            alert("Failed To Update Fee");

        }

    };

    if (loading) {

        return (
            <div className="pf-state">
                <p>Loading Fees...</p>
            </div>
        );

    }

    return (

        <div className="pf-page">

            <div className="pf-header">

                <div>

                    <h1 className="pf-title">
                        Parking Fee Management
                    </h1>

                    <p className="pf-subtitle">
                        Set parking fees for vehicles
                    </p>

                </div>

            </div>

            <div className="pf-grid">

                {fees.map((fee) => {

                    const vehicle =
                        VEHICLE_LABELS[fee.vehicle_type];

                    return (

                        <div
                            key={fee.vehicle_type}
                            className="pf-card"
                        >

                            <div className="pf-card-icon">
                                {vehicle?.icon}
                            </div>

                            <div className="pf-card-body">

                                <p className="pf-card-label">
                                    {vehicle?.label}
                                </p>

                                <p className="pf-card-desc">
                                    {vehicle?.description}
                                </p>

                                <div className="pf-edit-row">

                                    <span className="pf-currency">
                                        ₹
                                    </span>

                                    <input
                                        className="pf-input"
                                        type="number"
                                        value={fee.amount}
                                        onChange={(e) =>
                                            handleChange(
                                                fee.vehicle_type,
                                                e.target.value
                                            )
                                        }
                                    />

                                    <span className="pf-per-hour">
                                        / hr
                                    </span>

                                </div>

                            </div>

                            <div className="pf-card-actions">

                                <button
                                    className="pf-btn pf-btn--save"
                                    onClick={() =>
                                        saveFee(
                                            fee.vehicle_type,
                                            fee.amount
                                        )
                                    }
                                >
                                    Save
                                </button>

                            </div>

                        </div>

                    );

                })}

            </div>

        </div>

    );

}