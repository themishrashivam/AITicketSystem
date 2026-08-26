import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function SignupPage() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

    setError("");
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/auth/signup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        navigate("/");
      } else {
        setError(
          data.error ||
          data.message ||
          "Unable to create your account"
        );
      }
    } catch (err) {
      console.error("Signup error:", err);
      setError(
        "Unable to connect to the server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary text-primary-content shadow-lg mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-7 h-7"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M18 9a6 6 0 10-12 0v2a2 2 0 01-2 2h16a2 2 0 01-2-2V9z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 17h8"
              />
            </svg>
          </div>

          <h1 className="text-3xl font-bold">
            AI Ticket System
          </h1>

          <p className="text-base-content/60 mt-2">
            Create an account to manage your support tickets
          </p>
        </div>

        <div className="card bg-base-100 shadow-2xl border border-base-300">
          <form onSubmit={handleSignup} className="card-body p-7">

            <div className="mb-2">
              <h2 className="text-2xl font-bold">
                Create your account
              </h2>

              <p className="text-sm text-base-content/60 mt-1">
                Get started with AI-powered ticket management
              </p>
            </div>

            {error && (
              <div className="alert alert-error mt-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>

                <span>{error}</span>
              </div>
            )}

            <div className="form-control mt-5">
              <label className="label">
                <span className="label-text font-medium">
                  Email address
                </span>
              </label>

              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                className="input input-bordered w-full"
                value={form.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </div>

            <div className="form-control mt-3">
              <label className="label">
                <span className="label-text font-medium">
                  Password
                </span>
              </label>

              <input
                type="password"
                name="password"
                placeholder="Create a password"
                className="input input-bordered w-full"
                value={form.password}
                onChange={handleChange}
                required
                minLength={6}
                autoComplete="new-password"
              />

              <label className="label">
                <span className="label-text-alt text-base-content/50">
                  Use at least 6 characters
                </span>
              </label>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full mt-4"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </button>

            <div className="divider text-xs text-base-content/40">
              OR
            </div>

            <p className="text-center text-sm text-base-content/60">
              Already have an account?{" "}
              <Link
                to="/login"
                className="link link-primary font-semibold"
              >
                Sign in
              </Link>
            </p>

          </form>
        </div>

        <div className="text-center mt-6">
          <p className="text-xs text-base-content/40">
            AI-powered support ticket management
          </p>
        </div>

      </div>
    </div>
  );
}