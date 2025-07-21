import React, { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import axios from "axios"
import LoadingSpinner from "../../components/common/LoadingSpinner"
import toast from "react-hot-toast"
import { FilePlus } from "lucide-react"

const CourseDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [course, setCourse] = useState(null)
  const [enrolled, setEnrolled] = useState(false)
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(false)
  const [error, setError] = useState("")
  const [quizzes, setQuizzes] = useState([])
  const [completedModules, setCompletedModules] = useState([])

  useEffect(() => {
    const fetchCourse = async () => {
      setLoading(true)
      try {
        const res = await axios.get(`/api/courses/${id}`)
        setCourse(res.data)
        // Check enrollment status
        const enrollRes = await axios.get(`/api/enrollments/status/${id}`)
        setEnrolled(enrollRes.data.enrolled)
        // Fetch quizzes for this course
        const quizRes = await axios.get(`/api/quizzes/course/${id}`)
        setQuizzes(quizRes.data)
        // Fetch completed modules if enrolled
        if (enrollRes.data.enrolled) {
          const enrollmentDetail = await axios.get(`/api/enrollments/${id}`)
          setCompletedModules(enrollmentDetail.data.completedModules.map(cm => cm.moduleId))
        }
      } catch (err) {
        setError("Failed to load course details.")
      } finally {
        setLoading(false)
      }
    }
    fetchCourse()
  }, [id])

  const handleEnroll = async () => {
    setEnrolling(true)
    try {
      await axios.post("/api/enrollments/", { courseId: id })
      toast.success("Enrolled successfully!")
      setEnrolled(true)
      // Optionally redirect to My Courses or course content
      // navigate("/my-courses")
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to enroll.")
    } finally {
      setEnrolling(false)
    }
  }

  const handleCompleteModule = async (moduleId) => {
    try {
      await axios.post(`/api/enrollments/${id}/complete-module`, { moduleId })
      setCompletedModules(prev => [...prev, moduleId])
      toast.success("Module marked as complete!")
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to complete module.")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  if (error) {
    return <div className="text-red-600 text-center py-8">{error}</div>
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8 bg-gradient-to-br from-blue-50 via-white to-purple-50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center md:space-x-6">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">{course.title}</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-2">{course.description}</p>
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-2">
            <span>Category: {course.category}</span>
            <span>Level: {course.level}</span>
            <span>Duration: {course.duration} min</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-2">
            <span>{course.enrollmentCount} enrolled</span>
            <span>{course.modules?.length || 0} modules</span>
          </div>
        </div>
        <div className="md:w-48 md:shrink-0 flex flex-col items-end">
          {!enrolled ? (
            <button
              className="btn-primary px-6 py-2 shadow hover:scale-105 transition-all duration-200"
              onClick={handleEnroll}
              disabled={enrolling}
            >
              {enrolling ? "Enrolling..." : "Enroll Now"}
            </button>
          ) : (
            <>
              <span className="text-green-600 font-semibold">Enrolled</span>
              {quizzes.length > 0 && (
                <button
                  className="btn-primary px-6 py-2 mt-2 shadow hover:scale-105 transition-all duration-200"
                  onClick={() => navigate(`/quiz/${quizzes[0]._id}`)}
                >
                  Take Quiz
                </button>
              )}
            </>
          )}
        </div>
      </div>
      {/* Thumbnail */}
      {course.thumbnail && (
        <div className="mb-4">
          <img src={course.thumbnail} alt="Course thumbnail" className="rounded-lg w-full max-h-64 object-cover" />
        </div>
      )}
      {/* Modules */}
      <div className="card bg-white/80 backdrop-blur-lg border border-blue-100 shadow rounded-3xl p-8">
        <h2 className="text-lg font-semibold mb-4">Course Modules</h2>
        {course.modules && course.modules.length > 0 ? (
          <ol className="list-decimal pl-6 space-y-2">
            {course.modules.map((mod, idx) => (
              <li key={mod._id || idx} className="mb-2">
                <div className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  {mod.title}
                  {enrolled && completedModules.includes(mod._id) && (
                    <span className="text-green-600 text-xs font-semibold ml-2">Completed</span>
                  )}
                </div>
                <div className="text-gray-600 dark:text-gray-300 text-sm">{mod.content}</div>
                {mod.videoUrl && (
                  <div className="mt-2">
                    <a href={mod.videoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-sm">
                      Watch Video
                    </a>
                  </div>
                )}
                <div className="text-xs text-gray-400 dark:text-gray-300 mt-1">Duration: {mod.duration} min</div>
                {enrolled && !completedModules.includes(mod._id) && (
                  <button
                    className="btn-primary px-4 py-1 mt-2 text-xs shadow hover:scale-105 transition-all duration-200"
                    onClick={() => handleCompleteModule(mod._id)}
                  >
                    Mark as Complete
                  </button>
                )}
              </li>
            ))}
          </ol>
        ) : (
          <div className="text-gray-500 dark:text-gray-400">No modules available for this course.</div>
        )}
        {enrolled && (
          <Link to={`/course/${id}/assignments`} className="btn-primary px-4 py-1 mt-2 text-xs flex items-center gap-2 shadow hover:scale-105 transition-all duration-200">
            <FilePlus className="h-4 w-4" />
            View Assignments
          </Link>
        )}
      </div>
    </div>
  )
}

export default CourseDetail 