import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import toast from "react-hot-toast";
import { useAuth } from "../../contexts/AuthContext";

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: "", username: "", email: "" });
  const [avatarPreview, setAvatarPreview] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "" });
  const [pwLoading, setPwLoading] = useState(false);
  const fileInputRef = useRef();
  const { user, fetchUser, setUser } = useAuth();

  useEffect(() => {
    if (user) {
      setForm({ name: user.name, username: user.username || "", email: user.email });
      setAvatarPreview(user.avatar);
      setLoading(false);
    }
  }, [user]);

  const handleEdit = () => setEditMode(true);
  const handleCancel = () => {
    setEditMode(false);
    setForm({ name: user.name, username: user.username || "", email: user.email });
    setAvatarPreview(user.avatar);
    setAvatarFile(null);
  };

  const handleInputChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("username", form.username);
    if (avatarFile) formData.append("avatar", avatarFile);
    if (form.email) formData.append("email", form.email);
    try {
      const res = await axios.put("/api/auth/me", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      // Add cache-busting param to avatar URL
      const updatedUser = { ...res.data.user };
      if (updatedUser.avatar) {
        updatedUser.avatar = updatedUser.avatar + '?t=' + Date.now();
      }
      setUser(updatedUser);
      setEditMode(false);
      setAvatarFile(null);
      fetchUser();
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwLoading(true);
    try {
      await axios.put("/api/auth/change-password", pwForm);
      toast.success("Password updated");
      setPwForm({ currentPassword: "", newPassword: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update password");
    } finally {
      setPwLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50">
      <div className="max-w-xl mx-auto p-6 space-y-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">My Profile</h1>
        <div className="card bg-white/80 backdrop-blur-lg border border-blue-100 shadow rounded-3xl p-8 flex flex-col items-center gap-6">
          <div className="relative">
            <img
              src={avatarPreview || "/default-avatar.png"}
              alt="Avatar"
              className="w-32 h-32 rounded-full object-cover border-4 border-blue-500 shadow-lg"
            />
            {editMode && (
              <button
                className="absolute bottom-2 right-2 bg-blue-600 text-white rounded-full p-2 text-xs shadow hover:scale-105 transition-all duration-200"
                onClick={() => fileInputRef.current.click()}
                type="button"
              >
                Change
              </button>
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleAvatarChange}
            />
          </div>
          <form className="w-full space-y-4" onSubmit={handleProfileSave}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleInputChange}
                className="input-field"
                disabled={!editMode}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleInputChange}
                className="input-field"
                disabled={!editMode}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleInputChange}
                className="input-field"
                disabled={!editMode}
                required
              />
            </div>
            <div className="flex gap-2 justify-end">
              {editMode ? (
                <>
                  <button type="button" className="btn-secondary shadow hover:scale-105 transition-all duration-200" onClick={handleCancel}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary shadow hover:scale-105 transition-all duration-200">
                    Save
                  </button>
                </>
              ) : (
                <button type="button" className="btn-primary shadow hover:scale-105 transition-all duration-200" onClick={handleEdit}>
                  Edit Profile
                </button>
              )}
            </div>
          </form>
        </div>
        <div className="card bg-white/80 backdrop-blur-lg border border-blue-100 shadow rounded-3xl p-8">
          <h2 className="text-lg font-semibold mb-2">Change Password</h2>
          <form className="space-y-4" onSubmit={handlePasswordChange}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
              <input
                type="password"
                name="currentPassword"
                value={pwForm.currentPassword}
                onChange={e => setPwForm(f => ({ ...f, currentPassword: e.target.value }))}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input
                type="password"
                name="newPassword"
                value={pwForm.newPassword}
                onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))}
                className="input-field"
                required
                minLength={6}
              />
            </div>
            <div className="flex justify-end">
              <button type="submit" className="btn-primary shadow hover:scale-105 transition-all duration-200" disabled={pwLoading}>
                {pwLoading ? "Updating..." : "Change Password"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile; 