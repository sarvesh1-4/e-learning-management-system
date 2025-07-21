const express = require("express")
const { body, validationResult } = require("express-validator")
const Quiz = require("../models/Quiz")
const QuizAttempt = require("../models/QuizAttempt")
const { auth, adminAuth } = require("../middleware/auth")

const router = express.Router()

// Get quizzes for a course
router.get("/course/:courseId", auth, async (req, res) => {
  try {
    const quizzes = await Quiz.find({
      course: req.params.courseId,
      isActive: true,
    }).select("-questions.correctAnswer -questions.explanation")

    res.json(quizzes)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get quiz by ID (for taking quiz)
router.get("/:id", auth, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .select("-questions.correctAnswer -questions.explanation")
      .populate("course", "title")

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" })
    }

    // Check if user has attempts left
    const attempts = await QuizAttempt.find({
      user: req.user._id,
      quiz: req.params.id,
    })

    const attemptsLeft = quiz.maxAttempts - attempts.length

    res.json({
      ...quiz.toObject(),
      attemptsLeft,
      totalAttempts: attempts.length,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Submit quiz attempt
router.post("/:id/attempt", auth, async (req, res) => {
  try {
    const { answers, timeSpent } = req.body
    const quiz = await Quiz.findById(req.params.id)

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" })
    }

    // Check attempts limit
    const previousAttempts = await QuizAttempt.find({
      user: req.user._id,
      quiz: req.params.id,
    })

    if (previousAttempts.length >= quiz.maxAttempts) {
      return res.status(400).json({ message: "Maximum attempts exceeded" })
    }

    // Calculate score
    let correctAnswers = 0
    const processedAnswers = answers.map((answer, index) => {
      const question = quiz.questions[index]
      const isCorrect = answer.selectedAnswer === question.correctAnswer
      if (isCorrect) correctAnswers++

      return {
        questionId: question._id,
        selectedAnswer: answer.selectedAnswer,
        isCorrect,
      }
    })

    const score = Math.round((correctAnswers / quiz.questions.length) * 100)
    const passed = score >= quiz.passingScore

    // Create quiz attempt
    const attempt = new QuizAttempt({
      user: req.user._id,
      quiz: req.params.id,
      answers: processedAnswers,
      score,
      passed,
      timeSpent,
      attemptNumber: previousAttempts.length + 1,
      startedAt: new Date(Date.now() - timeSpent * 60000),
    })

    await attempt.save()

    // Return results with correct answers for review
    const results = {
      score,
      passed,
      correctAnswers,
      totalQuestions: quiz.questions.length,
      timeSpent,
      attemptNumber: attempt.attemptNumber,
      questions: quiz.questions.map((question, index) => ({
        question: question.question,
        options: question.options,
        correctAnswer: question.correctAnswer,
        selectedAnswer: answers[index].selectedAnswer,
        isCorrect: processedAnswers[index].isCorrect,
        explanation: question.explanation,
      })),
    }

    res.json(results)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get user's quiz attempts
router.get("/:id/attempts", auth, async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({
      user: req.user._id,
      quiz: req.params.id,
    }).sort({ createdAt: -1 })

    res.json(attempts)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get latest quiz result for the current user
router.get("/results/:quizId", auth, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId)
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" })
    }
    const attempt = await QuizAttempt.findOne({
      user: req.user._id,
      quiz: req.params.quizId,
    })
      .sort({ createdAt: -1 })
      .lean()
    if (!attempt) {
      return res.status(404).json({ message: "No quiz attempt found" })
    }
    // Format answers for frontend
    const answers = attempt.answers.map((ans, idx) => {
      const question = quiz.questions.find(q => q._id.equals(ans.questionId))
      return {
        question: question ? question.question : "",
        isCorrect: ans.isCorrect,
        selectedOption: question ? question.options[ans.selectedAnswer] : "",
        correctOption: question ? question.options[question.correctAnswer] : "",
        explanation: question ? question.explanation : "",
      }
    })
    res.json({
      score: attempt.score,
      passed: attempt.passed,
      attemptedAt: attempt.createdAt,
      answers,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Create quiz (Admin only)
router.post(
  "/",
  [
    adminAuth,
    [
      body("title").trim().isLength({ min: 3 }).withMessage("Title must be at least 3 characters"),
      body("description").trim().isLength({ min: 10 }).withMessage("Description must be at least 10 characters"),
      body("course").isMongoId().withMessage("Valid course ID is required"),
      body("questions").isArray({ min: 1 }).withMessage("At least one question is required"),
    ],
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const quiz = new Quiz(req.body)
      await quiz.save()

      res.status(201).json(quiz)
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// Get all quizzes (Admin only)
router.get("/admin/all", adminAuth, async (req, res) => {
  try {
    const quizzes = await Quiz.find().populate("course", "title").sort({ createdAt: -1 })

    res.json(quizzes)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Update quiz (Admin only)
router.put("/:id", adminAuth, async (req, res) => {
  try {
    const quiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate(
      "course",
      "title",
    )

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" })
    }

    res.json(quiz)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Delete quiz (Admin only)
router.delete("/:id", adminAuth, async (req, res) => {
  try {
    const quiz = await Quiz.findByIdAndDelete(req.params.id)

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" })
    }

    // Also delete related attempts
    await QuizAttempt.deleteMany({ quiz: req.params.id })

    res.json({ message: "Quiz deleted successfully" })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
