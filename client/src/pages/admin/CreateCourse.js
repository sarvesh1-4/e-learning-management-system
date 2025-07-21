import React, { useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"

const initialModule = { title: "", content: "", videoUrl: "", duration: 0, order: 1 }

const CreateCourse = () => {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [level, setLevel] = useState("beginner")
  const [duration, setDuration] = useState(0)
  const [thumbnail, setThumbnail] = useState("")
  const [modules, setModules] = useState([{ ...initialModule }])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const handleModuleChange = (idx, field, value) => {
    setModules((prev) =>
      prev.map((mod, i) => (i === idx ? { ...mod, [field]: value } : mod))
    )
  }

  const addModule = () => {
    setModules((prev) => [...prev, { ...initialModule, order: prev.length + 1 }])
  }

  const removeModule = (idx) => {
    setModules((prev) => prev.filter((_, i) => i !== idx).map((mod, i) => ({ ...mod, order: i + 1 })))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    if (!title || !description || !category || modules.some((m) => !m.title || !m.content)) {
      setError("Please fill in all required fields, including at least one module with title and content.")
      return
    }
    setLoading(true)
    try {
      await axios.post("/api/courses", {
        title,
        description,
        category,
        level,
        duration,
        thumbnail,
        modules,
      })
      toast.success("Course created successfully!")
      navigate("/courses")
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create course.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8 bg-gradient-to-br from-blue-50 via-white to-purple-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Create New Course</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card bg-white/80 backdrop-blur-lg border border-blue-100 shadow rounded-3xl p-8 space-y-4">
          <div>
            <label className="block font-medium mb-1">Title *</label>
            <input className="input-field" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div>
            <label className="block font-medium mb-1">Description *</label>
            <textarea className="input-field" value={description} onChange={(e) => setDescription(e.target.value)} required />
          </div>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block font-medium mb-1">Category *</label>
              <input className="input-field" value={category} onChange={(e) => setCategory(e.target.value)} required />
            </div>
            <div className="flex-1">
              <label className="block font-medium mb-1">Level</label>
              <select className="input-field" value={level} onChange={(e) => setLevel(e.target.value)}>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block font-medium mb-1">Duration (min)</label>
              <input type="number" className="input-field" value={duration} onChange={(e) => setDuration(Number(e.target.value))} min={0} />
            </div>
          </div>
          <div>
            <label className="block font-medium mb-1">Thumbnail URL</label>
            <input className="input-field" value={thumbnail} onChange={(e) => setThumbnail(e.target.value)} />
          </div>
        </div>

        {/* Modules */}
        <div className="card bg-white/80 backdrop-blur-lg border border-blue-100 shadow rounded-3xl p-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Modules</h2>
            <button type="button" className="btn-primary shadow hover:scale-105 transition-all duration-200" onClick={addModule}>
              + Add Module
            </button>
          </div>
          {modules.map((mod, idx) => (
            <div key={idx} className="border-b pb-4 mb-4 last:border-b-0 last:mb-0 last:pb-0">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Module {idx + 1}</span>
                {modules.length > 1 && (
                  <button type="button" className="text-red-600 hover:underline text-sm shadow hover:scale-105 transition-all duration-200" onClick={() => removeModule(idx)}>
                    Remove
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1">Title *</label>
                  <input className="input-field" value={mod.title} onChange={(e) => handleModuleChange(idx, "title", e.target.value)} required />
                </div>
                <div>
                  <label className="block text-sm mb-1">Video URL</label>
                  <input className="input-field" value={mod.videoUrl} onChange={(e) => handleModuleChange(idx, "videoUrl", e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div>
                  <label className="block text-sm mb-1">Content *</label>
                  <textarea className="input-field" value={mod.content} onChange={(e) => handleModuleChange(idx, "content", e.target.value)} required />
                </div>
                <div>
                  <label className="block text-sm mb-1">Duration (min)</label>
                  <input type="number" className="input-field" value={mod.duration} onChange={(e) => handleModuleChange(idx, "duration", Number(e.target.value))} min={0} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {error && <div className="text-red-600 text-center">{error}</div>}
        <div className="flex justify-end">
          <button type="submit" className="btn-primary px-8 shadow hover:scale-105 transition-all duration-200" disabled={loading}>
            {loading ? "Creating..." : "Create Course"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CreateCourse 