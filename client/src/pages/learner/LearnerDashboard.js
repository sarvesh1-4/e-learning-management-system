import React from "react"
import { useQuery } from "react-query"
import { Link, useNavigate } from "react-router-dom"
import axios from "axios"
import LoadingSpinner from "../../components/common/LoadingSpinner"
import { BookOpen, BarChart2 } from "lucide-react"

const LearnerDashboard = () => {
  // Fetch progress for all enrolled courses
  const { data, isLoading, isError } = useQuery("learner-dashboard-progress", () =>
    axios.get("/api/progress/my").then((res) => res.data)
  )

  const progressData = data?.progress || []
  const totalCourses = progressData.length
  const avgProgress =
    totalCourses > 0
      ? Math.round(progressData.reduce((sum, c) => sum + (c.progress || 0), 0) / totalCourses)
      : 0

  const navigate = useNavigate()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  if (isError) {
    return <div className="text-red-600 text-center py-8">Failed to load dashboard. Please try again later.</div>
  }

  return (
    <div className="font-sans space-y-16 relative overflow-auto min-h-screen px-2 sm:px-4">
      {/* Gradient background for header and stats, only in content area */}
      <div className="absolute left-0 top-0 w-full h-[400px] bg-gradient-to-br from-blue-100 via-blue-50 to-white z-0" />
      <div className="relative z-10">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">My Learning Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-300">Track your enrolled courses and progress</p>
          </div>
          <Link to="/catalog" className="btn-primary px-4 py-2 text-sm hover:scale-105 shadow-lg transition-all duration-200">Go to Catalog</Link>
        </div>
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-8">
          <Link
            to="/my-courses?status=active"
            className="card flex items-center gap-4 cursor-pointer transition-all duration-200 hover:scale-105 shadow-lg focus:scale-105 focus:shadow-lg rounded-3xl shadow-2xl bg-white/70 backdrop-blur-lg border border-blue-100 dark:bg-gray-900/70 dark:border-gray-800 p-8"
            style={{ textDecoration: 'none' }}
          >
            <BookOpen className="h-8 w-8 text-blue-500" />
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Active Courses</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalCourses}</div>
            </div>
          </Link>
          <Link
            to="/my-courses?status=completed"
            className="card flex items-center gap-4 cursor-pointer transition-all duration-200 hover:scale-105 shadow-lg focus:scale-105 focus:shadow-lg rounded-3xl shadow-2xl bg-white/70 backdrop-blur-lg border border-blue-100 dark:bg-gray-900/70 dark:border-gray-800 p-8"
            style={{ textDecoration: 'none' }}
          >
            <BookOpen className="h-8 w-8 text-green-500" />
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Completed Courses</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{progressData.filter(c => c.progress === 100).length}</div>
            </div>
          </Link>
          <Link
            to="/progress"
            className="card flex items-center gap-4 cursor-pointer transition-all duration-200 hover:scale-105 shadow-lg focus:scale-105 focus:shadow-lg rounded-3xl shadow-2xl bg-white/70 backdrop-blur-lg border border-blue-100 dark:bg-gray-900/70 dark:border-gray-800 p-8"
            style={{ textDecoration: 'none' }}
          >
            <BarChart2 className="h-8 w-8 text-purple-500" />
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Average Progress</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{avgProgress}%</div>
            </div>
          </Link>
        </div>
        {/* Enrolled Courses */}
        <div className="card rounded-3xl shadow-2xl bg-white/70 backdrop-blur-lg border border-blue-100 dark:bg-gray-900/70 dark:border-gray-800 p-8 mt-16">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Enrolled Courses</h2>
          {progressData.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {progressData.map((course) => (
                <div key={course.courseId} className="border rounded-lg p-4 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg line-clamp-1">{course.title}</h3>
                    <span className={course.progress === 100 ? "text-green-600 dark:text-green-400 text-xs font-semibold" : "text-blue-600 dark:text-blue-400 text-xs font-semibold"}>
                      {course.progress === 100 ? "Completed" : "Active"}
                    </span>
                  </div>
                  <div className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 mb-1">{course.description}</div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <span>{course.progress}% complete</span>
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${course.progress}%` }}></div>
                    </div>
                  </div>
                  <div className="flex justify-end mt-2">
                    <Link to={`/course/${course.courseId}`} className="btn-primary px-4 py-1 text-sm hover:scale-105 shadow-lg transition-all duration-200">
                      Continue
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">You are not enrolled in any courses yet.</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default LearnerDashboard 