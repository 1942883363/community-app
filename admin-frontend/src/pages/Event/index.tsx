import { useEffect, useState, useCallback } from 'react'
import { Table, Button, Modal, Form, Input, InputNumber, Tag, Space, Popconfirm, Image, Upload, App } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons'
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table'
import type { FilterValue } from 'antd/es/table/interface'
import type { UploadFile } from 'antd/es/upload/interface'
import { eventApi } from '../../api/event'
import type { Event, Registration } from '../../api/event'
import { uploadFile } from '../../api/request'

interface EventFormValues {
  title: string
  content: string
  location: string
  start_time: string
  end_time: string
  max_participants: number
}

const statusMap: Record<number, { color: string; text: string }> = {
  0: { color: 'default', text: '未开始' },
  1: { color: 'green', text: '进行中' },
  2: { color: 'red', text: '已结束' },
}

export default function EventManage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const [modalVisible, setModalVisible] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [coverFile, setCoverFile] = useState<UploadFile | null>(null)
  const [coverUrl, setCoverUrl] = useState('')
  const [form] = Form.useForm<EventFormValues>()

  const [regModalVisible, setRegModalVisible] = useState(false)
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [regLoading, setRegLoading] = useState(false)

  const { message } = App.useApp()

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    try {
      const res = await eventApi.list({ page, page_size: pageSize })
      setEvents(res.data.items)
      setTotal(res.data.total)
    } catch {
      message.error('获取活动列表失败')
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, message])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  const handleTableChange = (
    pagination: TablePaginationConfig,
    _filters: Record<string, FilterValue | null>
  ) => {
    if (pagination.current) setPage(pagination.current)
    if (pagination.pageSize) setPageSize(pagination.pageSize)
  }

  const handleAdd = () => {
    setEditingEvent(null)
    setCoverFile(null)
    setCoverUrl('')
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (record: Event) => {
    setEditingEvent(record)
    setCoverFile(null)
    setCoverUrl(record.cover_image)
    form.setFieldsValue({
      title: record.title,
      content: record.content,
      location: record.location,
      start_time: record.start_time,
      end_time: record.end_time,
      max_participants: record.max_participants,
    })
    setModalVisible(true)
  }

  const handleDelete = async (id: number) => {
    try {
      await eventApi.delete(id)
      message.success('删除成功')
      fetchEvents()
    } catch {
      message.error('删除失败')
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      setSubmitting(true)

      let uploadedCoverUrl = coverUrl
      if (coverFile?.originFileObj) {
        try {
          const res = await uploadFile(coverFile.originFileObj as File)
          uploadedCoverUrl = res.data.url
        } catch {
          message.error('封面上传失败')
          return
        }
      }

      const data = {
        ...values,
        cover_image: uploadedCoverUrl,
      }

      if (editingEvent) {
        await eventApi.update(editingEvent.id, data)
        message.success('更新成功')
      } else {
        await eventApi.create(data)
        message.success('创建成功')
      }
      setModalVisible(false)
      fetchEvents()
    } catch {
      // validation error
    } finally {
      setSubmitting(false)
    }
  }

  const handleViewRegistrations = async (eventId: number) => {
    void eventId
    setRegModalVisible(true)
    setRegLoading(true)
    try {
      const res = await eventApi.getRegistrations(eventId)
      setRegistrations(res.data.items)
    } catch {
      message.error('获取报名列表失败')
    } finally {
      setRegLoading(false)
    }
  }

  const regColumns: ColumnsType<Registration> = [
    { title: '姓名', dataIndex: 'name', key: 'name' },
    { title: '电话', dataIndex: 'phone', key: 'phone' },
    { title: '报名时间', dataIndex: 'created_at', key: 'created_at' },
  ]

  const columns: ColumnsType<Event> = [
    { title: '标题', dataIndex: 'title', key: 'title', width: 160, ellipsis: true },
    {
      title: '封面图',
      dataIndex: 'cover_image',
      key: 'cover_image',
      width: 80,
      render: (url: string) =>
        url ? <Image src={url} width={48} height={48} style={{ objectFit: 'cover', borderRadius: 4 }} /> : '-',
    },
    { title: '地点', dataIndex: 'location', key: 'location', width: 120 },
    {
      title: '时间',
      key: 'time',
      width: 200,
      render: (_, record) => (
        <span>
          {record.start_time} ~ {record.end_time}
        </span>
      ),
    },
    {
      title: '名额',
      key: 'capacity',
      width: 100,
      render: (_, record) => (
        <span>
          {record.current_count}/{record.max_participants}
        </span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: number) => {
        const s = statusMap[status] || { color: 'default', text: '未知' }
        return <Tag color={s.color}>{s.text}</Tag>
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 220,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewRegistrations(record.id)}
          >
            报名
          </Button>
          <Popconfirm title="确定删除？" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新增活动
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={events}
        rowKey="id"
        loading={loading}
        scroll={{ x: 1100 }}
        onChange={handleTableChange}
        pagination={{
          current: page,
          pageSize,
          total,
          showSizeChanger: true,
          showTotal: (t) => `共 ${t} 条`,
        }}
      />

      <Modal
        title={editingEvent ? '编辑活动' : '新增活动'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        confirmLoading={submitting}
        destroyOnClose
        width={640}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="title" label="标题" rules={[{ required: true, message: '请输入标题' }]}>
            <Input placeholder="请输入活动标题" />
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
              {coverUrl || coverFile ? null : (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>上传</div>
                </div>
              )}
            </Upload>
          </Form.Item>
          <Form.Item name="content" label="详情">
            <Input.TextArea rows={4} placeholder="请输入活动详情" />
          </Form.Item>
          <Form.Item name="location" label="地点">
            <Input placeholder="请输入活动地点" />
          </Form.Item>
          <Space style={{ display: 'flex' }} align="start">
            <Form.Item name="start_time" label="开始时间" rules={[{ required: true, message: '请输入开始时间' }]}>
              <Input placeholder="YYYY-MM-DD HH:mm:ss" />
            </Form.Item>
            <Form.Item name="end_time" label="结束时间" rules={[{ required: true, message: '请输入结束时间' }]}>
              <Input placeholder="YYYY-MM-DD HH:mm:ss" />
            </Form.Item>
          </Space>
          <Form.Item name="max_participants" label="名额上限">
            <InputNumber style={{ width: '100%' }} min={0} placeholder="请输入名额上限" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="报名记录"
        open={regModalVisible}
        onCancel={() => setRegModalVisible(false)}
        footer={null}
        width={600}
      >
        <Table
          columns={regColumns}
          dataSource={registrations}
          rowKey="id"
          loading={regLoading}
          pagination={false}
        />
      </Modal>
    </div>
  )
}
