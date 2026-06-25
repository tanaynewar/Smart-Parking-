import { useState, useEffect, useContext } from "react";
import axios from "axios";
import "../css/transactionpage.css";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";

import { PAYMENT_STATUS } from "../utils/constant";

const Transaction = () => {
    const navigate = useNavigate();

    const { backendUrl } = useContext(AppContext);

    const [transactions, setTransactions] = useState([]);
    const [users, setUsers] = useState([]);
    const [transactionType, setTransactionType] = useState("credit");

    const [selectedUserId, setSelectedUserId] = useState("");
    const [transactionAmount, setTransactionAmount] = useState("");

    // paymentType only used for credit (add money) — cash/upi/card/net_banking
    const [paymentType, setPaymentType] = useState("cash");

    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("all");
    const [type, setType] = useState("all");

    const [sort, setSort] = useState("id-greatest");

    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);

    const [pagination, setPagination] = useState({
        totalTransactions: 0,
        currentPage: 1,
        transactionsPerPage: 10
    });

    const fetchTransactions = async (currentPage = 1) => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/transactions/all`, {
                params: { search, status, type, sort, page: currentPage, limit },
                withCredentials: true
            });

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

    const fetchUsers = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/user/all-users`, {
                withCredentials: true
            });
            if (data.success) {
                setUsers(data.users);
            }
        } catch (error) {
            console.log(error.response?.data?.message || error.message);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        fetchTransactions(1);
    }, [search, status, type, sort, limit]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {

            if (transactionType === "credit") {
                /*
                 * adminAddMoneyController — credits the selected user's wallet.
                 * Sends userId in the body so backend adds money to that user,
                 * not the logged-in admin.
                 */
                const { data } = await axios.post(
                    `${backendUrl}/api/transactions/wallet/add-money`,
                    {
                        userId: selectedUserId,   // selected user — money goes to their wallet
                        amount: transactionAmount,
                        paymentType,              // cash | upi | card | net_banking
                    },
                    { withCredentials: true }
                );

                if (data.success) {
                    alert("Money added successfully");
                    setSelectedUserId("");
                    setTransactionAmount("");
                    setPaymentType("cash");
                    fetchTransactions(page);
                }

            } else {
                /*
                 * createTransactionController — debit only.
                 * paymentMethod is hardcoded to "wallet" on the backend too,
                 * but we still send it to satisfy the required-fields check.
                 */
                const transactionId =
                    Math.floor(Math.random() * 900000000) + 100000000;

                const { data } = await axios.post(
                    `${backendUrl}/api/transactions/create`,
                    {
                        userId: selectedUserId,
                        transactionId,
                        transactionAmount,
                        transactionType,            // "debit"
                        paymentStatus: PAYMENT_STATUS.PENDING,
                        paymentMethod: "wallet",
                    },
                    { withCredentials: true }
                );

                if (data.success) {
                    alert("Transaction Created");
                    setSelectedUserId("");
                    setTransactionAmount("");
                    fetchTransactions(page);
                }
            }

        } catch (error) {
            alert(
                error.response?.data?.message ||
                error.message ||
                "Transaction failed"
            );
            console.log(error);
        }
    };

    const deleteTransaction = async (transactionId) => {
        try {
            const { data } = await axios.delete(
                `${backendUrl}/api/transactions/delete/${transactionId}`,
                { withCredentials: true }
            );
            if (data.success) {
                fetchTransactions(page);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const updateStatus = async (transactionId, paymentStatus) => {
        try {
            const { data } = await axios.put(
                `${backendUrl}/api/transactions/status/${transactionId}`,
                { paymentStatus },
                { withCredentials: true }
            );
            if (data.success) {
                fetchTransactions(page);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const getStatusClass = (status) => {
        if (status === PAYMENT_STATUS.SUCCESS) return "status-success";
        if (status === PAYMENT_STATUS.FAILED)  return "status-failed";
        return "status-pending";
    };

    const getPaymentTypeClass = (pt) => {
        const map = {
            cash:        "type-cash",
            upi:         "type-upi",
            card:        "type-card",
            net_banking: "type-netbanking",
        };
        return map[pt] || "type-other";
    };

    const handleSort = (field) => {
        if (field === "id") {
            setSort(sort === "id-greatest" ? "id-least" : "id-greatest");
        }
        if (field === "amount") {
            setSort(sort === "amount-greatest" ? "amount-least" : "amount-greatest");
        }
        if (field === "created") {
            setSort(sort === "created-newest" ? "created-oldest" : "created-newest");
        }
        setPage(1);
    };

    const totalPages = Math.max(
        Math.ceil(pagination.totalTransactions / limit),
        1
    );

    const from =
        pagination.totalTransactions === 0
            ? 0
            : (page - 1) * limit + 1;

    const to = Math.min(page * limit, pagination.totalTransactions);

    return (
        <div className="transaction-container">

            <h1>Transaction Management</h1>

            <div className="transaction-form-card">
                <form className="transaction-form" onSubmit={handleSubmit}>

                    {/* User — always visible and required for both credit and debit */}
                    <div className="form-field">
                        <label>Select User</label>
                        <select
                            value={selectedUserId}
                            onChange={(e) => setSelectedUserId(e.target.value)}
                            required
                        >
                            <option value="">Select User</option>
                            {users.map((user) => (
                                <option key={user.id} value={user.id}>
                                    {user.username} ({user.email})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Amount */}
                    <div className="form-field">
                        <label>Amount (₹)</label>
                        <input
                            type="number"
                            placeholder="Enter amount"
                            value={transactionAmount}
                            onChange={(e) => setTransactionAmount(e.target.value)}
                            required
                            min="1"
                        />
                    </div>

                    {/* Transaction Type */}
                    <div className="form-field">
                        <label>Transaction Type</label>
                        <select
                            value={transactionType}
                            onChange={(e) => {
                                setTransactionType(e.target.value);
                                setPaymentType("cash");
                                setSelectedUserId("");
                            }}
                        >
                            <option value="credit">Credit</option>
                            <option value="debit">Debit</option>
                        </select>
                    </div>

                    {/* Payment Method — always Wallet, read-only */}
                    <div className="form-field">
                        <label>Payment Method</label>
                        <div className="fixed-method-badge">Wallet</div>
                    </div>

                    {/* Payment Type — only for credit (add money) */}
                    {transactionType === "credit" && (
                        <div className="form-field">
                            <label>Payment Type</label>
                            <select
                                value={paymentType}
                                onChange={(e) => setPaymentType(e.target.value)}
                                required
                            >
                                <option value="cash">Cash</option>
                                <option value="upi">UPI</option>
                                <option value="net_banking">Net Banking</option>
                                <option value="card">Card</option>
                            </select>
                        </div>
                    )}

                    <div className="btn-submit-wrap">
                        <button type="submit">Save Transaction</button>
                    </div>

                </form>
            </div>

            {/* ── Filters ── */}
            <div className="filters">
                <input
                    type="text"
                    placeholder="Search username..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <select value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="all">All Status</option>
                    <option value={PAYMENT_STATUS.PENDING}>Pending</option>
                    <option value={PAYMENT_STATUS.SUCCESS}>Success</option>
                    <option value={PAYMENT_STATUS.FAILED}>Failed</option>
                </select>
                <select value={type} onChange={(e) => setType(e.target.value)}>
                    <option value="all">All Types</option>
                    <option value="credit">Credit</option>
                    <option value="debit">Debit</option>
                </select>
            </div>

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

            {/* ── Table ── */}
            <div className="transaction-table-card">
                <table className="transaction-table">
                    <thead>
                        <tr>
                            <th className="sortable" onClick={() => handleSort("id")}>ID</th>
                            <th>User</th>
                            <th>Transaction ID</th>
                            <th>Type</th>
                            <th className="sortable" onClick={() => handleSort("amount")}>Amount</th>
                            <th>Status</th>
                            <th>Method</th>
                            <th>Payment Type</th>
                            <th className="sortable" onClick={() => handleSort("created")}>Created</th>
                            <th>Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {transactions.length === 0 ? (
                            <tr>
                                <td colSpan="10" className="table-msg">
                                    No transactions found
                                </td>
                            </tr>
                        ) : (
                            transactions.map((transaction, i) => (
                                <tr key={i}>

                                    <td>{transaction.id}</td>

                                    <td>{transaction.username}</td>

                                    <td>{transaction.transaction_id}</td>

                                    <td>
                                        <span className={`method-badge ${transaction.transaction_type === "debit" ? "type-debit" : "type-credit"}`}>
                                            {transaction.transaction_type}
                                        </span>
                                    </td>

                                    <td>₹{transaction.transaction_amount}</td>

                                    <td>
                                        <select
                                            className={`status-dropdown ${getStatusClass(transaction.payment_status)}`}
                                            value={transaction.payment_status}
                                            onChange={(e) =>
                                                updateStatus(
                                                    transaction.transaction_id,
                                                    Number(e.target.value)
                                                )
                                            }
                                        >
                                            <option value={PAYMENT_STATUS.PENDING}>Pending</option>
                                            <option value={PAYMENT_STATUS.SUCCESS}>Success</option>
                                            <option value={PAYMENT_STATUS.FAILED}>Failed</option>
                                        </select>
                                    </td>

                                    {/* Method — always wallet */}
                                    <td>
                                        <span className="method-badge type-wallet">
                                            wallet
                                        </span>
                                    </td>

                                    {/* Payment Type — cash/upi/card/net_banking for credit; — for debit */}
                                    <td>
                                        {transaction.payment_type ? (
                                            <span className={`method-badge ${getPaymentTypeClass(transaction.payment_type)}`}>
                                                {transaction.payment_type.replace("_", " ")}
                                            </span>
                                        ) : (
                                            <span className="method-badge type-other">—</span>
                                        )}
                                    </td>

                                    <td>
                                        {new Date(transaction.created_at).toLocaleDateString()}
                                    </td>

                                    <td>
                                        <button
                                            className="delete-btn"
                                            onClick={() => deleteTransaction(transaction.transaction_id)}
                                        >
                                            Delete
                                        </button>
                                    </td>

                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                {totalPages > 1 && (
                    <div className="pagination">
                        <button
                            className="page-btn"
                            disabled={page === 1}
                            onClick={() => fetchTransactions(page - 1)}
                        >
                            Prev
                        </button>
                        <button
    className="scan-another-btn"
    onClick={() => navigate("/qr")}
>
    Scan Another
</button>
                        <button
                            className="page-btn"
                            disabled={page === totalPages}
                            onClick={() => fetchTransactions(page + 1)}
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>

        </div>
    );
};

export default Transaction;