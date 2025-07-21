import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const ReviewAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [selected, setSelected] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [previewId, setPreviewId] = useState(null);
  const [editState, setEditState] = useState({});
  const [saving, setSaving] = useState({});

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const res = await axios.get("/api/assignments"); // You may want to filter by course
        setAssignments(res.data);
      } catch (err) {
        toast.error("Failed to load assignments");
      }
    };
    fetchAssignments();
  }, []);

  const handleSelect = async (assignmentId) => {
    setSelected(assignmentId);
    setLoading(true);
    try {
      const res = await axios.get(`/api/assignments/${assignmentId}/all-submissions`);
      setSubmissions(res.data);
      // Initialize edit state
      const state = {};
      res.data.forEach(s => {
        state[s._id] = { grade: s.grade || "", feedback: s.feedback || "" };
      });
      setEditState(state);
    } catch (err) {
      toast.error("Failed to load submissions");
    } finally {
      setLoading(false);
    }
  };

  const handleEditChange = (id, field, value) => {
    setEditState(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  };

  const handleEditBlur = async (id) => {
    const { grade, feedback } = editState[id] || {};
    try {
      await axios.put(`/api/assignments/${selected}/submissions/${id}`, { grade, feedback });
      toast.success("Graded");
      // Refresh submissions
      const res = await axios.get(`/api/assignments/${selected}/all-submissions`);
      setSubmissions(res.data);
    } catch (err) {
      toast.error("Failed to grade");
    }
  };

  const handleSave = async (id) => {
    const { grade, feedback } = editState[id] || {};
    setSaving(prev => ({ ...prev, [id]: true }));
    try {
      await axios.put(`/api/assignments/${selected}/submissions/${id}`, { grade, feedback });
      toast.success("Graded");
      // Refresh submissions
      const res = await axios.get(`/api/assignments/${selected}/all-submissions`);
      setSubmissions(res.data);
    } catch (err) {
      toast.error("Failed to grade");
    } finally {
      setSaving(prev => ({ ...prev, [id]: false }));
    }
  };

  const BACKEND_URL = "http://localhost:5000";

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8 bg-gradient-to-br from-blue-50 via-white to-purple-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Review Assignments</h1>
      <div className="card bg-white/80 backdrop-blur-lg border border-blue-100 shadow rounded-3xl p-8 mb-6">
        <h2 className="text-lg font-semibold mb-2">Assignments</h2>
        <ul className="space-y-2">
          {assignments.map((a) => (
            <li key={a._id}>
              <button
                className={`btn-secondary ${selected === a._id ? "bg-blue-100" : ""}`}
                onClick={() => handleSelect(a._id)}
              >
                {a.title} ({new Date(a.dueDate).toLocaleDateString()})
              </button>
            </li>
          ))}
        </ul>
      </div>
      {selected && (
        <div className="card bg-white/80 backdrop-blur-lg border border-blue-100 shadow rounded-3xl p-8">
          <h2 className="text-lg font-semibold mb-2">Submissions</h2>
          {loading ? (
            <div>Loading...</div>
          ) : submissions.length === 0 ? (
            <div className="text-gray-500">No submissions yet.</div>
          ) : (
            <ul className="space-y-4">
              {submissions.map((s) => (
                <li key={s._id} className="border-b pb-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">{s.user?.name} ({s.user?.email})</div>
                      <div className="text-xs text-gray-500">Submitted: {new Date(s.submittedAt).toLocaleString()}</div>
                      <a
                        href={BACKEND_URL + s.file}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline text-xs shadow hover:scale-105 transition-all duration-200"
                      >
                        View Submission
                      </a>
                      {s.grade && (
                        <div className="text-green-700 text-xs mt-1 font-semibold">Grade: {s.grade}</div>
                      )}
                      {s.feedback && (
                        <div className="text-blue-700 text-xs mt-1 font-semibold">Feedback: {s.feedback}</div>
                      )}
                    </div>
                    <div className="flex flex-col gap-1 items-end">
                      <input
                        type="text"
                        placeholder="Grade"
                        value={editState[s._id]?.grade || ""}
                        className="input-field w-20 text-xs"
                        onChange={e => handleEditChange(s._id, "grade", e.target.value)}
                      />
                      <textarea
                        placeholder="Feedback"
                        value={editState[s._id]?.feedback || ""}
                        className="input-field w-40 text-xs"
                        rows={2}
                        onChange={e => handleEditChange(s._id, "feedback", e.target.value)}
                      />
                      <button
                        className="btn-primary btn-sm mt-1 shadow hover:scale-105 transition-all duration-200"
                        onClick={() => handleSave(s._id)}
                        disabled={saving[s._id]}
                      >
                        {saving[s._id] ? "Saving..." : "Save"}
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default ReviewAssignments; 