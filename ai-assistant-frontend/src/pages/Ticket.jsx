import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";

export default function TicketDetailsPage() {
  const { id } = useParams();

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(
          `${import.meta.env.VITE_SERVER_URL}/tickets/${id}`,
          {
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
              "Failed to fetch ticket"
          );
        }

        setTicket(data);
      } catch (err) {
        console.error("Failed to fetch ticket:", err);
        setError(
          err.message || "Something went wrong"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [id, token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center px-4">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>

          <p className="mt-4 text-base-content/60">
            Loading ticket details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center px-4">
        <div className="card bg-base-100 shadow-xl border border-base-300 max-w-md w-full">
          <div className="card-body items-center text-center">

            <div className="w-16 h-16 rounded-full bg-error/10 text-error flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-8 h-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v4m0 4h.01M10.29 3.86l-7.82 13.5A2 2 0 004.2 20.4h15.6a2 2 0 001.73-3.04l-7.82-13.5a2 2 0 00-3.42 0z"
                />
              </svg>
            </div>

            <h2 className="text-xl font-bold mt-4">
              Ticket Not Found
            </h2>

            <p className="text-sm text-base-content/60">
              {error || "The requested ticket could not be found."}
            </p>

            <Link
              to="/"
              className="btn btn-primary mt-4"
            >
              Back to Tickets
            </Link>

          </div>
        </div>
      </div>
    );
  }

  const getPriorityBadge = () => {
    if (!ticket.priority) {
      return (
        <span className="badge badge-ghost gap-2">
          <span className="loading loading-spinner loading-xs"></span>
          AI analyzing
        </span>
      );
    }

    if (ticket.priority === "high") {
      return (
        <span className="badge badge-error">
          High Priority
        </span>
      );
    }

    if (ticket.priority === "medium") {
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

  const getStatusBadge = () => {
    if (ticket.status === "IN_PROGRESS") {
      return (
        <span className="badge badge-info">
          In Progress
        </span>
      );
    }

    if (ticket.status === "RESOLVED") {
      return (
        <span className="badge badge-success">
          Resolved
        </span>
      );
    }

    if (ticket.status === "CLOSED") {
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
          <Link
            to="/"
            className="btn btn-ghost btn-sm gap-2"
          >
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
                d="M15 19l-7-7 7-7"
              />
            </svg>

            Back to Tickets
          </Link>
        </div>

        <div className="font-bold">
          AI Ticket System
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 py-8">

        <div className="mb-6">
          <p className="text-sm text-base-content/50 mb-2">
            Ticket Details
          </p>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

            <div>
              <h1 className="text-3xl font-bold">
                {ticket.title}
              </h1>

              <p className="text-sm text-base-content/50 mt-2">
                Ticket ID: {ticket._id}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {getStatusBadge()}
              {getPriorityBadge()}
            </div>

          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <div className="lg:col-span-2 space-y-6">

            <div className="card bg-base-100 shadow-xl border border-base-300">
              <div className="card-body">

                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
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
                        d="M8 10h8M8 14h5m7-2a8 8 0 11-16 0 8 8 0 0116 0z"
                      />
                    </svg>
                  </div>

                  <div>
                    <h2 className="font-bold">
                      Issue Description
                    </h2>

                    <p className="text-xs text-base-content/50">
                      Problem reported by the user
                    </p>
                  </div>
                </div>

                <div className="bg-base-200 rounded-xl p-5">
                  <p className="leading-7 whitespace-pre-wrap">
                    {ticket.description}
                  </p>
                </div>

              </div>
            </div>

            <div className="card bg-base-100 shadow-xl border border-base-300">

              <div className="card-body">

                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
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
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>

                  <div>
                    <h2 className="font-bold">
                      AI Analysis
                    </h2>

                    <p className="text-xs text-base-content/50">
                      Automated ticket analysis
                    </p>
                  </div>
                </div>

                {!ticket.priority &&
                !ticket.helpfulNotes &&
                !ticket.relatedSkills?.length ? (
                  <div className="rounded-xl bg-base-200 p-6 text-center">

                    <span className="loading loading-spinner loading-md text-primary"></span>

                    <p className="font-medium mt-3">
                      AI is analyzing this ticket
                    </p>

                    <p className="text-sm text-base-content/50 mt-1">
                      Priority, skills and helpful notes will
                      appear here once processing is complete.
                    </p>

                  </div>
                ) : (
                  <div className="space-y-5">

                    {ticket.helpfulNotes && (
                      <div>
                        <h3 className="font-semibold mb-2">
                          Helpful Notes
                        </h3>

                        <div className="bg-base-200 rounded-xl p-5">
                          <div className="prose max-w-none">
                            <ReactMarkdown>
                              {ticket.helpfulNotes}
                            </ReactMarkdown>
                          </div>
                        </div>
                      </div>
                    )}

                    {ticket.relatedSkills?.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-3">
                          Related Skills
                        </h3>

                        <div className="flex flex-wrap gap-2">
                          {ticket.relatedSkills.map(
                            (skill, index) => (
                              <span
                                key={`${skill}-${index}`}
                                className="badge badge-primary badge-outline"
                              >
                                {skill}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    )}

                  </div>
                )}

              </div>

            </div>

          </div>

          <div className="space-y-6">

            <div className="card bg-base-100 shadow-xl border border-base-300">
              <div className="card-body">

                <h2 className="font-bold text-lg mb-4">
                  Ticket Information
                </h2>

                <div className="space-y-4">

                  <div>
                    <p className="text-xs text-base-content/50">
                      Status
                    </p>

                    <div className="mt-1">
                      {getStatusBadge()}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-base-content/50">
                      Priority
                    </p>

                    <div className="mt-1">
                      {getPriorityBadge()}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-base-content/50">
                      Assigned To
                    </p>

                    <p className="font-medium mt-1">
                      {ticket.assignedTo?.email ||
                        "Not assigned yet"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-base-content/50">
                      Created At
                    </p>

                    <p className="text-sm font-medium mt-1">
                      {ticket.createdAt
                        ? new Date(
                            ticket.createdAt
                          ).toLocaleString()
                        : "Not available"}
                    </p>
                  </div>

                </div>

              </div>
            </div>

            <div className="card bg-primary text-primary-content shadow-xl">
              <div className="card-body">

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-content/10 flex items-center justify-center">
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
                        d="M9.5 14.5L4 20m5.5-5.5L20 4m-4 0h4v4"
                      />
                    </svg>
                  </div>

                  <h3 className="font-bold">
                    AI-Powered Support
                  </h3>
                </div>

                <p className="text-sm opacity-80 mt-2">
                  This ticket is automatically analyzed by AI
                  to determine priority, required skills and
                  helpful troubleshooting information.
                </p>

              </div>
            </div>

          </div>

        </div>

      </main>
    </div>
  );
}