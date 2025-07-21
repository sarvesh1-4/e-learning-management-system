import React, { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import axios from "axios"
import LoadingSpinner from "../../components/common/LoadingSpinner"
import { CheckCircle, XCircle } from "lucide-react"

const QuizResults = () => {
  const { id } = useParams() // quiz id
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true)
      try {
        const res = await axios.get(`/api/quizzes/results/${id}`)
        setResult(res.data)
      } catch (err) {
        setError("Failed to load quiz results.")
      } finally {
        setLoading(false)
      }
    }
    fetchResults()
  }, [id])

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

  if (!result) {
    return <div className="text-center py-8">No results found for this quiz attempt.</div>
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Quiz Results</h1>
        <Link to="/progress" className="btn-secondary">Back to Progress</Link>
      </div>
      <div className="card space-y-2">
        <div className="flex items-center gap-4">
          <span className="text-lg font-semibold">Score:</span>
          <span className="text-2xl font-bold text-blue-600">{result.score}%</span>
          {result.passed ? (
            <span className="flex items-center text-green-600 font-semibold"><CheckCircle className="h-5 w-5 mr-1" /> Passed</span>
          ) : (
            <span className="flex items-center text-red-600 font-semibold"><XCircle className="h-5 w-5 mr-1" /> Not Passed</span>
          )}
        </div>
        <div className="text-sm text-gray-500">Attempted on: {new Date(result.attemptedAt).toLocaleString()}</div>
      </div>
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Your Answers</h2>
        {result.answers && result.answers.length > 0 ? (
          <ol className="list-decimal pl-6 space-y-4">
            {result.answers.map((ans, idx) => (
              <li key={idx} className="space-y-1">
                <div className="font-medium text-gray-900 dark:text-gray-100">{ans.question}</div>
                <div className="flex items-center gap-2 text-sm">
                  {ans.isCorrect ? (
                    <span className="flex items-center text-green-600"><CheckCircle className="h-4 w-4 mr-1" /> Correct</span>
                  ) : (
                    <span className="flex items-center text-red-600"><XCircle className="h-4 w-4 mr-1" /> Incorrect</span>
                  )}
                </div>
                <div className="text-gray-700 text-sm">
                  <span className="font-semibold">Your answer:</span> {ans.selectedOption}
                </div>
                <div className="text-gray-700 text-sm">
                  <span className="font-semibold">Correct answer:</span> {ans.correctOption}
                </div>
                {ans.explanation && (
                  <div className="text-xs text-gray-500 mt-1">Explanation: {ans.explanation}</div>
                )}
              </li>
            ))}
          </ol>
        ) : (
          <div className="text-gray-500">No answers found for this attempt.</div>
        )}
      </div>
    </div>
  )
}

export default QuizResults 