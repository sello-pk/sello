import { Navigate } from "react-router-dom";
import { useGetMeQuery } from "../../redux/services/api";

const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem("token");
    const { data: user, isLoading, isError } = useGetMeQuery(undefined, {
        skip: !token,
    });

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // Show nothing while loading - let the page render normally
    if (isLoading) {
        return null;
    }

    if (isError || !user) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;

