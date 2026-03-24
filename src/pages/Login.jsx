import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [isRegister, setIsRegister] = useState(false)
  const [name, setName] = useState('')
  const [studentId, setStudentId] = useState('')
  const [major, setMajor] = useState('')
  const { signIn, signUp } = useAuth()
  const { error: toastError, success } = useToast()
  const navigate = useNavigate()

  const handleAuth = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (isRegister) {
      const { data, error } = await signUp(email, password)
      
      if (error) {
        setError(error.message)
        toastError(error.message)
        setLoading(false)
        return
      }

      if (data.user) {
        try {
          await api.createProfile({
            id: data.user.id,
            name: name,
            student_id: studentId,
            major: major,
            contact: email,
          })
          success('注册成功！请登录')
          setIsRegister(false)
        } catch (profileError) {
          console.error('Profile creation error:', profileError)
          setError('账号创建成功，但个人资料保存失败')
          toastError('个人资料保存失败: ' + profileError.message)
        }
        setLoading(false)
      }
    } else {
      const { error } = await signIn(email, password)

      if (error) {
        setError(error.message)
        toastError(error.message)
        setLoading(false)
      } else {
        navigate('/dashboard')
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-notion-bg-secondary p-4 line-art-pattern" style={{
      backgroundImage: 'url(https://pub-141831e61e69445289222976a15b6fb3.r2.dev/Image_to_url_V2/33-imagetourl.cloud-1774343234928-ms013c.jpg)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }}>
      <div className="notion-card w-full max-w-md p-8 line-art-border">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white border-2 border-notion-border shadow-line-art mb-4 relative">
            <svg className="w-10 h-10 text-notion-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <div className="absolute inset-0 border-2 border-dashed border-notion-border rounded-full animate-spin" style={{ animationDuration: '20s' }}></div>
          </div>
          <h1 className="text-3xl font-bold text-notion-text mb-2 tracking-tight">ClubFlow</h1>
          <p className="text-notion-text-secondary text-sm font-medium">社团管理助手</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-sm font-medium text-notion-text mb-2">
                姓名 *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="notion-input"
                placeholder="请输入姓名"
                required={isRegister}
              />
            </div>
          )}

          {isRegister && (
            <div>
              <label className="block text-sm font-medium text-notion-text mb-2">
                学号 *
              </label>
              <input
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="notion-input"
                placeholder="请输入学号"
                required={isRegister}
              />
            </div>
          )}

          {isRegister && (
            <div>
              <label className="block text-sm font-medium text-notion-text mb-2">
                专业 *
              </label>
              <input
                type="text"
                value={major}
                onChange={(e) => setMajor(e.target.value)}
                className="notion-input"
                placeholder="请输入专业"
                required={isRegister}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-notion-text mb-2">
              邮箱
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="notion-input"
              placeholder="your@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-notion-text mb-2">
              密码
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="notion-input"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          {error && (
            <div className="bg-white border-2 border-notion-border text-notion-text px-4 py-3 rounded-lg text-sm font-medium shadow-line-art">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="notion-button w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '处理中...' : (isRegister ? '注册' : '登录')}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-notion-text-secondary">
          <button
            onClick={() => {
              setIsRegister(!isRegister)
              setError('')
            }}
            className="text-zinc-600 hover:text-zinc-900 underline"
          >
            {isRegister ? '已有账号？点击登录' : '首次使用？点击注册成为管理员'}
          </button>
        </div>
      </div>
    </div>
  )
}
