import { useState, useEffect, useContext } from "react";
import axios from "axios";
import "../css/adminpage.css";
import { AppContext } from "../context/AppContext";

const Admin = () => {
   const { backendUrl } = useContext(AppContext);
    const [users, setUsers] = useState([]);
    const [showModal, setShowModal] = useState(false);

const [selectedUserId, setSelectedUserId] = useState(null);

const [selectedAction, setSelectedAction] = useState("");

    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("all");
    const [role, setRole] = useState("all");

    const [sort, setSort] = useState("id-greatest");

    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);

    const [pagination, setPagination] = useState({
        totalUsers: 0,
        totalPages: 1,
        currentPage: 1,
        usersPerPage: 10
    });
    const openConfirmationModal = (id, action) => {
    setSelectedUserId(id);
    setSelectedAction(action);
    setShowModal(true);
};

    const fetchUsers = async (currentPage = 1) => {

        try {

            const { data } = await axios.get(`${backendUrl}/api/admin/users`, {
                params: {
                    search,
                    status,
                    role,
                    sort,
                    page: currentPage,
                    limit
                },
                withCredentials: true
            });

            if (data.success) {
                setUsers(data.data);
                setPagination(data.pagination);
                setPage(data.pagination.currentPage);
            }

        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        fetchUsers(1);
    }, [search, status, role, sort, limit]);

    const handleAction = async () => {

    try {

        await axios.put(
            `${backendUrl}/api/admin/${selectedAction}/${selectedUserId}`,
            {},
            {
                withCredentials: true
            }
        );

        setShowModal(false);

        fetchUsers(page);

    } catch (error) {
        console.log(error);
    }
};

    const handleSort = (field) => {

        if (field === "id") {

            if (sort === "id-greatest") {
                setSort("id-least");
            } else {
                setSort("id-greatest");
            }

        }

        if (field === "name") {

            if (sort === "az") {
                setSort("za");
            } else {
                setSort("az");
            }

        }

        if (field === "created") {
            console.log('check')
            if (sort === "created-newest") {
                setSort("created-oldest");
            } else {
                setSort("created-newest");
            }

        }

        setPage(1);
    };

    const from =
        pagination.totalUsers === 0
            ? 0
            : (page - 1) * limit + 1;

    const to =
        page * limit > pagination.totalUsers
            ? pagination.totalUsers
            : page * limit;

    return (
        <div className="admin-page">

            <h1>Users</h1>

          

            <div className="filters">

                <input
                    type="text"
                    placeholder="Search name, email, phone..."
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1);
                    }}
                />

                <select
                    value={status}
                    onChange={(e) => {
                        setStatus(e.target.value);
                        setPage(1);
                    }}
                >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                </select>

                <select
                    value={role}
                    onChange={(e) => {
                        setRole(e.target.value);
                        setPage(1);
                    }}
                >
                    <option value="all">All Roles</option>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                </select>

            </div>

            <div className="meta-row">

                <span>
                    {pagination.totalUsers === 0
                        ? "No users found"
                        : `Showing ${from} - ${to} of ${pagination.totalUsers} users`}
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

            <div className="table-wrap">

                <table>

                    <thead>

                        <tr>

                            <th
                                className="sortable"
                                onClick={() => handleSort("id")}
                            >
                                ID
                            </th>

                            <th
                                className="sortable"
                                onClick={() => handleSort("name")}
                            >
                                Name
                            </th>

                            <th>Email</th>

                            <th>Phone</th>

                            <th>Car No.</th>

                            <th>Role</th>

                            <th>Status</th>

                            <th
                                className="sortable"
                                onClick={() => handleSort("created")}
                            >
                                Created
                            </th>

                            <th>Actions</th>

                        </tr>

                    </thead>

                    <tbody>

                        {users.length === 0 ? (

                            <tr>
                                <td colSpan="9" className="table-msg">
                                    No users found
                                </td>
                            </tr>

                        ) : (

                            users.map((user) => (

                                <tr key={user.id}>

                                    <td>{user.id}</td>

                                    <td>{user.username}</td>

                                    <td>{user.email}</td>

                                    <td>{user.phoneNumber || "-"}</td>

                                    <td>{user.car_number || "-"}</td>

                                    <td>
                                        <span className={`badge ${user.role}`}>
                                            {user.role}
                                        </span>
                                    </td>

                                    <td>
                                        <span className={`badge ${user.status}`}>
                                            {user.status}
                                        </span>
                                    </td>

                                    <td>
                                        {user.createdAt
                                            ? new Date(user.createdAt).toLocaleDateString()
                                            : "-"}
                                    </td>

                                    <td>

                                        <div className="actions">

                                            <button
                                                className="btn btn-approve"
                                               onClick={() =>
    openConfirmationModal(user.id, "approve")

                                                }
                                                disabled={user.status === "approved"}
                                            >
                                                Approve
                                            </button>

                                            <button
                                                className="btn btn-reject"
                                                onClick={() =>
                                                     openConfirmationModal(user.id, "reject")
                                                }
                                                disabled={user.status === "rejected"}
                                            >
                                                Reject
                                            </button>

                                        </div>

                                    </td>

                                </tr>

                            ))
                        )}

                    </tbody>

                </table>

                {pagination.totalPages > 1 && (

                    <div className="pagination">

                        <button
                            className="page-btn"
                            disabled={page === 1}
                            onClick={() => fetchUsers(page - 1)}
                        >
                            Prev
                        </button>
                    

                        <button
                            className="page-btn"
                            disabled={page === pagination.totalPages}
                            onClick={() => fetchUsers(page + 1)}
                        >
                            Next
                        </button>

                    </div>

                )}

            </div>
{showModal && (
    <div className="modal-overlay">

        <div className="modal">

            <h2>Confirmation</h2>

            <p>
                Are you sure you want to {selectedAction} this user?
            </p>

            <div className="modal-buttons">

                <button
                    onClick={() => setShowModal(false)}
                >
                    Cancel
                </button>

                <button
                    onClick={handleAction}
                >
                    Confirm
                </button>

            </div>

        </div>

    </div>
)}
        </div>
    );
};

export default Admin;