import React, { useEffect, useState } from "react";
import axios from "axios";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await axios.get("/api/users");
        setUsers(res.data);
      } catch (err) {
        setError("Failed to load users.");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-600 text-center py-8">{error}</div>;
  }

  return (
    <div className="space-y-8 bg-gradient-to-br from-blue-50 via-white to-purple-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">All Users</h1>
      <div className="card bg-white/80 backdrop-blur-lg border border-blue-100 shadow rounded-3xl p-8 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 text-left text-gray-900">Name</th>
              <th className="py-2 px-4 text-left text-gray-900">Email</th>
              <th className="py-2 px-4 text-left text-gray-900">Role</th>
              <th className="py-2 px-4 text-left text-gray-900">Registered At</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, idx) => (
              <tr key={user._id || idx} className="border-b">
                <td className="py-2 px-4 text-gray-700">{user.name}</td>
                <td className="py-2 px-4 text-gray-700">{user.email}</td>
                <td className="py-2 px-4 capitalize text-gray-700">{user.role}</td>
                <td className="py-2 px-4 text-gray-700">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <div className="text-center text-gray-500 py-8">No users found.</div>
        )}
      </div>
    </div>
  );
};

export default UserManagement; 