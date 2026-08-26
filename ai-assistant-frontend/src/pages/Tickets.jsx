import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Tickets() {
  const [form, setForm] = useState({
    title: "",
    description: "",
  });

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const fetchTickets = async () => {
    try {
      setFetching(true);
      setError("");

      const res = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/tickets`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error ||
            data.message ||
            "Failed to fetch tickets"
        );
      }

      setTickets(data.tickets || []);
    } catch (err) {
      console.error("Failed to fetch tickets:", err);
      setError(err.message || "Failed to load tickets");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim() || !form.description.trim()) {
      setError("Please enter both title and description.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/tickets`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: form.title.trim(),
            description: form.description.trim(),
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error ||
            data.message ||
            "Ticket creation failed"
        );
      }

      setForm({
        title: "",
        description: "",
      });

      await fetchTickets();
    } catch (err) {
      console.error("Error creating ticket:", err);
      setError(
        err.message ||
          "Unable to create ticket. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const getPriorityBadge = (priority) => {
    if (!priority) {
      return (
        <span className="badge badge-ghost gap-1">
          <span className="loading loading-spinner loading-xs"></span>
          AI analyzing
        </span>
      );
    }

    if (priority === "high") {
      return (
        <span className="badge badge-error">
          High Priority
        </span>
      );
    }

    if (priority === "medium") {
      return (
        <span className="badge badge-warning">
          Medium Priority
        </span>
      );
    }

    return (
      <span className="badge badge-success">
        Low Priority
      </span>
    );
  };

  const getStatusBadge = (status) => {
    if (status === "IN_PROGRESS") {
      return (
        <span className="badge badge-info">
          In Progress
        </span>
      );
    }

    if (status === "RESOLVED") {
      return (
        <span className="badge badge-success">
          Resolved
        </span>
      );
    }

    if (status === "CLOSED") {
      return (
        <span className="badge badge-neutral">
          Closed
        </span>
      );
    }

    return (
      <span className="badge badge-ghost">
        To Do
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-base-200">

      <div className="navbar bg-base-100 border-b border-base-300 px-4 lg:px-8">
        <div className="flex-1">
          <div>
            <h1 className="text-xl font-bold">
              AI Ticket System
            </h1>
            <p className="text-xs text-base-content/50">
              Smart support management
            </p>
          </div>
        </div>

        <div className="flex-none">
          <button
            onClick={fetchTickets}
            className="btn btn-ghost btn-sm"
            disabled={fetching}
          >
            {fetching ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 4v5h5M20 20v-5h-5M5.1 9A7.9 7.9 0 0119 6.1L20 4M19 15a7.9 7.9 0 01-13.9 2.9L4 20"
                />
              </svg>
            )}
            Refresh
          </button>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-8">

        <div className="mb-8">
          <h2 className="text-3xl font-bold">
            Support Tickets
          </h2>

          <p className="text-base-content/60 mt-1">
            Create a ticket and let AI analyze and prioritize it.
          </p>
        </div>

        {error && (
          <div className="alert alert-error mb-6">
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

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          <div className="lg:col-span-2">
            <div className="card bg-base-100 shadow-xl border border-base-300">
              <div className="card-body">

                <div className="flex items-start gap-3 mb-2">
                  <div className="w-11 h-11 rounded-xl bg-primary text-primary-content flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-6 h-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  </div>

                  <div>
                    <h3 className="card-title">
                      Create a Ticket
                    </h3>

                    <p className="text-sm text-base-content/60">
                      Describe your issue and AI will analyze it.
                    </p>
                  </div>
                </div>

                <form
                  onSubmit={handleSubmit}
                  className="space-y-4 mt-4"
                >
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">
                        Ticket Title
                      </span>
                    </label>

                    <input
                      name="title"
                      value={form.title}
                      onChange={handleChange}
                      placeholder="e.g. Login page is not working"
                      className="input input-bordered w-full"
                      required
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">
                        Description
                      </span>
                    </label>

                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      placeholder="Explain your problem in detail..."
                      className="textarea textarea-bordered w-full h-32"
                      required
                    ></textarea>
                  </div>

                  <button
                    className="btn btn-primary w-full"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="loading loading-spinner loading-sm"></span>
                        Creating Ticket...
                      </>
                    ) : (
                      <>
                        Submit Ticket
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-5 p-4 rounded-xl bg-base-200">
                  <div className="flex gap-3">
                    <div className="text-primary">
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
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                    </div>

                    <div>
                      <p className="font-medium text-sm">
                        AI-powered analysis
                      </p>

                      <p className="text-xs text-base-content/60 mt-1">
                        AI automatically analyzes priority,
                        skills, and helpful notes.
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

          <div className="lg:col-span-3">

            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold">
                  All Tickets
                </h3>

                <p className="text-sm text-base-content/50">
                  {tickets.length}{" "}
                  {tickets.length === 1 ? "ticket" : "tickets"}
                </p>
              </div>
            </div>

            {fetching ? (
              <div className="space-y-4">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="card bg-base-100 shadow border border-base-300"
                  >
                    <div className="card-body">
                      <div className="skeleton h-5 w-3/4"></div>
                      <div className="skeleton h-4 w-full"></div>
                      <div className="skeleton h-4 w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : tickets.length === 0 ? (
              <div className="card bg-base-100 border border-dashed border-base-300">
                <div className="card-body items-center text-center py-12">

                  <div className="w-16 h-16 rounded-full bg-base-200 flex items-center justify-center mb-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-8 h-8 text-base-content/40"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h6l5 5v11a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>

                  <h3 className="font-bold text-lg">
                    No tickets yet
                  </h3>

                  <p className="text-sm text-base-content/50">
                    Create your first support ticket to get started.
                  </p>

                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {tickets.map((ticket) => (
                  <Link
                    key={ticket._id}
                    to={`/tickets/${ticket._id}`}
                    className="card bg-base-100 shadow-md border border-base-300 hover:shadow-xl hover:border-primary/30 transition-all duration-200"
                  >
                    <div className="card-body p-5">

                      <div className="flex items-start justify-between gap-4">

                        <div className="min-w-0">
                          <h3 className="font-bold text-lg truncate">
                            {ticket.title}
                          </h3>

                          <p className="text-sm text-base-content/60 mt-1 line-clamp-2">
                            {ticket.description}
                          </p>
                        </div>

                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-5 h-5 text-base-content/40 shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 5l7 7-7 7"
                          />
                        </svg>

                      </div>

                      <div className="flex flex-wrap gap-2 mt-4">
                        {getStatusBadge(ticket.status)}
                        {getPriorityBadge(ticket.priority)}
                      </div>

                      {ticket.relatedSkills?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {ticket.relatedSkills.map(
                            (skill, index) => (
                              <span
                                key={index}
                                className="badge badge-outline text-xs"
                              >
                                {skill}
                              </span>
                            )
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-base-300">
                        <span className="text-xs text-base-content/50">
                          {ticket.createdAt
                            ? `Created ${new Date(
                                ticket.createdAt
                              ).toLocaleString()}`
                            : "Date unavailable"}
                        </span>

                        {ticket.priority && (
                          <span className="text-xs text-primary font-medium">
                            AI analyzed
                          </span>
                        )}
                      </div>

                    </div>
                  </Link>
                ))}
              </div>
            )}

          </div>

        </div>
      </main>
    </div>
  );
}