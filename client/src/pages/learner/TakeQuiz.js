import React, { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import axios from "axios"
import LoadingSpinner from "../../components/common/LoadingSpinner"
import toast from "react-hot-toast"

const TakeQuiz = () => {
  const { id } = useParams() // quiz id
  const navigate = useNavigate()
  const [quiz, setQuiz] = useState(null)
  const [answers, setAnswers] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchQuiz = async () => {
      setLoading(true)
      try {
        const res = await axios.get(`/api/quizzes/${id}`)
        setQuiz(res.data)
        setAnswers(Array(res.data.questions.length).fill(null))
      } catch (err) {
        setError("Failed to load quiz.")
      } finally {
        setLoading(false)
      }
    }
    fetchQuiz()
  }, [id])

  const handleSelect = (qIdx, oIdx) => {
    setAnswers((prev) => prev.map((ans, idx) => (idx === qIdx ? oIdx : ans)))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    if (answers.some((ans) => ans === null)) {
      setError("Please answer all questions before submitting.")
      return
    }
    setSubmitting(true)
    try {
      const payload = {
        answers: answers.map((oIdx, qIdx) => ({
          questionId: quiz.questions[qIdx]._id,
          selectedAnswer: oIdx, // send the index, not the text
        })),
        timeSpent: 0, // add timeSpent to match backend expectations
      }
      const res = await axios.post(`/api/quizzes/${id}/attempt`, payload)
      toast.success("Quiz submitted!")
      navigate(`/quiz/${id}/results`)
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit quiz.")
    } finally {
      setSubmitting(false)
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

  if (!quiz) {
    return <div className="text-center py-8">Quiz not found.</div>
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8 bg-gradient-to-br from-blue-50 via-white to-purple-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">{quiz.title}</h1>
      <p className="text-gray-600 mb-4">{quiz.description}</p>
      <form onSubmit={handleSubmit} className="space-y-8">
        {quiz.questions.map((q, qIdx) => (
          <div key={q._id} className="card bg-white/80 backdrop-blur-lg border border-blue-100 shadow rounded-3xl p-8 hover:scale-105 hover:shadow-lg transition-all duration-200">
            <div className="font-medium text-gray-900 dark:text-gray-100 mb-2">
              Question {qIdx + 1}: {q.text}
            </div>
            <div className="space-y-2">
              {q.options.map((opt, oIdx) => (
                <label
                  key={oIdx}
                  className={`quiz-option flex items-center gap-2 cursor-pointer ${answers[qIdx] === oIdx ? "selected border-blue-500 bg-blue-50" : ""}`}
                >
                  <input
                    type="radio"
                    name={`question-${qIdx}`}
                    checked={answers[qIdx] === oIdx}
                    onChange={() => handleSelect(qIdx, oIdx)}
                    className="mr-2"
                  />
                  {opt}
                </label>
              ))}
            </div>
            {q.explanation && (
              <div className="text-xs text-gray-500 mt-2">Note: {q.explanation}</div>
            )}
          </div>
        ))}
        {error && <div className="text-red-600 text-center">{error}</div>}
        <div className="flex justify-end">
          <button type="submit" className="btn-primary px-8 shadow hover:scale-105 transition-all duration-200" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Quiz"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default TakeQuiz 