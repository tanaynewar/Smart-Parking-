import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { AppContext } from "../context/AppContext";

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { isLoggedin, userData, isLoading } = useContext(AppContext);

    if (isLoading) {
    return <div>Loading user authentication...</div>; // Replace with a spinner if you have one
  }
    if (!isLoggedin) {
        return <Navigate to="/login" />;
    }

    if (!userData) {
        return <div>Fetching user data...</div>
    }

    if (!allowedRoles.includes(userData.role)) {
        return <Navigate to="/" />;
    }

   
    return children;
};

export default ProtectedRoute;