import { useState, useEffect } from 'react'
import { api } from '../lib/api'
import Navbar from '../components/Navbar'
import ImageUpload from '../components/ImageUpload'
import { useToast } from '../contexts/ToastContext'
import { useAuth } from '../contexts/AuthContext'

export default function Activities() {
  const { success, error } = useToast()
  const { user } = useAuth()
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedActivity, setSelectedActivity] = useState(null)
  const [registeredActivities, setRegisteredActivities] = useState([])

  const [formData, setFormData] = useState({
    title: '',
    date: '',
    location: '',
    content: '',
    image_url: '',
  })

  useEffect(() => {
    fetchActivities()
    if (user) {
      fetchRegistrations()
    }
  }, [user])

  const fetchActivities = async () => {
    try {
      const data = await api.fetchActivities()
      setActivities(data)
    } catch (error) {
      console.error('Error fetching activities:', error.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchRegistrations = async () => {
    try {
      const data = await api.fetchRegistrations(user?.id)
      setRegisteredActivities(data)
    } catch (error) {
      console.error('Error fetching registrations:', error.message)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (!user) {
        error('请先登录')
        return
      }

      await api.createActivity({
        title: formData.title,
        date: formData.date,
        location: formData.location,
        content: formData.content,
        image_url: formData.image_url,
        created_by: user.id,
      })

      setFormData({ title: '', date: '', location: '', content: '', image_url: '' })
      setShowCreateForm(false)
      fetchActivities()
      success('活动发布成功')
    } catch (err) {
      console.error('Error creating activity:', err.message)
      error('创建活动失败: ' + err.message)
    }
  }

  const handleRegister = async (activityId) => {
    try {
      if (!user) {
        error('请先登录')
        return
      }

      await api.createRegistration({
        activity_id: activityId,
        user_id: user.id,
      })

      success('报名成功！')
      setRegisteredActivities([...registeredActivities, activityId])
    } catch (err) {
      console.error('Error registering:', err.message)
      error('报名失败: ' + err.message)
    }
  }

  const isActivityEnded = (date) => {
    return new Date(date) < new Date()
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
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-notion-text mb-2 tracking-tight">
                活动管理
              </h1>
              <p className="text-notion-text-secondary font-medium">
                管理社团活动与报名
              </p>
            </div>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="notion-button"
            >
              {showCreateForm ? '取消' : '+ 发布活动'}
            </button>
          </div>
        </div>

        {showCreateForm && (
          <div className="notion-card p-6 mb-8">
            <h2 className="text-xl font-semibold text-notion-text mb-4">
              发布新活动
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-notion-text mb-2">
                  活动标题 *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="notion-input"
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-notion-text mb-2">
                    活动时间 *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="notion-input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-notion-text mb-2">
                    活动地点 *
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="notion-input"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-notion-text mb-2">
                  活动图片
                </label>
                <ImageUpload
                  value={formData.image_url}
                  onChange={(url) => setFormData({ ...formData, image_url: url })}
                  maxSize={5}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-notion-text mb-2">
                  活动详情
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="notion-textarea"
                  rows={6}
                  placeholder="请输入活动详情描述..."
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 rounded-lg border border-notion-border text-notion-text hover:bg-zinc-50 transition-colors"
                >
                  取消
                </button>
                <button type="submit" className="notion-button">
                  发布活动
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="text-notion-text-secondary">加载中...</div>
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-lg font-medium text-notion-text mb-2">
              暂无活动
            </h3>
            <p className="text-notion-text-secondary">
              点击上方按钮发布第一个活动
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activities.map((activity) => (
              <div key={activity.id} className="notion-card overflow-hidden">
                {activity.image_url && (
                  <div className="h-48 bg-zinc-100 overflow-hidden">
                    <img
                      src={activity.image_url}
                      alt={activity.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-semibold text-notion-text">{activity.title}</h3>
                    {isActivityEnded(activity.date) && (
                      <span className="px-2 py-1 bg-zinc-100 text-notion-text-secondary text-xs rounded-full">
                        已结束
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-2 text-sm text-notion-text-secondary mb-4">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {new Date(activity.date).toLocaleString('zh-CN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {activity.location}
                    </div>
                  </div>

                  {activity.content && (
                    <p className="text-notion-text text-sm mb-4 line-clamp-3">
                      {activity.content}
                    </p>
                  )}

                  <button
                    onClick={() => handleRegister(activity.id)}
                    disabled={isActivityEnded(activity.date) || registeredActivities.includes(activity.id)}
                    className={`notion-button w-full disabled:opacity-50 disabled:cursor-not-allowed ${
                      registeredActivities.includes(activity.id) ? 'bg-green-600' : ''
                    }`}
                  >
                    {registeredActivities.includes(activity.id) 
                      ? '✓ 已报名' 
                      : isActivityEnded(activity.date) 
                        ? '活动已结束' 
                        : '立即报名'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
