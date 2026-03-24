import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import Navbar from '../components/Navbar'
import { useToast } from '../contexts/ToastContext'
import { useAuth } from '../contexts/AuthContext'

export default function Members() {
  const navigate = useNavigate()
  const { success, error } = useToast()
  const { user } = useAuth()
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState('grid')

  const [formData, setFormData] = useState({
    name: '',
    student_id: '',
    major: '',
    contact: '',
    bio: '',
  })

  useEffect(() => {
    fetchMembers()
  }, [])

  const fetchMembers = async () => {
    try {
      const data = await api.fetchProfiles()
      setMembers(data)
    } catch (error) {
      console.error('Error fetching members:', error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (!user) {
        error('请先登录')
        return
      }

      await api.createProfile({
        id: crypto.randomUUID(),
        name: formData.name,
        student_id: formData.student_id,
        major: formData.major,
        contact: formData.contact,
        bio: formData.bio,
      })

      setFormData({ name: '', student_id: '', major: '', contact: '', bio: '' })
      setShowAddForm(false)
      fetchMembers()
      success('成员添加成功')
    } catch (err) {
      console.error('Error adding member:', err.message)
      if (err.code === '23505') {
        error('该学号已被使用')
      } else {
        error('添加成员失败: ' + err.message)
      }
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('确定要删除这位成员吗？此操作不可恢复')) return

    try {
      await api.deleteProfile(id)
      fetchMembers()
      success('成员删除成功')
    } catch (err) {
      console.error('Error deleting member:', err.message)
      error('删除成员失败: ' + err.message)
    }
  }

  const filteredMembers = members.filter(
    (member) =>
      member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.student_id?.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
                成员管理
              </h1>
              <p className="text-notion-text-secondary font-medium">
                管理社团成员信息
              </p>
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="notion-button"
            >
              {showAddForm ? '取消' : '+ 添加成员'}
            </button>
          </div>

          <div className="flex items-center space-x-4 mb-4">
            <input
              type="text"
              placeholder="搜索成员姓名或学号..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="notion-input max-w-md"
            />
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg border-2 ${
                  viewMode === 'grid'
                    ? 'bg-notion-text text-white border-notion-text shadow-line-art'
                    : 'text-notion-text border-transparent hover:border-notion-border hover:bg-zinc-50'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg border-2 ${
                  viewMode === 'list'
                    ? 'bg-notion-text text-white border-notion-text shadow-line-art'
                    : 'text-notion-text border-transparent hover:border-notion-border hover:bg-zinc-50'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {showAddForm && (
          <div className="notion-card p-6 mb-8">
            <h2 className="text-xl font-semibold text-notion-text mb-4">
              添加新成员
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-notion-text mb-2">
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
                  <label className="block text-sm font-medium text-notion-text mb-2">
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
                  <label className="block text-sm font-medium text-notion-text mb-2">
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
                  <label className="block text-sm font-medium text-notion-text mb-2">
                    联系方式 *
                  </label>
                  <input
                    type="text"
                    value={formData.contact}
                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                    className="notion-input"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-notion-text mb-2">
                  个人简介
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="notion-textarea"
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 rounded-lg border border-notion-border text-notion-text hover:bg-zinc-50 transition-colors"
                >
                  取消
                </button>
                <button type="submit" className="notion-button">
                  添加成员
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="text-notion-text-secondary">加载中...</div>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-lg font-medium text-notion-text mb-2">
              {searchTerm ? '未找到匹配的成员' : '暂无成员'}
            </h3>
            <p className="text-notion-text-secondary">
              {searchTerm ? '请尝试其他搜索词' : '点击上方按钮添加第一个成员'}
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMembers.map((member) => (
              <div 
                key={member.id} 
                className="notion-card p-6 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => navigate(`/members/${member.id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center text-xl">
                      {member.name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <h3 className="font-medium text-notion-text">{member.name}</h3>
                      <p className="text-sm text-notion-text-secondary">{member.student_id}</p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(member.id)
                    }}
                    className="text-notion-text-secondary hover:text-red-600 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-notion-text-secondary">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                    </svg>
                    {member.major}
                  </div>
                  {member.bio && (
                    <p className="text-notion-text-secondary line-clamp-2">{member.bio}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="notion-card overflow-hidden">
            <table className="w-full">
              <thead className="bg-zinc-50 border-b border-notion-border">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-notion-text-secondary uppercase tracking-wider">
                    姓名
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-notion-text-secondary uppercase tracking-wider">
                    学号
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-notion-text-secondary uppercase tracking-wider">
                    专业
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-notion-text-secondary uppercase tracking-wider">
                    入社时间
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-notion-text-secondary uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-notion-border">
                {filteredMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-zinc-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div 
                        className="flex items-center cursor-pointer hover:text-zinc-700"
                        onClick={() => navigate(`/members/${member.id}`)}
                      >
                        <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-sm mr-3">
                          {member.name?.charAt(0) || '?'}
                        </div>
                        <div className="text-sm font-medium text-notion-text">{member.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-notion-text-secondary">
                      {member.student_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-notion-text-secondary">
                      {member.major}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-notion-text-secondary">
                      {new Date(member.created_at).toLocaleDateString('zh-CN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <button
                        onClick={() => handleDelete(member.id)}
                        className="text-notion-text-secondary hover:text-red-600 transition-colors"
                      >
                        删除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
