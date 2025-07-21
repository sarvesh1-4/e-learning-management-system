"use client"
import { Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "./contexts/AuthContext"
import LoadingSpinner from "./components/common/LoadingSpinner"

// Auth components
import Login from "./components/auth/Login"
import Register from "./components/auth/Register"

// Layout components
import AdminLayout from "./components/layouts/AdminLayout"
import LearnerLayout from "./components/layouts/LearnerLayout"

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard"
import CourseManagement from "./pages/admin/CourseManagement"
import QuizManagement from "./pages/admin/QuizManagement"
import Analytics from "./pages/admin/Analytics"
import CreateCourse from "./pages/admin/CreateCourse"
import EditCourse from "./pages/admin/EditCourse"
import CreateQuiz from "./pages/admin/CreateQuiz"
import UserManagement from "./pages/admin/UserManagement"
import Profile from "./pages/learner/Profile"
import CreateAssignment from "./pages/admin/CreateAssignment"
import ReviewAssignments from "./pages/admin/ReviewAssignments"
import AllSubmissions from "./pages/admin/AllSubmissions"

// Learner pages
import LearnerDashboard from "./pages/learner/LearnerDashboard"
import CourseCatalog from "./pages/learner/CourseCatalog"
import MyCourses from "./pages/learner/MyCourses"
import CourseDetail from "./pages/learner/CourseDetail"
import TakeQuiz from "./pages/learner/TakeQuiz"
import QuizResults from "./pages/learner/QuizResults"
import Progress from "./pages/learner/Progress"
import Assignments from "./pages/learner/Assignments"

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  return (
    <Routes>
      {user.role === "admin" ? (
        <Route path="/*" element={<AdminLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="courses" element={<CourseManagement />} />
          <Route path="courses/create" element={<CreateCourse />} />
          <Route path="courses/edit/:id" element={<EditCourse />} />
          <Route path="quizzes" element={<QuizManagement />} />
          <Route path="quizzes/create" element={<CreateQuiz />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="assignments/create" element={<CreateAssignment />} />
          <Route path="assignments/review" element={<ReviewAssignments />} />
          <Route path="assignments/all-submissions" element={<AllSubmissions />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      ) : (
        <Route path="/*" element={<LearnerLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<LearnerDashboard />} />
          <Route path="catalog" element={<CourseCatalog />} />
          <Route path="my-courses" element={<MyCourses />} />
          <Route path="course/:id" element={<CourseDetail />} />
          <Route path="quiz/:id" element={<TakeQuiz />} />
          <Route path="quiz/:id/results" element={<QuizResults />} />
          <Route path="progress" element={<Progress />} />
          <Route path="course/:id/assignments" element={<Assignments />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      )}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default App
