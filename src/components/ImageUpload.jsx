import { useState } from 'react'
import { api } from '../lib/api'

export default function ImageUpload({ value, onChange, maxSize = 5, bucket = 'activity-images' }) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(value || '')

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > maxSize * 1024 * 1024) {
      alert(`文件大小不能超过 ${maxSize}MB`)
      return
    }

    if (!file.type.startsWith('image/')) {
      alert('请上传图片文件')
      return
    }

    setUploading(true)

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `activity-images/${fileName}`

      await api.uploadImage(file, bucket, filePath)
      const publicUrl = api.getPublicUrl(bucket, filePath)

      setPreview(publicUrl)
      onChange(publicUrl)
    } catch (error) {
      console.error('Error uploading image:', error.message)
      alert('上传失败: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = () => {
    setPreview('')
    onChange('')
  }

  return (
    <div className="space-y-2">
      {preview ? (
        <div className="relative">
          <img
            src={preview}
            alt="预览"
            className="w-full h-48 object-cover rounded-lg border-2 border-notion-border"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 p-2 bg-white border-2 border-notion-border text-notion-text rounded-full hover:bg-notion-text hover:text-white transition-all shadow-line-art"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ) : (
        <div className="border-2 border-dashed border-notion-border rounded-lg p-8 text-center bg-white hover:border-notion-text transition-colors">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
            id="image-upload"
          />
          <label
            htmlFor="image-upload"
            className="cursor-pointer block"
          >
            <div className="text-4xl mb-2">📷</div>
            <p className="text-notion-text font-medium">
              {uploading ? '上传中...' : '点击上传图片'}
            </p>
            <p className="text-xs text-notion-text-secondary mt-1">
              支持 JPG、PNG、GIF 格式，最大 {maxSize}MB
            </p>
          </label>
        </div>
      )}
    </div>
  )
}