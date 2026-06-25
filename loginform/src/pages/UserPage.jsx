import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import "../css/userpage.css";
import { PAYMENT_STATUS } from "../utils/constant";

const UserDashboard = () => {

    const { backendUrl } = useContext(AppContext);
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [wallet, setWallet] = useState({
        totalCredit: 0,
        totalDebit: 0,
        walletBalance: 0
    });

    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);

    const [pagination, setPagination] = useState({
        totalTransactions: 0,
        currentPage: 1,
        transactionsPerPage: 10
    });

    const fetchUserData = async () => {
        try {
            const { data } = await axios.get(
                `${backendUrl}/api/user/data`,
                { withCredentials: true }
            );
            if (data.success) {
                setUser(data.userData);
                fetchTransactions(data.userData.id);
                fetchWalletData();
            }
        } catch (error) {
            console.log(error);
        }
    };

    const fetchWalletData = async () => {
        try {
            const { data } = await axios.get(
                `${backendUrl}/api/transactions/wallet`,
                { withCredentials: true }
            );
            if (data.success) {
                setWallet({
                    totalCredit: Number(data.wallet.totalCredit || 0),
                    totalDebit: Number(data.wallet.totalDebit || 0),
                    walletBalance: Number(data.wallet.walletBalance || 0)
                });
            }
        } catch (error) {
            console.log(error);
        }
    };

    const fetchTransactions = async (userId, currentPage = 1) => {
        try {
            const { data } = await axios.get(
                `${backendUrl}/api/transactions/user/${userId}`,
                {
                    params: { page: currentPage, limit }
                }
            );
            if (data.success) {
                setTransactions(data.transactions || []);
                setPagination({
                    totalTransactions: data.totalTransactions,
                    currentPage: data.currentPage,
                    transactionsPerPage: data.transactionsPerPage
                });
                setPage(data.currentPage);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const handleLogout = async () => {
        try {
            await axios.post(
                `${backendUrl}/api/auth/logout`,
                {},
                { withCredentials: true }
            );
            navigate("/login");
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        fetchUserData();
    }, []);

    useEffect(() => {
        if (user) {
            fetchTransactions(user.id, 1);
        }
    }, [limit]);

    const totalPages = Math.max(
        Math.ceil(pagination.totalTransactions / limit),
        1
    );

    const from =
        pagination.totalTransactions === 0
            ? 0
            : (page - 1) * limit + 1;

    const to = Math.min(page * limit, pagination.totalTransactions);

    const totalCredit = wallet.totalCredit;
    const totalDebit = wallet.totalDebit;
    const walletBalance = wallet.walletBalance;

    const getStatusClass = (status) => {
        if (status === PAYMENT_STATUS.SUCCESS) return "status-success";
        if (status === PAYMENT_STATUS.FAILED) return "status-failed";
        return "status-pending";
    };

    const getTypeClass = (type) => {
        if (type === "credit") return "type-credit";
        return "type-debit";
    };

    const getInitials = (name) => {
        if (!name) return "U";
        return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-layout">

                {user && (
                    <aside className="sidebar">
                        <div className="sidebar-profile-card">
                            <div className="avatar-circle">
                                {getInitials(user.name)}
                            </div>
                            <h2 className="sidebar-name">{user.name}</h2>
                            <p className="sidebar-email">{user.email}</p>
                            <div className="sidebar-qr">
                                <img src={user.qr_code} alt="QR Code" />
                                <span>Your QR Code</span>
                            </div>
                        </div>

                        <div className="sidebar-details-card">
                            <p className="sidebar-section-label">Details</p>
                            <div className="detail-row">
                                <span className="detail-key">Phone</span>
                                <span className="detail-val">{user.phoneNumber}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-key">Vehicle</span>
                                <span className="detail-val">{user.car_number}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-key">Vehicle Type</span>
                                <span className="detail-val">
                                    {{
                                        2: "2 Wheeler",
                                        3: "3 Wheeler",
                                        4: "4 Wheeler",
                                    }[user.vehicle_type] ?? `Type ${user.vehicle_type}`}
                                </span>
                            </div>
                            <div className="detail-row" style={{ borderBottom: "none" }}>
                                <span className="detail-key">Status</span>
                                <span className={`status-pill status-pill--${user.status}`}>
                                    {user.status}
                                </span>
                            </div>
                        </div>

                        <button className="home-btn" onClick={() => navigate("/")}>
                            Home
                        </button>
                        <button className="logout-btn" onClick={handleLogout}>
                            Logout
                        </button>
                    </aside>
                )}

                <main className="main-content">

                    {/* ── Wallet Metrics ── */}
                    <div className="wallet-metrics">
                        <div className="metric-card metric-card--blue">
                            <p className="metric-label">Wallet Balance</p>
                            <p className="metric-value">₹{walletBalance.toFixed(2)}</p>
                        </div>
                        <div className="metric-card metric-card--green">
                            <p className="metric-label">Total Credit</p>
                            <p className="metric-value">₹{totalCredit.toFixed(2)}</p>
                        </div>
                        <div className="metric-card metric-card--red">
                            <p className="metric-label">Total Debit</p>
                            <p className="metric-value">₹{totalDebit.toFixed(2)}</p>
                        </div>
                    </div>

                    {/* ── Transactions Table ── */}
                    <div className="transaction-card">
                        <h2>My Transactions</h2>

                        {/* ── Meta row ── */}
                        <div className="meta-row">
                            <span>
                                {pagination.totalTransactions === 0
                                    ? "No transactions found"
                                    : `Showing ${from} - ${to} of ${pagination.totalTransactions} transactions`}
                            </span>
                            <div className="per-page">
                                <span>Rows per page:</span>
                                <select
                                    value={limit}
                                    onChange={(e) => {
                                        setLimit(Number(e.target.value));
                                        setPage(1);
                                    }}
                                >
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                    <option value={50}>50</option>
                                </select>
                            </div>
                        </div>

                        <table className="transaction-table">
                            <thead>
                                <tr>
                                    <th>Transaction ID</th>
                                    <th>Amount</th>
                                    <th>Type</th>
                                    <th>Status</th>
                                    <th>Method</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map((transaction) => (
                                    <tr key={transaction.id}>
                                        <td>{transaction.transaction_id}</td>
                                        <td>₹{transaction.transaction_amount}</td>
                                        <td>
                                            <span className={`type-badge ${getTypeClass(transaction.transaction_type)}`}>
                                                {transaction.transaction_type}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`status-badge ${getStatusClass(transaction.payment_status)}`}>
                                                {transaction.payment_status === PAYMENT_STATUS.PENDING
                                                    ? "Pending"
                                                    : transaction.payment_status === PAYMENT_STATUS.SUCCESS
                                                    ? "Success"
                                                    : transaction.payment_status === PAYMENT_STATUS.FAILED
                                                    ? "Failed"
                                                    : "Unknown"}
                                            </span>
                                        </td>
                                        <td>{transaction.payment_method}</td>
                                        <td>
                                            {new Date(transaction.created_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* ── Pagination ── */}
                        {totalPages > 1 && (
                            <div className="pagination">
                                <button
                                    className="page-btn"
                                    disabled={page === 1}
                                    onClick={() => fetchTransactions(user.id, page - 1)}
                                >
                                    Prev
                                </button>
                                <button
                                    className="page-btn"
                                    disabled={page === totalPages}
                                    onClick={() => fetchTransactions(user.id, page + 1)}
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>

                </main>
            </div>
        </div>
    );
};

export default UserDashboard;