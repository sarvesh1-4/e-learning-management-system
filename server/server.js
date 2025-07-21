const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const dotenv = require("dotenv")

// Load environment variables first
dotenv.config()

// Validate required environment variables
if (!process.env.MONGODB_URI) {
  console.error("❌ MONGODB_URI environment variable is not set!")
  console.log("Please check your .env file and make sure MONGODB_URI is properly configured.")
  process.exit(1)
}

if (!process.env.JWT_SECRET) {
  console.error("❌ JWT_SECRET environment variable is not set!")
  process.exit(1)
}

const app = express()

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use("/uploads", express.static(require("path").join(__dirname, "uploads")))
app.use("/uploads/assignments", express.static(require("path").join(__dirname, "uploads/assignments")))

// Routes
app.use("/api/auth", require("./routes/auth"))
app.use("/api/courses", require("./routes/courses"))
app.use("/api/quizzes", require("./routes/quizzes"))
app.use("/api/enrollments", require("./routes/enrollments"))
app.use("/api/progress", require("./routes/progress"))
app.use("/api/analytics", require("./routes/analytics"))
app.use("/api/users", require("./routes/users"))
app.use("/api/assignments", require("./routes/assignments"))

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "EduTech LMS Server is running",
    timestamp: new Date().toISOString(),
  })
})

// MongoDB Connection
console.log("🔄 Connecting to MongoDB...")
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ MongoDB Connected Successfully")
    console.log(`📊 Database: ${mongoose.connection.name}`)
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message)
    console.log("Please check your MongoDB URI and network connection.")
    process.exit(1)
  })

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ message: "Something went wrong!" })
})

// Handle 404 routes
app.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found" })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`🌐 Health check: http://localhost:${PORT}/api/health`)
})
