const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
const dotenv = require("dotenv")

// Load environment variables
dotenv.config()

// Import models
const User = require("../models/User")
const Course = require("../models/Course")
const Quiz = require("../models/Quiz")

const setupDatabase = async () => {
  try {
    console.log("🔄 Connecting to MongoDB...")
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    console.log("✅ Connected to MongoDB")

    // Clear existing data (optional - remove this in production)
    console.log("🧹 Clearing existing data...")
    await User.deleteMany({})
    await Course.deleteMany({})
    await Quiz.deleteMany({})

    // Create admin user
    console.log("👤 Creating admin user...")
    const adminUser = new User({
      name: "Admin User",
      email: "admin@edutech.com",
      password: "password123",
      role: "admin",
    })
    await adminUser.save()

    // Create learner user
    console.log("👤 Creating learner user...")
    const learnerUser = new User({
      name: "John Doe",
      email: "learner@edutech.com",
      password: "password123",
      role: "learner",
    })
    await learnerUser.save()

    // Create sample courses
    console.log("📚 Creating sample courses...")
    const course1 = new Course({
      title: "Introduction to JavaScript",
      description: "Learn the fundamentals of JavaScript programming language",
      instructor: adminUser._id,
      category: "Programming",
      level: "beginner",
      duration: 120,
      isPublished: true,
      modules: [
        {
          title: "Variables and Data Types",
          content: "Learn about JavaScript variables, strings, numbers, and booleans",
          duration: 30,
          order: 1,
        },
        {
          title: "Functions and Scope",
          content: "Understanding functions, parameters, and variable scope",
          duration: 45,
          order: 2,
        },
        {
          title: "Arrays and Objects",
          content: "Working with arrays and objects in JavaScript",
          duration: 45,
          order: 3,
        },
      ],
    })
    await course1.save()

    const course2 = new Course({
      title: "React Fundamentals",
      description: "Build modern web applications with React",
      instructor: adminUser._id,
      category: "Web Development",
      level: "intermediate",
      duration: 180,
      isPublished: true,
      modules: [
        {
          title: "Components and JSX",
          content: "Understanding React components and JSX syntax",
          duration: 60,
          order: 1,
        },
        {
          title: "State and Props",
          content: "Managing component state and passing data with props",
          duration: 60,
          order: 2,
        },
        {
          title: "Event Handling",
          content: "Handling user interactions in React applications",
          duration: 60,
          order: 3,
        },
      ],
    })
    await course2.save()

    const course3 = new Course({
      title: "Database Design Principles",
      description: "Learn how to design efficient and scalable databases",
      instructor: adminUser._id,
      category: "Database",
      level: "intermediate",
      duration: 150,
      isPublished: true,
      modules: [
        {
          title: "Entity Relationship Modeling",
          content: "Creating ER diagrams and understanding relationships",
          duration: 50,
          order: 1,
        },
        {
          title: "Normalization",
          content: "Database normalization techniques and best practices",
          duration: 50,
          order: 2,
        },
        {
          title: "Indexing and Performance",
          content: "Optimizing database performance with proper indexing",
          duration: 50,
          order: 3,
        },
      ],
    })
    await course3.save()

    // Create sample quizzes
    console.log("❓ Creating sample quizzes...")
    const quiz1 = new Quiz({
      title: "JavaScript Basics Quiz",
      description: "Test your knowledge of JavaScript fundamentals",
      course: course1._id,
      module: course1.modules[0]._id,
      timeLimit: 15,
      passingScore: 70,
      questions: [
        {
          question: "Which of the following is used to declare a variable in JavaScript?",
          options: ["var", "let", "const", "All of the above"],
          correctAnswer: 3,
          explanation: "All three keywords (var, let, const) can be used to declare variables in JavaScript.",
        },
        {
          question: "What is the result of typeof null in JavaScript?",
          options: ["null", "undefined", "object", "boolean"],
          correctAnswer: 2,
          explanation: "typeof null returns 'object' due to a historical bug in JavaScript.",
        },
        {
          question: "Which method is used to add an element to the end of an array?",
          options: ["push()", "pop()", "shift()", "unshift()"],
          correctAnswer: 0,
          explanation: "The push() method adds one or more elements to the end of an array.",
        },
      ],
    })
    await quiz1.save()

    const quiz2 = new Quiz({
      title: "React Components Quiz",
      description: "Test your understanding of React components",
      course: course2._id,
      module: course2.modules[0]._id,
      timeLimit: 20,
      passingScore: 75,
      questions: [
        {
          question: "What is JSX?",
          options: [
            "A JavaScript library",
            "A syntax extension for JavaScript",
            "A CSS framework",
            "A database query language",
          ],
          correctAnswer: 1,
          explanation: "JSX is a syntax extension for JavaScript that allows you to write HTML-like code in React.",
        },
        {
          question: "How do you pass data from parent to child component in React?",
          options: ["Through state", "Through props", "Through context", "Through refs"],
          correctAnswer: 1,
          explanation: "Props are used to pass data from parent components to child components in React.",
        },
        {
          question: "What hook is used to manage state in functional components?",
          options: ["useEffect", "useState", "useContext", "useReducer"],
          correctAnswer: 1,
          explanation: "useState is the primary hook for managing state in React functional components.",
        },
      ],
    })
    await quiz2.save()

    console.log("✅ Database setup completed successfully!")
    console.log("\n📋 Demo Accounts Created:")
    console.log("👨‍💼 Admin: admin@edutech.com / password123")
    console.log("👨‍🎓 Learner: learner@edutech.com / password123")
    console.log("\n📚 Sample Courses Created:")
    console.log("- Introduction to JavaScript")
    console.log("- React Fundamentals")
    console.log("- Database Design Principles")
    console.log("\n❓ Sample Quizzes Created:")
    console.log("- JavaScript Basics Quiz")
    console.log("- React Components Quiz")

    process.exit(0)
  } catch (error) {
    console.error("❌ Setup failed:", error.message)
    process.exit(1)
  }
}

setupDatabase()
