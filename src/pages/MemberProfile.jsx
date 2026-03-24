import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import Navbar from '../components/Navbar'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'

export default function MemberProfile() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { success, error } = useToast()
  const [member, setMember] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    student_id: '',
    major: '',
    contact: '',
    bio: '',
  })

  useEffect(() => {
    fetchMember()
  }, [id])

  const fetchMember = async () => {
    try {
      const data = await api.fetchProfiles()
      const member = data.find(m => m.id === id)
      if (!member) throw new Error('Member not found')
      setMember(member)
      setFormData({
        name: member.name,
        student_id: member.student_id,
        major: member.major,
        contact: member.contact || '',
        bio: member.bio || '',
      })
    } catch (error) {
      console.error('Error fetching member:', error.message)
      alert('加载成员信息失败')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    try {
      await api.updateProfile(id, {
        name: formData.name,
        student_id: formData.student_id,
        major: formData.major,
        contact: formData.contact,
        bio: formData.bio,
      })
      success('更新成功')
      setIsEditing(false)
      fetchMember()
    } catch (err) {
      console.error('Error updating member:', err.message)
      error('更新失败: ' + err.message)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-notion-bg-secondary" style={{
        backgroundImage: 'url(https://pub-141831e61e69445289222976a15b6fb3.r2.dev/Image_to_url_V2/33-imagetourl.cloud-1774343234928-ms013c.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}>
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="text-notion-text-secondary font-medium">加载中...</div>
          </div>
        </div>
      </div>
    )
  }

  if (!member) {
    return (
      <div className="min-h-screen bg-notion-bg-secondary" style={{
        backgroundImage: 'url(https://pub-141831e61e69445289222976a15b6fb3.r2.dev/Image_to_url_V2/33-imagetourl.cloud-1774343234928-ms013c.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}>
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">😕</div>
            <h3 className="text-lg font-bold text-notion-text mb-2">
              未找到成员
            </h3>
            <button
              onClick={() => navigate('/members')}
              className="notion-button mt-4"
            >
              返回成员列表
            </button>
          </div>
        </div>
      </div>
    )
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
          <button
            onClick={() => navigate('/members')}
            className="text-notion-text-secondary hover:text-notion-text transition-colors mb-4 font-bold"
          >
            ← 返回成员列表
          </button>
          <h1 className="text-3xl font-bold text-notion-text mb-2 tracking-tight">
            成员详情
          </h1>
        </div>

        <div className="max-w-3xl">
          <div className="notion-card p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 rounded-full bg-white border-2 border-notion-border shadow-line-art flex items-center justify-center text-3xl">
                  {member.name?.charAt(0) || '?'}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-notion-text mb-1">
                    {member.name}
                  </h2>
                  <p className="text-notion-text-secondary font-medium">{member.student_id}</p>
                </div>
              </div>
              {user?.id === member.id && (
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-4 py-2 rounded-lg border-2 border-notion-border text-notion-text hover:bg-zinc-50 transition-all hover:shadow-line-art font-bold"
                >
                  {isEditing ? '取消' : '编辑'}
                </button>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-notion-text mb-2">
                    姓名 *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="notion-input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-notion-text mb-2">
                    学号 *
                  </label>
                  <input
                    type="text"
                    value={formData.student_id}
                    onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                    className="notion-input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-notion-text mb-2">
                    专业 *
                  </label>
                  <input
                    type="text"
                    value={formData.major}
                    onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                    className="notion-input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-notion-text mb-2">
                    联系方式
                  </label>
                  <input
                    type="text"
                    value={formData.contact}
                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                    className="notion-input"
                    placeholder="手机号或邮箱"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-notion-text mb-2">
                    个人简介
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="notion-textarea"
                    rows={4}
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 rounded-lg border-2 border-notion-border text-notion-text hover:bg-zinc-50 transition-all hover:shadow-line-art font-bold"
                  >
                    取消
                  </button>
                  <button type="submit" className="notion-button">
                    保存更改
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-notion-text-secondary mb-1">
                    专业
                  </h3>
                  <p className="text-notion-text font-medium">{member.major}</p>
                </div>
                {member.contact && (
                  <div>
                    <h3 className="text-sm font-bold text-notion-text-secondary mb-1">
                      联系方式
                    </h3>
                    <p className="text-notion-text font-medium">{member.contact}</p>
                  </div>
                )}
                {member.bio && (
                  <div>
                    <h3 className="text-sm font-bold text-notion-text-secondary mb-1">
                      个人简介
                    </h3>
                    <p className="text-notion-text font-medium">{member.bio}</p>
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-bold text-notion-text-secondary mb-1">
                    入社时间
                  </h3>
                  <p className="text-notion-text font-medium">
                    {new Date(member.created_at).toLocaleDateString('zh-CN')}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}