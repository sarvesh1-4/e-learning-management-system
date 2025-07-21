"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "react-query"
import { Link } from "react-router-dom"
import axios from "axios"
import toast from "react-hot-toast"
import { Plus, Edit, Trash2, Users, Clock, Search, BookOpen } from "lucide-react"
import LoadingSpinner from "../../components/common/LoadingSpinner"
import ConfirmDialog from "../../components/common/ConfirmDialog"

const CourseManagement = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("")
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, courseId: null, courseName: "" })
  const queryClient = useQueryClient()

  const { data: courses, isLoading } = useQuery("admin-courses", () =>
    axios.get("/api/courses/admin/all").then((res) => res.data),
  )

  const deleteMutation = useMutation((courseId) => axios.delete(`/api/courses/${courseId}`), {
    onSuccess: () => {
      queryClient.invalidateQueries("admin-courses")
      toast.success("Course deleted successfully")
      setDeleteConfirm({ isOpen: false, courseId: null, courseName: "" })
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to delete course")
    },
  })

  const publishMutation = useMutation(
    ({ courseId, isPublished }) =>
      axios.put(`/api/courses/${courseId}`, { isPublished }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("admin-courses")
        toast.success("Course status updated")
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || "Failed to update course status")
      },
    }
  )

  const handleDeleteClick = (course) => {
    setDeleteConfirm({
      isOpen: true,
      courseId: course._id,
      courseName: course.title,
    })
  }

  const handleDeleteConfirm = () => {
    deleteMutation.mutate(deleteConfirm.courseId)
  }

  const filteredCourses =
    courses?.filter((course) => {
      const matchesSearch =
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = !filterCategory || course.category === filterCategory
      return matchesSearch && matchesCategory
    }) || []

  const categories = [...new Set(courses?.map((course) => course.category) || [])]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  return (
    <div className="space-y-8 bg-gradient-to-br from-blue-50 via-white to-purple-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Course Management</h1>
          <p className="text-gray-600">Create, edit, and manage your courses</p>
        </div>
        <div className="flex gap-2">
          <Link to="/assignments/create" className="btn-primary flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Create Assignment
          </Link>
          <Link to="/courses/create" className="btn-primary flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Create Course
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search courses..."
                className="input-field pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select className="input-field" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredCourses.map((course) => (
          <div key={course._id} className="card bg-white/80 backdrop-blur-lg border border-blue-100 shadow rounded-3xl p-8 hover:scale-105 hover:shadow-lg transition-all duration-200">
            <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg mb-4 flex items-center justify-center">
              <span className="text-white text-lg font-semibold dark:text-gray-100">{course.title.charAt(0).toUpperCase()}</span>
            </div>

            <div className="space-y-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">
                  <span className="text-blue-600 dark:text-blue-300">{course.title}</span>
                </h3>
                <p className="text-sm text-gray-600 line-clamp-2 mt-1">{course.description}</p>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  <span>{course.enrollmentCount} enrolled</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{course.duration || 0} min</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  <Link
                    to={`/courses/edit/${course._id}`}
                    className="p-2 text-blue-600 hover:bg-blue-100 hover:scale-110 rounded-lg transition-all duration-200"
                    title="Edit Course"
                  >
                    <Edit className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => handleDeleteClick(course)}
                    className="p-2 text-red-600 hover:bg-red-100 hover:scale-110 rounded-lg transition-all duration-200"
                    title="Delete Course"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => publishMutation.mutate({ courseId: course._id, isPublished: !course.isPublished })}
                    className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 ${course.isPublished ? 'text-green-600 hover:bg-green-100' : 'text-gray-600 hover:bg-gray-200'}`}
                    title={course.isPublished ? 'Unpublish Course' : 'Publish Course'}
                  >
                    {course.isPublished ? 'Unpublish' : 'Publish'}
                  </button>
                </div>
                <div className="text-xs text-gray-500">{course.modules?.length || 0} modules</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No courses found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filterCategory
              ? "Try adjusting your search or filter criteria"
              : "Get started by creating your first course"}
          </p>
          {!searchTerm && !filterCategory && (
            <Link to="/courses/create" className="btn-primary">
              Create Your First Course
            </Link>
          )}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, courseId: null, courseName: "" })}
        onConfirm={handleDeleteConfirm}
        title="Delete Course"
        message={`Are you sure you want to delete "${deleteConfirm.courseName}"? This action cannot be undone and will also delete all related enrollments and quiz attempts.`}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  )
}

export default CourseManagement
