import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  let user = null;

  try {
    const storedUser =
      localStorage.getItem("user");

    if (storedUser) {
      user = JSON.parse(storedUser);
    }
  } catch (error) {
    console.error(
      "❌ Failed to parse user data:",
      error
    );

    localStorage.removeItem("user");
  }

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login", {
      replace: true,
    });
  };

  return (
    <div className="navbar bg-base-200">
      <div className="flex-1">
        <Link
          to="/"
          className="btn btn-ghost text-xl"
        >
          Ticket AI
        </Link>
      </div>

      <div className="flex gap-2 items-center">
        {!token ? (
          <>
            <Link
              to="/signup"
              className="btn btn-sm"
            >
              Signup
            </Link>

            <Link
              to="/login"
              className="btn btn-sm"
            >
              Login
            </Link>
          </>
        ) : (
          <>
            {user?.email && (
              <p>
                Hi, {user.email}
              </p>
            )}

            {user?.role === "admin" && (
              <Link
                to="/admin"
                className="btn btn-sm"
              >
                Admin
              </Link>
            )}

            <button
              onClick={logout}
              className="btn btn-sm"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </div>
  );
}