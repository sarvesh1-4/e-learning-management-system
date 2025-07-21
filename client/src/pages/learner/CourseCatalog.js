import React, { useState } from "react"
import { useQuery } from "react-query"
import { Link } from "react-router-dom"
import axios from "axios"
import { Search, BookOpen } from "lucide-react"
import LoadingSpinner from "../../components/common/LoadingSpinner"

const CourseCatalog = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("")

  // Fetch all published courses
  const { data: courses, isLoading, isError } = useQuery("catalog-courses", () =>
    axios.get("/api/courses").then((res) => res.data)
  )

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

  if (isError) {
    return <div className="text-red-600 text-center py-8">Failed to load courses. Please try again later.</div>
  }

  return (
    <div className="space-y-6 bg-gradient-to-br from-blue-50 via-white to-purple-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Course Catalog</h1>
          <p className="text-gray-600 dark:text-gray-300">Browse and enroll in available courses</p>
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
          <div key={course._id} className="card bg-white/70 backdrop-blur-lg border border-blue-100 shadow rounded-3xl p-8 flex flex-col hover:scale-105 hover:shadow-lg transition-all duration-200">
            <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg mb-4 flex items-center justify-center">
              <span className="text-white text-lg font-semibold dark:text-gray-100">{course.title.charAt(0).toUpperCase()}</span>
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">
                  <span className="text-blue-600 dark:text-blue-300">{course.title}</span>
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mt-1">{course.description}</p>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center">
                  <span>{course.category}</span>
                </div>
                <div className="flex items-center">
                  <span>{course.enrollmentCount} enrolled</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500 dark:text-gray-400">{course.modules?.length || 0} modules</div>
                <Link
                  to={`/course/${course._id}`}
                  className="btn-primary px-4 py-1 text-sm shadow hover:scale-105 transition-all duration-200"
                  title="View Details"
                >
                  View Details
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="h-8 w-8 text-gray-400 dark:text-gray-200" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No courses found</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {searchTerm || filterCategory
              ? "Try adjusting your search or filter criteria"
              : "No courses are currently available."}
          </p>
        </div>
      )}
    </div>
  )
}

export default CourseCatalog 