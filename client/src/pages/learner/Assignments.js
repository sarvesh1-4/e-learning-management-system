import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";

const Assignments = () => {
  const { id: courseId } = useParams();
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState({});
  const [uploading, setUploading] = useState({});

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const res = await axios.get(`/api/assignments/course/${courseId}`);
        setAssignments(res.data);
        // Fetch submissions for each assignment
        const subs = {};
        await Promise.all(
          res.data.map(async (a) => {
            const subRes = await axios.get(`/api/assignments/${a._id}/submissions`);
            subs[a._id] = subRes.data;
          })
        );
        setSubmissions(subs);
      } catch (err) {
        toast.error("Failed to load assignments");
      }
    };
    fetchAssignments();
  }, [courseId]);

  const handleFileChange = async (assignmentId, e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading((prev) => ({ ...prev, [assignmentId]: true }));
    const formData = new FormData();
    formData.append("file", file);
    try {
      await axios.post(`/api/assignments/${assignmentId}/submit`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Assignment submitted");
      // Refresh submission
      const subRes = await axios.get(`/api/assignments/${assignmentId}/submissions`);
      setSubmissions((prev) => ({ ...prev, [assignmentId]: subRes.data }));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit assignment");
    } finally {
      setUploading((prev) => ({ ...prev, [assignmentId]: false }));
    }
  };

  const BACKEND_URL = "http://localhost:5000";

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8 bg-gradient-to-br from-blue-50 via-white to-purple-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Assignments</h1>
      {assignments.length === 0 ? (
        <div className="text-gray-500">No assignments for this course.</div>
      ) : (
        <ul className="space-y-6">
          {assignments.map((a) => (
            <li key={a._id} className="card bg-white/80 backdrop-blur-lg border border-blue-100 shadow rounded-3xl p-8 hover:scale-105 hover:shadow-lg transition-all duration-200">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h2 className="text-lg font-semibold">{a.title}</h2>
                  <div className="text-sm text-gray-600">Due: {new Date(a.dueDate).toLocaleDateString()}</div>
                </div>
                {a.attachment && (
                  <a href={a.attachment} target="_blank" rel="noopener noreferrer" className="btn-secondary text-xs shadow hover:scale-105 transition-all duration-200">
                    Download Attachment
                  </a>
                )}
              </div>
              <div className="mb-2 text-gray-700">{a.description}</div>
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  onChange={(e) => handleFileChange(a._id, e)}
                  disabled={uploading[a._id]}
                  className="text-xs"
                />
                {submissions[a._id] ? (
                  <span className="text-green-600 text-xs font-semibold">Submitted: {new Date(submissions[a._id].submittedAt).toLocaleString()}</span>
                ) : (
                  <span className="text-gray-500 text-xs font-semibold">Not submitted</span>
                )}
              </div>
              {submissions[a._id]?.file && (
                <div className="mt-2">
                  <a href={BACKEND_URL + submissions[a._id].file} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-xs shadow hover:scale-105 transition-all duration-200">
                    View Your Submission
                  </a>
                  {submissions[a._id].grade && (
                    <div className="text-green-700 text-xs mt-1 font-semibold">Grade: {submissions[a._id].grade}</div>
                  )}
                  {submissions[a._id].feedback && (
                    <div className="text-blue-700 text-xs mt-1 font-semibold">Feedback: {submissions[a._id].feedback}</div>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Assignments; 