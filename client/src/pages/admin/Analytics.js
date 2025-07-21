import React, { useState } from "react"
import { useQuery } from "react-query"
import axios from "axios"
import LoadingSpinner from "../../components/common/LoadingSpinner"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts"

const COLORS = ["#3B82F6", "#10B981", "#F59E42", "#EF4444", "#A78BFA", "#F472B6"]

const Analytics = () => {
  const [selectedCourse, setSelectedCourse] = useState("")

  // Fetch all courses for dropdown
  const { data: courses, isLoading: loadingCourses } = useQuery("admin-courses", () =>
    axios.get("/api/courses/admin/all").then((res) => res.data)
  )

  // Fetch analytics for selected course
  const {
    data: analytics,
    isLoading: loadingAnalytics,
    isError,
  } = useQuery(
    ["course-analytics", selectedCourse],
    () => axios.get(`/api/analytics/course/${selectedCourse}`).then((res) => res.data),
    { enabled: !!selectedCourse }
  )

  return (
    <div className="space-y-8 bg-gradient-to-br from-blue-50 via-white to-purple-50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center md:space-x-6 space-y-4 md:space-y-0">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Course Analytics</h1>
        <div className="flex-1">
          {loadingCourses ? (
            <LoadingSpinner size="small" />
          ) : (
            <select
              className="input-field w-full md:w-72"
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
            >
              <option value="">Select a course...</option>
              {courses?.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.title}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {loadingAnalytics && selectedCourse && (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="large" />
        </div>
      )}

      {isError && (
        <div className="text-red-600 text-center">Failed to load analytics. Please try again.</div>
      )}

      {analytics && (
        <div className="space-y-8">
          {/* Enrollment Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="card bg-white/80 backdrop-blur-lg border border-blue-100 shadow rounded-3xl p-8">
              <div className="text-sm text-gray-600">Total Enrollments</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{analytics.course.totalEnrollments}</div>
            </div>
            <div className="card bg-white/80 backdrop-blur-lg border border-blue-100 shadow rounded-3xl p-8">
              <div className="text-sm text-gray-600">Active Enrollments</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{analytics.course.activeEnrollments}</div>
            </div>
            <div className="card bg-white/80 backdrop-blur-lg border border-blue-100 shadow rounded-3xl p-8">
              <div className="text-sm text-gray-600">Completed Enrollments</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{analytics.course.completedEnrollments}</div>
            </div>
            <div className="card bg-white/80 backdrop-blur-lg border border-blue-100 shadow rounded-3xl p-8">
              <div className="text-sm text-gray-600">Completion Rate</div>
              <div className="text-2xl font-bold text-green-600">{analytics.course.completionRate}%</div>
            </div>
          </div>

          {/* Progress Distribution Pie Chart */}
          <div className="card bg-white/80 backdrop-blur-lg border border-blue-100 shadow rounded-3xl p-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Progress Distribution</h3>
            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={Object.entries(analytics.progressDistribution).map(([range, value]) => ({ name: range, value }))}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {Object.entries(analytics.progressDistribution).map((entry, idx) => (
                      <Cell key={entry[0]} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quiz Performance Bar Chart */}
          <div className="card bg-white/80 backdrop-blur-lg border border-blue-100 shadow rounded-3xl p-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Quiz Performance</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.quizPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="quizTitle" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="averageScore" fill="#3B82F6" name="Avg. Score" />
                  <Bar dataKey="passRate" fill="#10B981" name="Pass Rate" />
                  <Bar dataKey="totalAttempts" fill="#F59E42" name="Attempts" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Enrolled Users Table */}
          <div className="card bg-white/80 backdrop-blur-lg border border-blue-100 shadow rounded-3xl p-8 overflow-x-auto">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Enrolled Learners</h3>
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-4 text-left">Name</th>
                  <th className="py-2 px-4 text-left">Email</th>
                  <th className="py-2 px-4 text-left">Progress</th>
                  <th className="py-2 px-4 text-left">Status</th>
                  <th className="py-2 px-4 text-left">Enrolled At</th>
                  <th className="py-2 px-4 text-left">Completed At</th>
                </tr>
              </thead>
              <tbody>
                {analytics.enrollments.map((enrollment, idx) => (
                  <tr key={idx} className="border-b">
                    <td className="py-2 px-4">{enrollment.user?.name || "-"}</td>
                    <td className="py-2 px-4">{enrollment.user?.email || "-"}</td>
                    <td className="py-2 px-4">{enrollment.progress}%</td>
                    <td className="py-2 px-4 capitalize">{enrollment.status}</td>
                    <td className="py-2 px-4">{enrollment.enrolledAt ? new Date(enrollment.enrolledAt).toLocaleDateString() : "-"}</td>
                    <td className="py-2 px-4">{enrollment.completedAt ? new Date(enrollment.completedAt).toLocaleDateString() : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {analytics.enrollments.length === 0 && (
              <div className="text-center text-gray-500 py-8">No enrollments found for this course.</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Analytics 