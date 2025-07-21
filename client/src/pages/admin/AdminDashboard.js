import { useQuery } from "react-query"
import axios from "axios"
import { Users, BookOpen, GraduationCap, Calendar, Award } from "lucide-react"
import LoadingSpinner from "../../components/common/LoadingSpinner"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"
import { Link } from "react-router-dom"

const AdminDashboard = () => {
  const { data: analytics, isLoading } = useQuery(
    "admin-analytics",
    () => axios.get("/api/analytics/dashboard").then((res) => res.data),
    {
      refetchInterval: 30000, // Refresh every 30 seconds
    },
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  const stats = [
    {
      name: "Total Learners",
      value: analytics?.overview?.totalUsers || 0,
      icon: Users,
      color: "bg-blue-500",
      change: "+12%",
      link: "/users"
    },
    {
      name: "Active Courses",
      value: analytics?.overview?.totalCourses || 0,
      icon: BookOpen,
      color: "bg-green-500",
      change: "+8%",
      link: "/courses"
    },
    {
      name: "Total Enrollments",
      value: analytics?.overview?.totalEnrollments || 0,
      icon: GraduationCap,
      color: "bg-purple-500",
      change: "+23%",
      link: "/analytics"
    },
    {
      name: "Completion Rate",
      value: `${analytics?.overview?.completionRate || 0}%`,
      icon: Award,
      color: "bg-orange-500",
      change: "+5%",
      link: "/analytics"
    },
  ]

  return (
    <div className="font-sans space-y-16 relative overflow-auto min-h-screen pl-4 sm:pl-8">
      {/* Background accent shapes */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-400 opacity-20 rounded-full blur-3xl z-0" />
      <div className="absolute top-1/2 -right-32 w-80 h-80 bg-purple-400 opacity-10 rounded-full blur-3xl z-0" />
      <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-pink-400 opacity-10 rounded-full blur-3xl z-0" />
      <div className="relative z-10">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Admin Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-300">Welcome back! Here's what's happening with your learning platform.</p>
          </div>
          <Link
            to="/courses"
            className="btn-primary px-4 py-2 text-sm hover:scale-105 shadow-lg transition-all duration-200"
          >
            Manage Courses
          </Link>
          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <Calendar className="h-4 w-4" />
            <span>
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </div>
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mt-8">
          {stats.map((stat) => (
            <Link
              to={stat.link}
              key={stat.name}
              className="card cursor-pointer rounded-3xl shadow-2xl hover:scale-105 shadow-lg transition-all duration-200 bg-white/70 backdrop-blur-lg border border-blue-100 dark:bg-gray-900/70 dark:border-gray-800 p-8"
              style={{ textDecoration: 'none' }}
            >
              <div className="flex items-center">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{stat.name}</p>
                  <div className="flex items-center">
                    <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{stat.value}</p>
                    <span className="ml-2 text-sm text-green-600">{stat.change}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-16">
          {/* Enrollment Trends */}
          <div className="card rounded-3xl shadow-2xl hover:scale-105 shadow-lg transition-all duration-200 bg-white/70 backdrop-blur-lg border border-blue-100 dark:bg-gray-900/70 dark:border-gray-800 p-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Enrollment Trends</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics?.enrollmentTrends || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="_id.month"
                    tickFormatter={(value) => {
                      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
                      return months[value - 1]
                    }}
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(value) => {
                      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
                      return months[value - 1]
                    }}
                  />
                  <Line type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          {/* Popular Courses */}
          <div className="card rounded-3xl shadow-2xl hover:scale-105 shadow-lg transition-all duration-200 bg-white/70 backdrop-blur-lg border border-blue-100 dark:bg-gray-900/70 dark:border-gray-800 p-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Popular Courses</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics?.popularCourses || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="title" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="enrollmentCount" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        {/* Recent Activity & Quiz Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-16">
          {/* Recent Enrollments */}
          <div className="card rounded-3xl shadow-2xl hover:scale-105 shadow-lg transition-all duration-200 bg-white/70 backdrop-blur-lg border border-blue-100 dark:bg-gray-900/70 dark:border-gray-800 p-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Recent Enrollments</h3>
            <div className="space-y-3">
              {analytics?.recentEnrollments?.slice(0, 5).map((enrollment, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <Users className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{enrollment.user?.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{enrollment.course?.title}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{new Date(enrollment.enrolledAt).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Quiz Performance */}
          <div className="card rounded-3xl shadow-2xl hover:scale-105 shadow-lg transition-all duration-200 bg-white/70 backdrop-blur-lg border border-blue-100 dark:bg-gray-900/70 dark:border-gray-800 p-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Quiz Performance</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-300">Total Attempts</span>
                <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">{analytics?.quizStats?.totalAttempts || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-300">Average Score</span>
                <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">{Math.round(analytics?.quizStats?.averageScore || 0)}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-300">Pass Rate</span>
                <span className="text-lg font-semibold text-green-600">{Math.round((analytics?.quizStats?.passRate || 0) * 100)}%</span>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-1">
                  <span>Overall Performance</span>
                  <span>{Math.round((analytics?.quizStats?.passRate || 0) * 100)}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${(analytics?.quizStats?.passRate || 0) * 100}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
