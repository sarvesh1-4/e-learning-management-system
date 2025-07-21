import React from "react"
import { useQuery } from "react-query"
import { Link } from "react-router-dom"
import axios from "axios"
import LoadingSpinner from "../../components/common/LoadingSpinner"
import { BookOpen, CheckCircle, XCircle } from "lucide-react"

const Progress = () => {
  // Fetch progress for all enrolled courses
  const { data, isLoading, isError } = useQuery("learner-progress", () =>
    axios.get("/api/progress/my").then((res) => res.data)
  )

  const progressData = data?.progress || []

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  if (isError) {
    return <div className="text-red-600 text-center py-8">Failed to load progress. Please try again later.</div>
  }

  return (
    <div className="space-y-8 bg-gradient-to-br from-blue-50 via-white to-purple-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">My Progress</h1>
          <p className="text-gray-600 dark:text-gray-300">Track your progress in each course and module</p>
        </div>
      </div>

      {/* Progress by Course */}
      {progressData.length > 0 ? (
        <div className="space-y-8">
          {progressData.map((course) => (
            <div key={course.courseId} className="card bg-white/80 backdrop-blur-lg border border-blue-100 shadow rounded-3xl p-8 hover:scale-105 hover:shadow-lg transition-all duration-200">
              <div className="flex items-center justify-between mb-2">
                <div className="font-semibold text-lg text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-500" />
                  {course.title}
                </div>
                <Link to={`/course/${course.courseId}`} className="btn-primary px-4 py-1 text-sm shadow hover:scale-105 transition-all duration-200">
                  Go to Course
                </Link>
              </div>
              <div className="mb-2 text-sm text-gray-600 dark:text-gray-300">{course.description}</div>
              <div className="mb-2 text-xs text-gray-500 dark:text-gray-400">Progress: {course.progress}%</div>
              {/* Modules Progress */}
              <div className="mb-2">
                <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-1">Modules</h4>
                <ul className="list-disc pl-6 space-y-1">
                  {course.modules.map((mod, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      {mod.completed ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-gray-400 dark:text-gray-300" />
                      )}
                      <span className={mod.completed ? "text-green-700 dark:text-green-400" : "text-gray-700 dark:text-gray-100"}>{mod.title}</span>
                    </li>
                  ))}
                </ul>
              </div>
              {/* Quiz Attempts */}
              {course.quizzes && course.quizzes.length > 0 && (
                <div className="mt-2">
                  <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-1">Quiz Attempts</h4>
                  <ul className="list-disc pl-6 space-y-1">
                    {course.quizzes.map((quiz, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="font-semibold text-gray-700 dark:text-gray-100">{quiz.title}:</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">Score: {quiz.score}%</span>
                        <span className={quiz.passed ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                          {quiz.passed ? "Passed" : "Not Passed"}
                        </span>
                        <Link to={`/quiz/${quiz.quizId}/results`} className="text-blue-600 dark:text-blue-400 underline text-xs shadow hover:scale-105 transition-all duration-200">
                          View Results
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="h-8 w-8 text-gray-400 dark:text-gray-200" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No progress to show</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Enroll in a course and start learning to see your progress here.
          </p>
        </div>
      )}
    </div>
  )
}

export default Progress 