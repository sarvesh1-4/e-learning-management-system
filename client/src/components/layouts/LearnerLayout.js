"use client"

import { useState } from "react"
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import { LayoutDashboard, BookOpen, GraduationCap, Search, TrendingUp, LogOut, Menu, X, User } from "lucide-react"

const LearnerLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [avatarLoaded, setAvatarLoaded] = useState(false)

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Course Catalog", href: "/catalog", icon: Search },
    { name: "My Courses", href: "/my-courses", icon: BookOpen },
    { name: "Progress", href: "/progress", icon: TrendingUp },
  ]

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 flex z-40 md:hidden ${sidebarOpen ? "" : "pointer-events-none"}`}>
        <div
          className={`fixed inset-0 bg-white/60 backdrop-blur-md transition-opacity ${sidebarOpen ? "opacity-100" : "opacity-0"}`}
          onClick={() => setSidebarOpen(false)}
        />
        <div
          className={`relative flex-1 flex flex-col max-w-xs w-full bg-white transform transition-transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center px-4 py-2">
              <img src="/logo.webp" alt="EduTech LMS Logo" className="h-12 w-12 rounded-full shadow-md" />
              <span className="ml-2 text-xl font-bold text-gray-900 dark:text-gray-100">EduTech LMS</span>
            </div>
            <nav className="mt-5 px-2 space-y-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + "/")
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`sidebar-link ${isActive ? "active bg-blue-200 dark:bg-blue-900 border-l-4 border-blue-500 dark:border-blue-400 text-gray-900 dark:text-gray-100" : "hover:bg-blue-100 dark:hover:bg-blue-800 hover:scale-105 transition-all text-gray-700 dark:text-gray-300"}`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div className="bg-blue-100 p-2 rounded-full overflow-hidden w-14 h-14 flex items-center justify-center shadow-md">
                {user?.avatar ? (
                  <Link to="/profile">
                    <>
                      {!avatarLoaded && (
                        <User className="h-8 w-8 text-blue-600 absolute" />
                      )}
                      <img
                        src={user.avatar}
                        alt="Avatar"
                        className={`w-12 h-12 rounded-full object-cover transition-opacity duration-500 ${avatarLoaded ? 'opacity-100' : 'opacity-0'} relative`}
                        loading="lazy"
                        onLoad={() => setAvatarLoaded(true)}
                      />
                    </>
                  </Link>
                ) : (
                  <Link to="/profile">
                    <User className="h-8 w-8 text-blue-600" />
                  </Link>
                )}
              </div>
              <div className="ml-4">
                <Link to="/profile" className="block">
                  <p className="text-base font-bold text-gray-700 dark:text-gray-100">{user?.name}</p>
                </Link>
                <p className="text-xs text-gray-500 dark:text-gray-300 capitalize font-semibold">{user?.role}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Desktop sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 border-r border-gray-200 bg-gradient-to-b from-blue-50 to-white dark:bg-gray-900 dark:border-gray-800 shadow-xl rounded-xl">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4 py-2">
              <img src="/logo.webp" alt="EduTech LMS Logo" className="h-12 w-12 rounded-full shadow-md" />
              <span className="ml-2 text-xl font-bold text-gray-900 dark:text-gray-100">EduTech LMS</span>
            </div>
            <nav className="mt-5 flex-1 px-2 space-y-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + "/")
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`sidebar-link ${isActive ? "active bg-blue-200 border-l-4 border-blue-500" : "hover:bg-blue-100 hover:scale-105 transition-all"}`}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center">
                <div className="bg-blue-100 p-2 rounded-full overflow-hidden w-14 h-14 flex items-center justify-center shadow-md">
                  {user?.avatar ? (
                    <Link to="/profile">
                      <>
                        {!avatarLoaded && (
                          <User className="h-8 w-8 text-blue-600 absolute" />
                        )}
                        <img
                          src={user.avatar}
                          alt="Avatar"
                          className={`w-12 h-12 rounded-full object-cover transition-opacity duration-500 ${avatarLoaded ? 'opacity-100' : 'opacity-0'} relative`}
                          loading="lazy"
                          onLoad={() => setAvatarLoaded(true)}
                        />
                      </>
                    </Link>
                  ) : (
                    <Link to="/profile">
                      <User className="h-8 w-8 text-blue-600" />
                    </Link>
                  )}
                </div>
                <div className="ml-4">
                  <Link to="/profile" className="block">
                    <p className="text-base font-bold text-gray-700 dark:text-gray-100">{user?.name}</p>
                  </Link>
                  <p className="text-xs text-gray-500 dark:text-gray-300 capitalize font-semibold">{user?.role}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Main content */}
      <div className="md:pl-64 flex flex-col flex-1">
        <div className="sticky top-0 z-10 md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 bg-gray-50">
          <button
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default LearnerLayout
