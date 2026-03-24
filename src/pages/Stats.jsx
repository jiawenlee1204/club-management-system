import { useState, useEffect } from 'react'
import { api } from '../lib/api'
import Navbar from '../components/Navbar'
import { useToast } from '../contexts/ToastContext'

export default function Stats() {
  const { success, error } = useToast()
  const [activities, setActivities] = useState([])
  const [registrations, setRegistrations] = useState([])
  const [selectedActivity, setSelectedActivity] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const { activities, registrations } = await api.fetchStats()
      setActivities(activities)
      setRegistrations(registrations)
    } catch (error) {
      console.error('Error fetching data:', error.message)
    } finally {
      setLoading(false)
    }
  }

  const getRegistrationCount = (activityId) => {
    return registrations.filter(r => r.activity_id === activityId).length
  }

  const getActivityRegistrations = (activityId) => {
    return registrations.filter(r => r.activity_id === activityId)
  }

  const exportToCSV = (activityId) => {
    const activityRegistrations = getActivityRegistrations(activityId)
    const activity = activities.find(a => a.id === activityId)
    
    if (!activity || activityRegistrations.length === 0) {
      error('该活动暂无报名数据')
      return
    }

    const headers = ['姓名', '学号', '专业', '报名时间', '状态']
    const rows = activityRegistrations.map(r => [
      r.profiles?.name || '',
      r.profiles?.student_id || '',
      r.profiles?.major || '',
      new Date(r.created_at).toLocaleString('zh-CN'),
      r.status || 'active',
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n')

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${activity.title}_报名名单.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    success('导出成功')
  }

  const copyToClipboard = (activityId) => {
    const activityRegistrations = getActivityRegistrations(activityId)
    const activity = activities.find(a => a.id === activityId)
    
    if (!activity || activityRegistrations.length === 0) {
      error('该活动暂无报名数据')
      return
    }

    const text = activityRegistrations.map(r => 
      `${r.profiles?.name} (${r.profiles?.student_id}) - ${r.profiles?.major}`
    ).join('\n')

    navigator.clipboard.writeText(text).then(() => {
      success('已复制到剪贴板')
    }).catch(() => {
      error('复制失败')
    })
  }

  const totalRegistrations = registrations.length
  const activeActivities = activities.filter(a => new Date(a.date) >= new Date()).length

  return (
    <div className="min-h-screen bg-notion-bg-secondary">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-notion-text mb-2 tracking-tight">
            数据统计
          </h1>
          <p className="text-notion-text-secondary font-medium">
            查看活动报名数据与统计
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="notion-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-3xl">📊</div>
              <div className="text-2xl font-bold text-notion-text">{activities.length}</div>
            </div>
            <h3 className="text-lg font-bold text-notion-text mb-1">活动总数</h3>
            <p className="text-sm text-notion-text-secondary font-medium">已发布活动数量</p>
          </div>

          <div className="notion-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-3xl">✅</div>
              <div className="text-2xl font-bold text-notion-text">{totalRegistrations}</div>
            </div>
            <h3 className="text-lg font-bold text-notion-text mb-1">报名总数</h3>
            <p className="text-sm text-notion-text-secondary font-medium">所有活动报名总数</p>
          </div>

          <div className="notion-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-3xl">🎯</div>
              <div className="text-2xl font-bold text-notion-text">{activeActivities}</div>
            </div>
            <h3 className="text-lg font-bold text-notion-text mb-1">进行中活动</h3>
            <p className="text-sm text-notion-text-secondary font-medium">当前进行中的活动</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="text-notion-text-secondary font-medium">加载中...</div>
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📈</div>
            <h3 className="text-lg font-bold text-notion-text mb-2">
              暂无数据
            </h3>
            <p className="text-notion-text-secondary font-medium">
              发布活动后即可查看统计数据
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {activities.map((activity) => {
              const activityRegistrations = getActivityRegistrations(activity.id)
              const registrationCount = activityRegistrations.length

              return (
                <div key={activity.id} className="notion-card p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-notion-text mb-2">
                        {activity.title}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-notion-text-secondary font-medium">
                        <span>
                          {new Date(activity.date).toLocaleString('zh-CN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        <span>•</span>
                        <span>{activity.location}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-notion-text">
                        {registrationCount}
                      </div>
                      <div className="text-sm text-notion-text-secondary font-medium">报名人数</div>
                    </div>
                  </div>

                  {registrationCount > 0 && (
                    <>
                      <div className="flex items-center space-x-3 mb-4">
                        <button
                          onClick={() => setSelectedActivity(
                            selectedActivity === activity.id ? null : activity.id
                          )}
                          className="text-sm font-bold text-zinc-600 hover:text-zinc-900 transition-colors"
                        >
                          {selectedActivity === activity.id ? '收起详情' : '查看详情'}
                        </button>
                      </div>

                      {selectedActivity === activity.id && (
                        <div className="border-t-2 border-notion-border pt-4">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-bold text-notion-text">
                              报名名单 ({registrationCount})
                            </h4>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => copyToClipboard(activity.id)}
                                className="px-3 py-1.5 text-sm font-bold border-2 border-notion-border rounded-lg hover:bg-zinc-50 transition-all hover:shadow-line-art"
                              >
                                复制
                              </button>
                              <button
                                onClick={() => exportToCSV(activity.id)}
                                className="notion-button px-3 py-1.5 text-sm"
                              >
                                导出 CSV
                              </button>
                            </div>
                          </div>

                          <div className="notion-card overflow-hidden">
                            <table className="w-full">
                              <thead className="bg-zinc-50 border-b-2 border-notion-border">
                                <tr>
                                  <th className="px-4 py-3 text-left text-xs font-bold text-notion-text-secondary uppercase tracking-wider">
                                    姓名
                                  </th>
                                  <th className="px-4 py-3 text-left text-xs font-bold text-notion-text-secondary uppercase tracking-wider">
                                    学号
                                  </th>
                                  <th className="px-4 py-3 text-left text-xs font-bold text-notion-text-secondary uppercase tracking-wider">
                                    专业
                                  </th>
                                  <th className="px-4 py-3 text-left text-xs font-bold text-notion-text-secondary uppercase tracking-wider">
                                    报名时间
                                  </th>
                                  <th className="px-4 py-3 text-left text-xs font-bold text-notion-text-secondary uppercase tracking-wider">
                                    状态
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-notion-border">
                                {activityRegistrations.map((registration) => (
                                  <tr key={registration.id} className="hover:bg-zinc-50">
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-notion-text font-medium">
                                      {registration.profiles?.name || '-'}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-notion-text-secondary">
                                      {registration.profiles?.student_id || '-'}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-notion-text-secondary">
                                      {registration.profiles?.major || '-'}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-notion-text-secondary">
                                      {new Date(registration.created_at).toLocaleString('zh-CN')}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                      <span className="px-2 py-1 bg-white border-2 border-notion-border text-notion-text text-xs rounded-full font-bold">
                                        {registration.status || 'active'}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {registrationCount === 0 && (
                    <div className="text-center py-8 text-notion-text-secondary font-medium">
                      暂无报名
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
