import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const AllSubmissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubmissions = async () => {
      setLoading(true);
      try {
        const res = await axios.get("/api/assignments/all-submissions");
        setSubmissions(res.data);
      } catch (err) {
        toast.error("Failed to load submissions");
      } finally {
        setLoading(false);
      }
    };
    fetchSubmissions();
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-4">All Assignment Submissions</h1>
      {loading ? (
        <div>Loading...</div>
      ) : submissions.length === 0 ? (
        <div className="text-gray-500">No submissions found.</div>
      ) : (
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 text-left">Assignment</th>
              <th className="py-2 px-4 text-left">Course</th>
              <th className="py-2 px-4 text-left">Learner</th>
              <th className="py-2 px-4 text-left">Email</th>
              <th className="py-2 px-4 text-left">Submitted At</th>
              <th className="py-2 px-4 text-left">File</th>
              <th className="py-2 px-4 text-left">Grade</th>
              <th className="py-2 px-4 text-left">Feedback</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((s) => (
              <tr key={s._id} className="border-b">
                <td className="py-2 px-4">{s.assignment?.title}</td>
                <td className="py-2 px-4">{s.assignment?.course || "-"}</td>
                <td className="py-2 px-4">{s.user?.name}</td>
                <td className="py-2 px-4">{s.user?.email}</td>
                <td className="py-2 px-4">{new Date(s.submittedAt).toLocaleString()}</td>
                <td className="py-2 px-4">
                  <a href={s.file} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-xs">
                    View
                  </a>
                </td>
                <td className="py-2 px-4">{s.grade || "-"}</td>
                <td className="py-2 px-4">{s.feedback || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AllSubmissions; 