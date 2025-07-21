import React, { useState } from "react"
import { useQuery } from "react-query"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"

const initialOption = { text: "", isCorrect: false }
const initialQuestion = { text: "", options: [{ ...initialOption }, { ...initialOption }], explanation: "" }

const CreateQuiz = () => {
  const [courseId, setCourseId] = useState("")
  const [moduleId, setModuleId] = useState("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [questions, setQuestions] = useState([{ ...initialQuestion }])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  // Fetch all courses for dropdown
  const { data: courses, isLoading: loadingCourses } = useQuery("admin-courses", () =>
    axios.get("/api/courses/admin/all").then((res) => res.data)
  )

  // Get modules for the selected course
  const selectedCourse = courses?.find((c) => c._id === courseId)
  const modules = selectedCourse?.modules || []

  // Question/Option Handlers
  const handleQuestionChange = (idx, field, value) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === idx ? { ...q, [field]: value } : q))
    )
  }

  const handleOptionChange = (qIdx, oIdx, value) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIdx
          ? { ...q, options: q.options.map((opt, j) => (j === oIdx ? { ...opt, text: value } : opt)) }
          : q
      )
    )
  }

  const addQuestion = () => {
    setQuestions((prev) => [...prev, { ...initialQuestion }])
  }

  const removeQuestion = (idx) => {
    setQuestions((prev) => prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev)
  }

  const addOption = (qIdx) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIdx ? { ...q, options: [...q.options, { ...initialOption }] } : q
      )
    )
  }

  const removeOption = (qIdx, oIdx) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIdx && q.options.length > 2
          ? { ...q, options: q.options.filter((_, j) => j !== oIdx) }
          : q
      )
    )
  }

  const markCorrect = (qIdx, oIdx) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIdx
          ? {
              ...q,
              options: q.options.map((opt, j) => ({ ...opt, isCorrect: j === oIdx })),
            }
          : q
      )
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    if (!courseId || !moduleId || !title || !description || questions.some((q) => !q.text || q.options.some((o) => !o.text) || !q.options.some((o) => o.isCorrect))) {
      setError("Please fill in all required fields, select a module, and ensure each question has at least two options and one correct answer.")
      return
    }
    setLoading(true)
    try {
      // Transform questions to match backend schema
      const transformedQuestions = questions.map((q) => ({
        question: q.text,
        options: q.options.map((opt) => opt.text),
        correctAnswer: q.options.findIndex((opt) => opt.isCorrect),
        explanation: q.explanation,
      }))
      await axios.post("/api/quizzes", {
        course: courseId,
        module: moduleId,
        title,
        description,
        questions: transformedQuestions,
      })
      toast.success("Quiz created successfully!")
      navigate("/quizzes")
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create quiz.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8 bg-gradient-to-br from-blue-50 via-white to-purple-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Create New Quiz</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card bg-white/80 backdrop-blur-lg border border-blue-100 shadow rounded-3xl p-8 space-y-4">
          <div>
            <label className="block font-medium mb-1">Course *</label>
            {loadingCourses ? (
              <div>Loading courses...</div>
            ) : (
              <select className="input-field" value={courseId} onChange={(e) => { setCourseId(e.target.value); setModuleId("") }} required>
                <option value="">Select a course...</option>
                {courses?.map((course) => (
                  <option key={course._id} value={course._id}>{course.title}</option>
                ))}
              </select>
            )}
          </div>
          {modules.length > 0 && (
            <div>
              <label className="block font-medium mb-1">Module *</label>
              <select className="input-field" value={moduleId} onChange={(e) => setModuleId(e.target.value)} required>
                <option value="">Select a module...</option>
                {modules.map((mod) => (
                  <option key={mod._id} value={mod._id}>{mod.title}</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="block font-medium mb-1">Quiz Title *</label>
            <input className="input-field" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div>
            <label className="block font-medium mb-1">Description *</label>
            <textarea className="input-field" value={description} onChange={(e) => setDescription(e.target.value)} required />
          </div>
        </div>

        {/* Questions */}
        <div className="card bg-white/80 backdrop-blur-lg border border-blue-100 shadow rounded-3xl p-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Questions</h2>
            <button type="button" className="btn-primary shadow hover:scale-105 transition-all duration-200" onClick={addQuestion}>
              + Add Question
            </button>
          </div>
          {questions.map((q, qIdx) => (
            <div key={qIdx} className="border-b pb-4 mb-4 last:border-b-0 last:mb-0 last:pb-0">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Question {qIdx + 1}</span>
                {questions.length > 1 && (
                  <button type="button" className="text-red-600 hover:underline text-sm shadow hover:scale-105 transition-all duration-200" onClick={() => removeQuestion(qIdx)}>
                    Remove
                  </button>
                )}
              </div>
              <div>
                <label className="block text-sm mb-1">Question Text *</label>
                <input className="input-field" value={q.text} onChange={(e) => handleQuestionChange(qIdx, "text", e.target.value)} required />
              </div>
              <div className="mt-2">
                <label className="block text-sm mb-1">Options *</label>
                {q.options.map((opt, oIdx) => (
                  <div key={oIdx} className="flex items-center gap-2 mb-2">
                    <input
                      className="input-field flex-1"
                      value={opt.text}
                      onChange={(e) => handleOptionChange(qIdx, oIdx, e.target.value)}
                      required
                    />
                    <label className="flex items-center gap-1">
                      <input
                        type="radio"
                        name={`correct-${qIdx}`}
                        checked={opt.isCorrect}
                        onChange={() => markCorrect(qIdx, oIdx)}
                        required
                      />
                      <span className="text-xs">Correct</span>
                    </label>
                    {q.options.length > 2 && (
                      <button type="button" className="text-red-600 hover:underline text-xs shadow hover:scale-105 transition-all duration-200" onClick={() => removeOption(qIdx, oIdx)}>
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" className="btn-secondary mt-2 shadow hover:scale-105 transition-all duration-200" onClick={() => addOption(qIdx)}>
                  + Add Option
                </button>
              </div>
              <div className="mt-2">
                <label className="block text-sm mb-1">Explanation (optional)</label>
                <textarea className="input-field" value={q.explanation} onChange={(e) => handleQuestionChange(qIdx, "explanation", e.target.value)} />
              </div>
            </div>
          ))}
        </div>

        {error && <div className="text-red-600 text-center">{error}</div>}
        <div className="flex justify-end">
          <button type="submit" className="btn-primary px-8 shadow hover:scale-105 transition-all duration-200" disabled={loading}>
            {loading ? "Creating..." : "Create Quiz"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CreateQuiz 