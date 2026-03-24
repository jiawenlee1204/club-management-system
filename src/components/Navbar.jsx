import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Navbar() {
  const { user, signOut } = useAuth()
  const location = useLocation()

  const handleSignOut = async () => {
    await signOut()
  }

  const navItems = [
    { path: '/dashboard', label: '仪表盘', icon: '📊' },
    { path: '/members', label: '成员管理', icon: '👥' },
    { path: '/activities', label: '活动管理', icon: '🎯' },
    { path: '/stats', label: '数据统计', icon: '📈' },
  ]

  return (
    <nav className="bg-notion-bg border-b-2 border-notion-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 border-2 border-notion-border rounded-full flex items-center justify-center bg-white shadow-line-art">
                <span className="text-lg">🚀</span>
              </div>
              <span className="text-lg font-bold text-notion-text tracking-tight">ClubFlow</span>
            </Link>
          </div>

          <div className="flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 border-2 ${
                  location.pathname === item.path
                    ? 'bg-notion-text text-white border-notion-text shadow-line-art'
                    : 'text-notion-text border-transparent hover:border-notion-border hover:bg-zinc-50'
                }`}
              >
                <span className="mr-1">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-sm font-medium text-notion-text-secondary border-2 border-notion-border px-3 py-1 rounded-full bg-white shadow-line-art-input">
              {user?.email}
            </div>
            <button
              onClick={handleSignOut}
              className="text-sm font-bold text-notion-text hover:text-notion-text-secondary transition-colors border-b-2 border-transparent hover:border-notion-border pb-0.5"
            >
              退出
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
