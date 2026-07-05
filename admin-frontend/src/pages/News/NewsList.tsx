import { useEffect, useState, useCallback } from 'react'
import { Table, Button, Input, Select, Space, Popconfirm, Tag, Image, App } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, VerticalAlignTopOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table'
import type { FilterValue } from 'antd/es/table/interface'
import { newsApi, categoryApi } from '../../api/news'
import type { News, Category } from '../../api/news'

export default function NewsList() {
  const [newsList, setNewsList] = useState<News[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [keyword, setKeyword] = useState('')
  const [categoryId, setCategoryId] = useState<number | undefined>()
  const [statusFilter, setStatusFilter] = useState<number | undefined>()
  const [categories, setCategories] = useState<Category[]>([])
  const navigate = useNavigate()
  const { message } = App.useApp()

  const fetchNews = useCallback(async () => {
    setLoading(true)
    try {
      const res = await newsApi.list({
        page,
        page_size: pageSize,
        keyword: keyword || undefined,
        category_id: categoryId,
        status: statusFilter,
      })
      setNewsList(res.data.items)
      setTotal(res.data.total)
    } catch {
      message.error('获取资讯列表失败')
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, keyword, categoryId, statusFilter, message])

  const fetchCategories = useCallback(async () => {
    try {
      const res = await categoryApi.list()
      setCategories(res.data)
    } catch {
      // silently fail
    }
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  useEffect(() => {
    fetchNews()
  }, [fetchNews])

  const handleDelete = async (id: number) => {
    try {
      await newsApi.delete(id)
      message.success('删除成功')
      fetchNews()
    } catch {
      message.error('删除失败')
    }
  }

  const handleToggleTop = async (record: News) => {
    try {
      await newsApi.update(record.id, { is_top: record.is_top === 1 ? 0 : 1 })
      message.success('操作成功')
      fetchNews()
    } catch {
      message.error('操作失败')
    }
  }

  const handleTableChange = (
    pagination: TablePaginationConfig,
    _filters: Record<string, FilterValue | null>
  ) => {
    if (pagination.current) setPage(pagination.current)
    if (pagination.pageSize) setPageSize(pagination.pageSize)
  }

  const statusOptions = [
    { label: '全部状态', value: undefined },
    { label: '草稿', value: 0 },
    { label: '已发布', value: 1 },
    { label: '已下架', value: 2 },
  ]

  const getStatusTag = (status: number) => {
    const map: Record<number, { color: string; text: string }> = {
      0: { color: 'default', text: '草稿' },
      1: { color: 'green', text: '已发布' },
      2: { color: 'red', text: '已下架' },
    }
    const info = map[status] || { color: 'default', text: '未知' }
    return <Tag color={info.color}>{info.text}</Tag>
  }

  const getCategoryName = (id: number) => {
    const cat = categories.find((c) => c.id === id)
    return cat?.name || '-'
  }

  const columns: ColumnsType<News> = [
    { title: '标题', dataIndex: 'title', key: 'title', width: 200, ellipsis: true },
    {
      title: '分类',
      dataIndex: 'category_id',
      key: 'category_id',
      width: 100,
      render: (id: number) => getCategoryName(id),
    },
    {
      title: '封面图',
      dataIndex: 'cover_image',
      key: 'cover_image',
      width: 80,
      render: (url: string) =>
        url ? <Image src={url} width={48} height={48} style={{ objectFit: 'cover', borderRadius: 4 }} /> : '-',
    },
    { title: '浏览数', dataIndex: 'view_count', key: 'view_count', width: 80 },
    { title: '点赞数', dataIndex: 'like_count', key: 'like_count', width: 80 },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 90,
      render: (status: number) => getStatusTag(status),
    },
    {
      title: '置顶',
      dataIndex: 'is_top',
      key: 'is_top',
      width: 70,
      render: (val: number) => (val === 1 ? <Tag color="blue">是</Tag> : <span>否</span>),
    },
    {
      title: '发布时间',
      dataIndex: 'published_at',
      key: 'published_at',
      width: 170,
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => navigate(`/news/edit/${record.id}`)}
          >
            编辑
          </Button>
          <Button
            type="link"
            size="small"
            icon={<VerticalAlignTopOutlined />}
            onClick={() => handleToggleTop(record)}
          >
            {record.is_top === 1 ? '取消置顶' : '置顶'}
          </Button>
          <Popconfirm
            title="确定删除该资讯？"
            onConfirm={() => handleDelete(record.id)}
          >
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
      <div style={{ marginBottom: 16, display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'space-between' }}>
        <Space wrap>
          <Input.Search
            placeholder="搜索标题关键词"
            allowClear
            style={{ width: 220 }}
            onSearch={(val) => {
              setKeyword(val)
              setPage(1)
            }}
          />
          <Select
            placeholder="分类筛选"
            allowClear
            style={{ width: 150 }}
            value={categoryId}
            onChange={(val) => {
              setCategoryId(val)
              setPage(1)
            }}
            options={categories.map((c) => ({ label: c.name, value: c.id }))}
          />
          <Select
            placeholder="状态筛选"
            style={{ width: 130 }}
            value={statusFilter}
            onChange={(val) => {
              setStatusFilter(val)
              setPage(1)
            }}
            options={statusOptions}
          />
        </Space>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/news/edit')}>
          新增资讯
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={newsList}
        rowKey="id"
        loading={loading}
        scroll={{ x: 1200 }}
        onChange={handleTableChange}
        pagination={{
          current: page,
          pageSize,
          total,
          showSizeChanger: true,
          showTotal: (t) => `共 ${t} 条`,
        }}
      />
    </div>
  )
}
