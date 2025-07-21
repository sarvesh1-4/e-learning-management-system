import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const CreateAssignment = () => {
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState({ course: "", title: "", description: "", dueDate: "" });
  const [attachment, setAttachment] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axios.get("/api/courses/admin/all");
        setCourses(res.data);
      } catch (err) {
        toast.error("Failed to load courses");
      }
    };
    fetchCourses();
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e) => {
    setAttachment(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.course || !form.title || !form.description || !form.dueDate) {
      toast.error("All fields are required");
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append("course", form.course);
    formData.append("title", form.title);
    formData.append("description", form.description);
    formData.append("dueDate", form.dueDate);
    if (attachment) formData.append("attachment", attachment);
    try {
      await axios.post("/api/assignments", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Assignment created");
      setForm({ course: "", title: "", description: "", dueDate: "" });
      setAttachment(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create assignment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 space-y-8 bg-gradient-to-br from-blue-50 via-white to-purple-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Create Assignment</h1>
      <form className="space-y-8 card bg-white/80 backdrop-blur-lg border border-blue-100 shadow rounded-3xl p-8" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Course</label>
          <select
            name="course"
            value={form.course}
            onChange={handleChange}
            className="input-field"
            required
          >
            <option value="">Select a course</option>
            {courses.map((c) => (
              <option key={c._id} value={c._id}>{c.title}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Title</label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            className="input-field text-gray-900 dark:text-gray-100"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="input-field text-gray-900 dark:text-gray-100"
            rows={4}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Due Date</label>
          <input
            type="date"
            name="dueDate"
            value={form.dueDate}
            onChange={handleChange}
            className="input-field text-gray-900 dark:text-gray-100"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Attachment (optional)</label>
          <input type="file" onChange={handleFileChange} />
        </div>
        <div className="flex justify-end">
          <button type="submit" className="btn-primary shadow hover:scale-105 transition-all duration-200" disabled={loading}>
            {loading ? "Creating..." : "Create Assignment"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateAssignment; 