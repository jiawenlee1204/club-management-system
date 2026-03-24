import { useState, useEffect } from 'react'
import { api } from '../lib/api'
import Navbar from '../components/Navbar'

export default function Dashboard() {
  const [stats, setStats] = useState({
    members: 0,
    activities: 0,
    registrations: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const stats = await api.fetchDashboardStats()
      setStats(stats)
    } catch (error) {
      console.error('Error fetching stats:', error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-notion-bg-secondary" style={{
      backgroundImage: 'url(https://pub-141831e61e69445289222976a15b6fb3.r2.dev/Image_to_url_V2/33-imagetourl.cloud-1774343234928-ms013c.jpg)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }}>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-notion-text mb-2 tracking-tight">
            仪表盘
          </h1>
          <p className="text-notion-text-secondary font-medium">
            欢迎使用 ClubFlow 社团管理助手
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="notion-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-3xl">👥</div>
              <div className="text-2xl font-bold text-notion-text">
                {loading ? '...' : stats.members}
              </div>
            </div>
            <h3 className="text-lg font-bold text-notion-text mb-1">成员总数</h3>
            <p className="text-sm text-notion-text-secondary font-medium">注册成员数量</p>
          </div>

          <div className="notion-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-3xl">🎯</div>
              <div className="text-2xl font-bold text-notion-text">
                {loading ? '...' : stats.activities}
              </div>
            </div>
            <h3 className="text-lg font-bold text-notion-text mb-1">活动总数</h3>
            <p className="text-sm text-notion-text-secondary font-medium">已发布活动数量</p>
          </div>

          <div className="notion-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-3xl">✅</div>
              <div className="text-2xl font-bold text-notion-text">
                {loading ? '...' : stats.registrations}
              </div>
            </div>
            <h3 className="text-lg font-bold text-notion-text mb-1">报名总数</h3>
            <p className="text-sm text-notion-text-secondary font-medium">活动报名总数</p>
          </div>
        </div>

        <div className="mt-8 notion-card p-6">
          <h2 className="text-xl font-bold text-notion-text mb-4">
            快速开始
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a
              href="/members"
              className="flex items-center p-4 rounded-lg border-2 border-notion-border hover:bg-zinc-50 transition-all hover:shadow-line-art"
            >
              <span className="text-2xl mr-3">👤</span>
              <div>
                <h3 className="font-bold text-notion-text">添加成员</h3>
                <p className="text-sm text-notion-text-secondary font-medium">
                  录入新的社团成员信息
                </p>
              </div>
            </a>
            <a
              href="/activities"
              className="flex items-center p-4 rounded-lg border-2 border-notion-border hover:bg-zinc-50 transition-all hover:shadow-line-art"
            >
              <span className="text-2xl mr-3">📝</span>
              <div>
                <h3 className="font-bold text-notion-text">发布活动</h3>
                <p className="text-sm text-notion-text-secondary font-medium">
                  创建新的社团活动
                </p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
