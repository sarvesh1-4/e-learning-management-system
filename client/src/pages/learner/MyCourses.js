import React, { useState } from "react"
import { useQuery } from "react-query"
import { Link, useLocation } from "react-router-dom"
import axios from "axios"
import LoadingSpinner from "../../components/common/LoadingSpinner"
import { BookOpen } from "lucide-react"

const MyCourses = () => {
  // Fetch enrolled courses
  const { data, isLoading, isError } = useQuery("my-courses", () =>
    axios.get("/api/enrollments/my").then((res) => res.data)
  )

  const enrolledCourses = data?.enrollments || []
  const [completing, setCompleting] = useState({})
  const location = useLocation()
  const params = new URLSearchParams(location.search)
  const statusFilter = params.get("status")

  let filteredCourses = enrolledCourses
  if (statusFilter === "active") {
    filteredCourses = enrolledCourses.filter(e => e.status === "active")
  } else if (statusFilter === "completed") {
    filteredCourses = enrolledCourses.filter(e => e.status === "completed")
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  if (isError) {
    return <div className="text-red-600 text-center py-8">Failed to load your courses. Please try again later.</div>
  }

  const handleCompleteModule = async (courseId, moduleId) => {
    setCompleting(prev => ({ ...prev, [moduleId]: true }))
    try {
      await axios.post(`/api/enrollments/${courseId}/complete-module`, { moduleId })
      window.location.reload() // quick way to refresh progress; can be improved
    } catch (err) {
      alert("Failed to complete module.")
    } finally {
      setCompleting(prev => ({ ...prev, [moduleId]: false }))
    }
  }

  return (
    <div className="space-y-6 bg-gradient-to-br from-blue-50 via-white to-purple-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">My Courses</h1>
          <p className="text-gray-600 dark:text-gray-300">Access and continue your enrolled courses</p>
        </div>
      </div>

      {/* Enrolled Courses */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredCourses.map((enroll) => (
          <div key={enroll.course?._id} className="card bg-white/70 backdrop-blur-lg border border-blue-100 shadow rounded-3xl p-8 flex flex-col hover:scale-105 hover:shadow-lg transition-all duration-200">
            <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg mb-4 flex items-center justify-center">
              <span className="text-white text-lg font-semibold dark:text-gray-100">{enroll.course?.title.charAt(0).toUpperCase()}</span>
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">
                  <span className="text-blue-600 dark:text-blue-300">{enroll.course?.title}</span>
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mt-1">{enroll.course?.description}</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <span>{enroll.progress}% complete</span>
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${enroll.progress}%` }}
                  ></div>
                </div>
              </div>
              {/* Modules List */}
              {enroll.course?.modules && enroll.course.modules.length > 0 && (
                <div className="mt-2">
                  <h4 className="text-sm font-semibold mb-1">Modules</h4>
                  <ol className="list-decimal pl-5 space-y-1">
                    {enroll.course.modules.map((mod, idx) => (
                      <li key={mod._id || idx} className="flex items-center gap-2">
                        <span>{mod.title}</span>
                        {enroll.completedModules.some(cm => cm.moduleId === (mod._id || mod.id)) ? (
                          <span className="text-green-600 text-xs font-semibold ml-2">Completed</span>
                        ) : (
                          <button
                            className="btn-primary px-2 py-0.5 text-xs"
                            disabled={!!completing[mod._id]}
                            onClick={() => handleCompleteModule(enroll.course._id, mod._id)}
                          >
                            {completing[mod._id] ? "Marking..." : "Mark as Complete"}
                          </button>
                        )}
                      </li>
                    ))}
                  </ol>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span
                  className={
                    enroll.status === "completed"
                      ? "text-green-600 text-xs font-semibold"
                      : "text-blue-600 text-xs font-semibold"
                  }
                >
                  {enroll.status.charAt(0).toUpperCase() + enroll.status.slice(1)}
                </span>
                <Link
                  to={`/course/${enroll.course?._id}`}
                  className="btn-primary px-4 py-1 text-sm shadow hover:scale-105 transition-all duration-200"
                >
                  Continue
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {enrolledCourses.length === 0 && (
        <div className="text-center py-12">
          <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="h-8 w-8 text-gray-400 dark:text-gray-200" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">You are not enrolled in any courses</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Browse the <Link to="/catalog" className="text-blue-600 underline">course catalog</Link> to get started.
          </p>
        </div>
      )}
    </div>
  )
}

export default MyCourses 