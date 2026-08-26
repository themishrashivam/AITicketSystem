import { useEffect, useState } from "react";

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);

  const [formData, setFormData] = useState({
    role: "",
    skills: "",
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const token = localStorage.getItem("token");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/auth/users`,
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
            "Failed to fetch users"
        );
      }

      setUsers(data);
      setFilteredUsers(data);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEditClick = (user) => {
    setEditingUser(user.email);

    setFormData({
      role: user.role || "user",
      skills: user.skills?.join(", ") || "",
    });

    setError("");
    setSuccess("");
  };

  const handleUpdate = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const skills = formData.skills
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean);

      const res = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/auth/update-user`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            email: editingUser,
            role: formData.role,
            skills,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error ||
            data.message ||
            "Failed to update user"
        );
      }

      setSuccess("User updated successfully.");

      setEditingUser(null);

      setFormData({
        role: "",
        skills: "",
      });

      await fetchUsers();
    } catch (err) {
      console.error("Update failed:", err);
      setError(err.message || "Failed to update user");
    } finally {
      setSaving(false);
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();

    setSearchQuery(query);

    const filtered = users.filter((user) =>
      user.email.toLowerCase().includes(query)
    );

    setFilteredUsers(filtered);
  };

  const getRoleBadge = (role) => {
    if (role === "admin") {
      return (
        <span className="badge badge-error gap-1">
          Admin
        </span>
      );
    }

    if (role === "moderator") {
      return (
        <span className="badge badge-warning gap-1">
          Moderator
        </span>
      );
    }

    return (
      <span className="badge badge-ghost">
        User
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-base-200">

      {/* Navbar */}
      <div className="navbar bg-base-100 border-b border-base-300 px-4 lg:px-8">
        <div className="flex-1">
          <div>
            <h1 className="text-xl font-bold">
              AI Ticket System
            </h1>

            <p className="text-xs text-base-content/50">
              Administration Dashboard
            </p>
          </div>
        </div>

        <div className="flex-none">
          <button
            onClick={fetchUsers}
            className="btn btn-ghost btn-sm"
            disabled={loading}
          >
            {loading ? (
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

      <main className="max-w-7xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">

            <div className="w-12 h-12 rounded-xl bg-primary text-primary-content flex items-center justify-center">
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
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>

            <div>
              <h2 className="text-3xl font-bold">
                Admin Dashboard
              </h2>

              <p className="text-base-content/60 mt-1">
                Manage users, roles and technical skills
              </p>
            </div>

          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">

          <div className="card bg-base-100 shadow border border-base-300">
            <div className="card-body p-5">
              <p className="text-sm text-base-content/50">
                Total Users
              </p>

              <p className="text-3xl font-bold mt-1">
                {users.length}
              </p>
            </div>
          </div>

          <div className="card bg-base-100 shadow border border-base-300">
            <div className="card-body p-5">
              <p className="text-sm text-base-content/50">
                Moderators
              </p>

              <p className="text-3xl font-bold text-warning mt-1">
                {
                  users.filter(
                    (user) => user.role === "moderator"
                  ).length
                }
              </p>
            </div>
          </div>

          <div className="card bg-base-100 shadow border border-base-300">
            <div className="card-body p-5">
              <p className="text-sm text-base-content/50">
                Admins
              </p>

              <p className="text-3xl font-bold text-error mt-1">
                {
                  users.filter(
                    (user) => user.role === "admin"
                  ).length
                }
              </p>
            </div>
          </div>

        </div>

        {/* Alerts */}
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

        {success && (
          <div className="alert alert-success mb-6">
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
                d="M5 13l4 4L19 7"
              />
            </svg>

            <span>{success}</span>
          </div>
        )}

        {/* User Management */}
        <div className="card bg-base-100 shadow-xl border border-base-300">

          <div className="card-body">

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">

              <div>
                <h3 className="text-xl font-bold">
                  User Management
                </h3>

                <p className="text-sm text-base-content/50 mt-1">
                  Assign roles and skills to users
                </p>
              </div>

              <div className="form-control w-full md:w-80">
                <div className="input-group">

                  <input
                    type="text"
                    className="input input-bordered w-full"
                    placeholder="Search by email..."
                    value={searchQuery}
                    onChange={handleSearch}
                  />

                </div>
              </div>

            </div>

            {/* Loading */}
            {loading ? (
              <div className="space-y-4">

                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="border border-base-300 rounded-xl p-5"
                  >
                    <div className="skeleton h-5 w-1/2"></div>
                    <div className="skeleton h-4 w-1/3 mt-3"></div>
                    <div className="skeleton h-4 w-2/3 mt-3"></div>
                  </div>
                ))}

              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-12">

                <div className="w-16 h-16 rounded-full bg-base-200 mx-auto flex items-center justify-center">
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
                      d="M16 11a4 4 0 10-8 0 4 4 0 008 0zM4 20a8 8 0 0116 0"
                    />
                  </svg>
                </div>

                <h3 className="font-bold text-lg mt-4">
                  No users found
                </h3>

                <p className="text-sm text-base-content/50">
                  Try changing your search query.
                </p>

              </div>
            ) : (
              <div className="space-y-4">

                {filteredUsers.map((user) => (

                  <div
                    key={user._id}
                    className="border border-base-300 rounded-xl p-5 hover:shadow-md transition-shadow"
                  >

                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

                      <div className="flex items-start gap-4">

                        <div className="w-11 h-11 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                          {user.email
                            ?.charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>

                          <p className="font-semibold">
                            {user.email}
                          </p>

                          <div className="flex flex-wrap gap-2 mt-2">
                            {getRoleBadge(user.role)}
                          </div>

                        </div>

                      </div>

                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() =>
                          handleEditClick(user)
                        }
                      >
                        Edit User
                      </button>

                    </div>

                    <div className="divider my-3"></div>

                    <div>

                      <p className="text-xs font-medium text-base-content/50 uppercase tracking-wide">
                        Skills
                      </p>

                      {user.skills &&
                      user.skills.length > 0 ? (
                        <div className="flex flex-wrap gap-2 mt-2">

                          {user.skills.map(
                            (skill, index) => (
                              <span
                                key={`${skill}-${index}`}
                                className="badge badge-outline"
                              >
                                {skill}
                              </span>
                            )
                          )}

                        </div>
                      ) : (
                        <p className="text-sm text-base-content/40 mt-2">
                          No skills assigned
                        </p>
                      )}

                    </div>

                    {/* Edit Section */}
                    {editingUser === user.email && (
                      <div className="mt-5 p-5 rounded-xl bg-base-200">

                        <h4 className="font-bold mb-4">
                          Edit User
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                          <div className="form-control">
                            <label className="label">
                              <span className="label-text font-medium">
                                Role
                              </span>
                            </label>

                            <select
                              className="select select-bordered w-full"
                              value={formData.role}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  role: e.target.value,
                                })
                              }
                            >
                              <option value="user">
                                User
                              </option>

                              <option value="moderator">
                                Moderator
                              </option>

                              <option value="admin">
                                Admin
                              </option>
                            </select>
                          </div>

                          <div className="form-control">
                            <label className="label">
                              <span className="label-text font-medium">
                                Skills
                              </span>
                            </label>

                            <input
                              type="text"
                              placeholder="React, Node.js, MongoDB"
                              className="input input-bordered w-full"
                              value={formData.skills}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  skills: e.target.value,
                                })
                              }
                            />
                          </div>

                        </div>

                        <p className="text-xs text-base-content/50 mt-2">
                          Separate multiple skills using commas.
                        </p>

                        <div className="flex gap-2 mt-5">

                          <button
                            className="btn btn-primary"
                            onClick={handleUpdate}
                            disabled={saving}
                          >
                            {saving ? (
                              <>
                                <span className="loading loading-spinner loading-sm"></span>
                                Saving...
                              </>
                            ) : (
                              "Save Changes"
                            )}
                          </button>

                          <button
                            className="btn btn-ghost"
                            onClick={() => {
                              setEditingUser(null);
                              setFormData({
                                role: "",
                                skills: "",
                              });
                            }}
                            disabled={saving}
                          >
                            Cancel
                          </button>

                        </div>

                      </div>
                    )}

                  </div>

                ))}

              </div>
            )}

          </div>

        </div>

      </main>
    </div>
  );
}