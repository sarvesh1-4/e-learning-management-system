import React, { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "react-query"
import { Link } from "react-router-dom"
import axios from "axios"
import toast from "react-hot-toast"
import { Edit, Trash2, Search, BookOpen } from "lucide-react"
import LoadingSpinner from "../../components/common/LoadingSpinner"
import ConfirmDialog from "../../components/common/ConfirmDialog"

const QuizManagement = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCourse, setFilterCourse] = useState("")
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, quizId: null, quizTitle: "" })
  const queryClient = useQueryClient()

  // Fetch all quizzes
  const { data: quizzes, isLoading } = useQuery("admin-quizzes", () =>
    axios.get("/api/quizzes/admin/all").then((res) => res.data)
  )

  // Fetch all courses for filter dropdown
  const { data: courses } = useQuery("admin-courses", () =>
    axios.get("/api/courses/admin/all").then((res) => res.data)
  )

  const deleteMutation = useMutation((quizId) => axios.delete(`/api/quizzes/${quizId}`), {
    onSuccess: () => {
      queryClient.invalidateQueries("admin-quizzes")
      toast.success("Quiz deleted successfully")
      setDeleteConfirm({ isOpen: false, quizId: null, quizTitle: "" })
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to delete quiz")
    },
  })

  const handleDeleteClick = (quiz) => {
    setDeleteConfirm({
      isOpen: true,
      quizId: quiz._id,
      quizTitle: quiz.title,
    })
  }

  const handleDeleteConfirm = () => {
    deleteMutation.mutate(deleteConfirm.quizId)
  }

  const filteredQuizzes =
    quizzes?.filter((quiz) => {
      const matchesSearch =
        quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quiz.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCourse = !filterCourse || quiz.course?._id === filterCourse
      return matchesSearch && matchesCourse
    }) || []

  return (
    <div className="space-y-8 bg-gradient-to-br from-blue-50 via-white to-purple-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Quiz Management</h1>
          <p className="text-gray-600">Create, edit, and manage your quizzes</p>
        </div>
        <Link to="/quizzes/create" className="btn-primary flex items-center shadow hover:scale-105 transition-all duration-200">
          <BookOpen className="h-4 w-4 mr-2" />
          Create Quiz
        </Link>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search quizzes..."
                className="input-field pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select className="input-field" value={filterCourse} onChange={(e) => setFilterCourse(e.target.value)}>
              <option value="">All Courses</option>
              {courses?.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Quizzes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredQuizzes.map((quiz) => (
          <div key={quiz._id} className="card bg-white/80 backdrop-blur-lg border border-blue-100 shadow rounded-3xl p-8 hover:scale-105 hover:shadow-lg transition-all duration-200">
            <div className="aspect-video bg-gradient-to-br from-green-500 to-blue-600 rounded-lg mb-4 flex items-center justify-center">
              <span className="text-white text-lg font-semibold">{quiz.title.charAt(0).toUpperCase()}</span>
            </div>

            <div className="space-y-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">{quiz.title}</h3>
                <p className="text-sm text-gray-600 line-clamp-2 mt-1">{quiz.description}</p>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center">
                  <span>{quiz.course?.title || "-"}</span>
                </div>
                <div className="flex items-center">
                  <span>{quiz.questions?.length || 0} questions</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  <Link
                    to={`/quizzes/edit/${quiz._id}`}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg shadow hover:scale-105 transition-all duration-200"
                    title="Edit Quiz"
                  >
                    <Edit className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => handleDeleteClick(quiz)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg shadow hover:scale-105 transition-all duration-200"
                    title="Delete Quiz"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="text-xs text-gray-500">{quiz.questions?.length || 0} questions</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredQuizzes.length === 0 && (
        <div className="text-center py-12">
          <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No quizzes found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filterCourse
              ? "Try adjusting your search or filter criteria"
              : "Get started by creating your first quiz"}
          </p>
          {!searchTerm && !filterCourse && (
            <Link to="/quizzes/create" className="btn-primary">
              Create Your First Quiz
            </Link>
          )}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, quizId: null, quizTitle: "" })}
        onConfirm={handleDeleteConfirm}
        title="Delete Quiz"
        message={`Are you sure you want to delete "${deleteConfirm.quizTitle}"? This action cannot be undone and will also delete all related attempts.`}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  )
}

export default QuizManagement 