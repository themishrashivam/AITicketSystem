import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function CheckAuth({
  children,
  protectedRoute,
}) {
  const navigate = useNavigate();

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const token =
      localStorage.getItem("token");

    // Protected routes
    if (protectedRoute) {
      if (!token) {
        navigate("/login", {
          replace: true,
        });

        return;
      }

      setLoading(false);

      return;
    }

    // Public routes
    if (token) {
      navigate("/", {
        replace: true,
      });

      return;
    }

    setLoading(false);
  }, [
    navigate,
    protectedRoute,
  ]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>

          <p className="mt-4 text-base-content/60">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  return children;
}

export default CheckAuth;