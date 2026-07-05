import { useEffect, useState, useCallback } from 'react'
import { Form, Input, Select, Button, Card, Upload, App, Switch } from 'antd'
import { UploadOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import type { UploadFile } from 'antd/es/upload/interface'
import { newsApi, categoryApi } from '../../api/news'
import { uploadFile } from '../../api/request'
import type { Category } from '../../api/news'

interface NewsFormValues {
  title: string
  summary: string
  category_id: number
  content: string
  status: number
  is_top: boolean
}

export default function NewsEdit() {
  const { id } = useParams<{ id: string }>()
  const isEdit = !!id
  const navigate = useNavigate()
  const { message } = App.useApp()
  const [form] = Form.useForm<NewsFormValues>()
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [coverFile, setCoverFile] = useState<UploadFile | null>(null)
  const [coverUrl, setCoverUrl] = useState('')

  const fetchCategories = useCallback(async () => {
    try {
      const res = await categoryApi.list()
      setCategories(res.data)
    } catch {
      // silently fail
    }
  }, [])

  const fetchNews = useCallback(async () => {
    if (!id) return
    setLoading(true)
    try {
      const res = await newsApi.getById(Number(id))
      const news = res.data
      form.setFieldsValue({
        title: news.title,
        summary: news.summary,
        category_id: news.category_id,
        content: news.content,
        status: news.status,
        is_top: news.is_top === 1,
      })
      setCoverUrl(news.cover_image)
    } catch {
      message.error('获取资讯详情失败')
    } finally {
      setLoading(false)
    }
  }, [id, form, message])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  useEffect(() => {
    if (isEdit) {
      fetchNews()
    } else {
      form.setFieldsValue({ status: 0, is_top: false })
    }
  }, [isEdit, fetchNews, form])

  const handleUpload = async (file: File): Promise<string> => {
    try {
      const res = await uploadFile(file)
      return res.data.url
    } catch {
      message.error('上传失败')
      throw new Error('上传失败')
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      setSubmitting(true)

      let uploadedCoverUrl = coverUrl

      if (coverFile && coverFile.originFileObj) {
        uploadedCoverUrl = await handleUpload(coverFile.originFileObj as File)
      }

      const data: Record<string, unknown> = {
        title: values.title,
        summary: values.summary || '',
        category_id: values.category_id,
        content: values.content || '',
        cover_image: uploadedCoverUrl,
        status: values.status,
        is_top: values.is_top ? 1 : 0,
      }

      if (isEdit) {
        await newsApi.update(Number(id), data)
        message.success('更新成功')
      } else {
        await newsApi.create(data)
        message.success('创建成功')
      }
      navigate('/news/list')
    } catch (e) {
      if (e instanceof Error && e.message === '上传失败') return
      // validation error handled by form
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ maxWidth: 800 }}>
      <div style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/news/list')}>
          返回列表
        </Button>
      </div>
      <Card title={isEdit ? '编辑资讯' : '新增资讯'} loading={loading}>
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
            label="标题"
            rules={[{ required: true, message: '请输入标题' }]}
          >
            <Input placeholder="请输入资讯标题" />
          </Form.Item>
          <Form.Item name="summary" label="摘要">
            <Input.TextArea rows={3} placeholder="请输入摘要" />
          </Form.Item>
          <Form.Item
            name="category_id"
            label="分类"
            rules={[{ required: true, message: '请选择分类' }]}
          >
            <Select
              placeholder="请选择分类"
              options={categories.map((c) => ({ label: c.name, value: c.id }))}
            />
          </Form.Item>
          <Form.Item label="封面图">
            <Upload
              listType="picture-card"
              maxCount={1}
              showUploadList={{ showPreviewIcon: false }}
              beforeUpload={(file) => {
                setCoverFile({ uid: '-1', name: file.name, status: 'done', originFileObj: file })
                return false
              }}
              onRemove={() => {
                setCoverFile(null)
                setCoverUrl('')
              }}
              fileList={
                coverUrl && !coverFile
                  ? [{ uid: '-1', name: 'cover', status: 'done', url: coverUrl }]
                  : coverFile
                    ? [coverFile]
                    : []
              }
            >
              {(coverUrl || coverFile) ? null : (
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>上传</div>
                </div>
              )}
            </Upload>
          </Form.Item>
          <Form.Item
            label="正文"
            name="content"
            tooltip="此处可使用富文本编辑器"
          >
            <Input.TextArea rows={12} placeholder="请输入正文内容（此处可替换为富文本编辑器）" />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select
              options={[
                { label: '草稿', value: 0 },
                { label: '已发布', value: 1 },
                { label: '已下架', value: 2 },
              ]}
            />
          </Form.Item>
          <Form.Item name="is_top" label="是否置顶" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item>
            <Button type="primary" loading={submitting} onClick={handleSubmit}>
              {isEdit ? '保存修改' : '创建资讯'}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}
