import { useEffect, useState, useCallback } from 'react'
import { Table, Button, Input, Modal, Space, App, Tag, Image, Tabs } from 'antd'
import { CheckOutlined, CloseOutlined, ReloadOutlined } from '@ant-design/icons'
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table'
import type { FilterValue } from 'antd/es/table/interface'
import request from '../../api/request'

const STATUS_LABELS: Record<number, string> = { 0: '待审核', 1: '已通过', 2: '已拒绝' }
const STATUS_COLORS: Record<number, string> = { 0: 'orange', 1: 'green', 2: 'red' }
const TYPE_LABELS: Record<string, string> = {
  user_avatar: '用户头像',
  admin_upload: '管理员上传',
}

interface ReviewItem {
  id: number
  owner_type: string
  owner_id: number
  url: string
  status: number
  status_text: string
  reviewer_id: number | null
  reject_reason: string
  created_at: string
  updated_at: string
}

export default function ReviewManage() {
  const [reviews, setReviews] = useState<ReviewItem[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [filterStatus, setFilterStatus] = useState<number | undefined>(0)
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [rejectTarget, setRejectTarget] = useState<number | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  const { message } = App.useApp()

  const fetchReviews = useCallback(async () => {
    setLoading(true)
    try {
      const res = await request.get<any, any>('/reviews', {
        params: { page, page_size: pageSize, status: filterStatus },
      })
      const body = res.data as any
      const items = body.data?.items ?? body.items ?? []
      const total = body.data?.total ?? body.total ?? 0
      setReviews(items)
      setTotal(total)
    } catch {
      message.error('获取审核列表失败')
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, filterStatus, message])

  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

  const handleTableChange = (
    pagination: TablePaginationConfig,
    _filters: Record<string, FilterValue | null>
  ) => {
    if (pagination.current) setPage(pagination.current)
    if (pagination.pageSize) setPageSize(pagination.pageSize)
  }

  const handleTabChange = (key: string) => {
    setFilterStatus(key === 'all' ? undefined : Number(key))
    setPage(1)
  }

  const handleApprove = async (id: number) => {
    try {
      await request.put(`/reviews/${id}/approve`)
      message.success('审核通过')
      fetchReviews()
    } catch {
      message.error('操作失败')
    }
  }

  const handleReject = (id: number) => {
    setRejectTarget(id)
    setRejectReason('')
    setRejectModalOpen(true)
  }

  const handleConfirmReject = async () => {
    if (rejectTarget === null) return
    try {
      await request.put(`/reviews/${rejectTarget}/reject`, null, {
        params: { reason: rejectReason || undefined },
      })
      message.success('已拒绝')
      setRejectModalOpen(false)
      fetchReviews()
    } catch {
      message.error('操作失败')
    }
  }

  const columns: ColumnsType<ReviewItem> = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    {
      title: '缩略图',
      dataIndex: 'url',
      key: 'url',
      width: 90,
      render: (url: string) => <Image src={url} width={50} height={50} style={{ objectFit: 'cover', borderRadius: 4 }} />,
    },
    { title: '图片路径', dataIndex: 'url', key: 'url_path', width: 200, ellipsis: true },
    {
      title: '类型',
      dataIndex: 'owner_type',
      key: 'owner_type',
      width: 100,
      render: (type: string) => TYPE_LABELS[type] || type,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 90,
      render: (status: number) => (
        <Tag color={STATUS_COLORS[status]}>{STATUS_LABELS[status]}</Tag>
      ),
    },
    {
      title: '拒绝原因',
      dataIndex: 'reject_reason',
      key: 'reject_reason',
      width: 120,
      ellipsis: true,
      render: (text: string) => text || '-',
    },
    {
      title: '上传时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 170,
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) =>
        record.status === 0 ? (
          <Space>
            <Button
              type="link"
              size="small"
              icon={<CheckOutlined />}
              style={{ color: '#52c41a' }}
              onClick={() => handleApprove(record.id)}
            >
              通过
            </Button>
            <Button
              type="link"
              size="small"
              danger
              icon={<CloseOutlined />}
              onClick={() => handleReject(record.id)}
            >
              拒绝
            </Button>
          </Space>
        ) : (
          <Tag color={STATUS_COLORS[record.status]}>{STATUS_LABELS[record.status]}</Tag>
        ),
    },
  ]

  const tabItems = [
    { key: '0', label: `待审核` },
    { key: '1', label: '已通过' },
    { key: '2', label: '已拒绝' },
    { key: 'all', label: '全部' },
  ]

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Tabs
          activeKey={filterStatus === undefined ? 'all' : String(filterStatus)}
          items={tabItems}
          onChange={handleTabChange}
          style={{ marginBottom: 0 }}
        />
        <Button icon={<ReloadOutlined />} onClick={() => fetchReviews()}>
          刷新
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={reviews}
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
        title="拒绝原因"
        open={rejectModalOpen}
        onOk={handleConfirmReject}
        onCancel={() => setRejectModalOpen(false)}
        okText="确认拒绝"
        okButtonProps={{ danger: true }}
      >
        <Input.TextArea
          placeholder="请输入拒绝原因（可选）"
          rows={3}
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
        />
      </Modal>
    </div>
  )
}
