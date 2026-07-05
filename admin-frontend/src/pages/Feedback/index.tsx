import { useEffect, useState, useCallback } from 'react'
import { Table, Select, Tag, Button, Modal, Form, Input, App } from 'antd'
import { EditOutlined } from '@ant-design/icons'
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table'
import type { FilterValue } from 'antd/es/table/interface'
import { feedbackApi } from '../../api/feedback'
import type { Feedback } from '../../api/feedback'

const statusMap: Record<number, { color: string; text: string }> = {
  0: { color: 'orange', text: '待处理' },
  1: { color: 'blue', text: '处理中' },
  2: { color: 'green', text: '已解决' },
}

export default function FeedbackManage() {
  const [feedbackList, setFeedbackList] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [statusFilter, setStatusFilter] = useState<number | undefined>()
  const [modalVisible, setModalVisible] = useState(false)
  const [currentFeedback, setCurrentFeedback] = useState<Feedback | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [form] = Form.useForm()
  const { message } = App.useApp()

  const fetchFeedback = useCallback(async () => {
    setLoading(true)
    try {
      const res = await feedbackApi.list({
        page,
        page_size: pageSize,
        status: statusFilter,
      })
      setFeedbackList(res.data.items)
      setTotal(res.data.total)
    } catch {
      message.error('获取工单列表失败')
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, statusFilter, message])

  useEffect(() => {
    fetchFeedback()
  }, [fetchFeedback])

  const handleTableChange = (
    pagination: TablePaginationConfig,
    _filters: Record<string, FilterValue | null>
  ) => {
    if (pagination.current) setPage(pagination.current)
    if (pagination.pageSize) setPageSize(pagination.pageSize)
  }

  const handleOpenModal = (record: Feedback) => {
    setCurrentFeedback(record)
    form.resetFields()
    form.setFieldsValue({
      status: record.status,
      handler_note: record.handler_note || '',
    })
    setModalVisible(true)
  }

  const handleSubmit = async () => {
    if (!currentFeedback) return
    try {
      const values = await form.validateFields()
      setSubmitting(true)
      await feedbackApi.updateStatus(currentFeedback.id, {
        status: values.status,
        handler_note: values.handler_note,
      })
      message.success('处理成功')
      setModalVisible(false)
      fetchFeedback()
    } catch {
      // validation error
    } finally {
      setSubmitting(false)
    }
  }

  const columns: ColumnsType<Feedback> = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    {
      title: '内容',
      dataIndex: 'content',
      key: 'content',
      width: 250,
      ellipsis: true,
      render: (text: string) => (
        <span title={text}>{text.length > 40 ? `${text.slice(0, 40)}...` : text}</span>
      ),
    },
    { title: '联系方式', dataIndex: 'contact', key: 'contact', width: 130 },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 90,
      render: (status: number) => {
        const s = statusMap[status] || { color: 'default', text: '未知' }
        return <Tag color={s.color}>{s.text}</Tag>
      },
    },
    {
      title: '提交时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 170,
    },
    {
      title: '处理备注',
      dataIndex: 'handler_note',
      key: 'handler_note',
      width: 150,
      ellipsis: true,
      render: (text: string) => text || '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      fixed: 'right',
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          icon={<EditOutlined />}
          onClick={() => handleOpenModal(record)}
        >
          处理
        </Button>
      ),
    },
  ]

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Select
          placeholder="状态筛选"
          allowClear
          style={{ width: 150 }}
          value={statusFilter}
          onChange={(val) => {
            setStatusFilter(val)
            setPage(1)
          }}
          options={[
            { label: '全部', value: undefined },
            { label: '待处理', value: 0 },
            { label: '处理中', value: 1 },
            { label: '已解决', value: 2 },
          ]}
        />
      </div>
      <Table
        columns={columns}
        dataSource={feedbackList}
        rowKey="id"
        loading={loading}
        scroll={{ x: 900 }}
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
        title="处理工单"
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        confirmLoading={submitting}
        destroyOnClose
      >
        {currentFeedback && (
          <div style={{ marginBottom: 16 }}>
            <p>
              <strong>反馈内容：</strong>
              {currentFeedback.content}
            </p>
            <p>
              <strong>联系方式：</strong>
              {currentFeedback.contact || '-'}
            </p>
          </div>
        )}
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="status"
            label="处理状态"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select
              options={[
                { label: '待处理', value: 0 },
                { label: '处理中', value: 1 },
                { label: '已解决', value: 2 },
              ]}
            />
          </Form.Item>
          <Form.Item name="handler_note" label="处理备注">
            <Input.TextArea rows={3} placeholder="请输入处理备注" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
