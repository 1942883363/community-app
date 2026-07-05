import { useEffect, useState, useCallback } from 'react'
import {
  Card, Button, Modal, Form, Input, InputNumber, Table, Space, Popconfirm,
  Image, Upload, App, Row, Col, Typography,
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table'
import type { FilterValue } from 'antd/es/table/interface'
import type { UploadFile } from 'antd/es/upload/interface'
import { businessCategoryApi, businessApi } from '../../api/business'
import type { BusinessCategory, Business } from '../../api/business'
import { uploadFile } from '../../api/request'

const { Text } = Typography

interface CategoryFormValues {
  name: string
  icon: string
  sort_order: number
}

interface BusinessFormValues {
  name: string
  address: string
  phone: string
  description: string
  longitude: number
  latitude: number
  sort_order: number
}

export default function BusinessManage() {
  const [categories, setCategories] = useState<BusinessCategory[]>([])
  const [selectedCategory, setSelectedCategory] = useState<BusinessCategory | null>(null)
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [catLoading, setCatLoading] = useState(false)
  const [bizLoading, setBizLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const [catModalVisible, setCatModalVisible] = useState(false)
  const [editingCategory, setEditingCategory] = useState<BusinessCategory | null>(null)
  const [catSubmitting, setCatSubmitting] = useState(false)
  const [catForm] = Form.useForm<CategoryFormValues>()

  const [bizModalVisible, setBizModalVisible] = useState(false)
  const [editingBusiness, setEditingBusiness] = useState<Business | null>(null)
  const [bizSubmitting, setBizSubmitting] = useState(false)
  const [bizForm] = Form.useForm<BusinessFormValues>()
  const [bizImages, setBizImages] = useState<UploadFile[]>([])
  const [existingImages, setExistingImages] = useState<string[]>([])

  const { message } = App.useApp()

  const fetchCategories = useCallback(async () => {
    setCatLoading(true)
    try {
      const res = await businessCategoryApi.list()
      setCategories(res.data)
    } catch {
      message.error('获取分类列表失败')
    } finally {
      setCatLoading(false)
    }
  }, [message])

  const fetchBusinesses = useCallback(async () => {
    if (!selectedCategory) {
      setBusinesses([])
      setTotal(0)
      return
    }
    setBizLoading(true)
    try {
      const res = await businessApi.list({
        page,
        page_size: pageSize,
        category_id: selectedCategory.id,
      })
      setBusinesses(res.data.items)
      setTotal(res.data.total)
    } catch {
      message.error('获取商家列表失败')
    } finally {
      setBizLoading(false)
    }
  }, [selectedCategory, page, pageSize, message])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  useEffect(() => {
    fetchBusinesses()
  }, [fetchBusinesses])

  const handleCatAdd = () => {
    setEditingCategory(null)
    catForm.resetFields()
    catForm.setFieldsValue({ sort_order: 0, icon: '' })
    setCatModalVisible(true)
  }

  const handleCatEdit = (record: BusinessCategory) => {
    setEditingCategory(record)
    catForm.setFieldsValue({
      name: record.name,
      icon: record.icon,
      sort_order: record.sort_order,
    })
    setCatModalVisible(true)
  }

  const handleCatDelete = async (id: number) => {
    try {
      await businessCategoryApi.delete(id)
      message.success('删除成功')
      if (selectedCategory?.id === id) {
        setSelectedCategory(null)
      }
      fetchCategories()
    } catch {
      message.error('删除失败')
    }
  }

  const handleCatSubmit = async () => {
    try {
      const values = await catForm.validateFields()
      setCatSubmitting(true)
      if (editingCategory) {
        await businessCategoryApi.update(editingCategory.id, values)
        message.success('更新成功')
      } else {
        await businessCategoryApi.create(values)
        message.success('创建成功')
      }
      setCatModalVisible(false)
      fetchCategories()
    } catch {
      // validation error
    } finally {
      setCatSubmitting(false)
    }
  }

  const handleBizAdd = () => {
    if (!selectedCategory) {
      message.warning('请先选择分类')
      return
    }
    setEditingBusiness(null)
    setBizImages([])
    setExistingImages([])
    bizForm.resetFields()
    bizForm.setFieldsValue({ sort_order: 0 })
    setBizModalVisible(true)
  }

  const handleBizEdit = (record: Business) => {
    setEditingBusiness(record)
    setBizImages([])
    setExistingImages(record.images || [])
    bizForm.setFieldsValue({
      name: record.name,
      address: record.address,
      phone: record.phone,
      description: record.description,
      longitude: record.longitude,
      latitude: record.latitude,
      sort_order: record.sort_order,
    })
    setBizModalVisible(true)
  }

  const handleBizDelete = async (id: number) => {
    try {
      await businessApi.delete(id)
      message.success('删除成功')
      fetchBusinesses()
    } catch {
      message.error('删除失败')
    }
  }

  const handleBizSubmit = async () => {
    if (!selectedCategory) return
    try {
      const values = await bizForm.validateFields()
      setBizSubmitting(true)

      const uploadedUrls: string[] = []
      for (const file of bizImages) {
        if (file.originFileObj) {
          try {
            const res = await uploadFile(file.originFileObj as File)
            uploadedUrls.push(res.data.url)
          } catch {
            message.error('图片上传失败')
            return
          }
        }
      }

      const data: Partial<Business> = {
        ...values,
        category_id: selectedCategory.id,
        images: [...existingImages, ...uploadedUrls],
      }

      if (editingBusiness) {
        await businessApi.update(editingBusiness.id, data)
        message.success('更新成功')
      } else {
        await businessApi.create(data)
        message.success('创建成功')
      }
      setBizModalVisible(false)
      fetchBusinesses()
    } catch {
      // validation error
    } finally {
      setBizSubmitting(false)
    }
  }

  const handleBizTableChange = (
    pagination: TablePaginationConfig,
    _filters: Record<string, FilterValue | null>
  ) => {
    if (pagination.current) setPage(pagination.current)
    if (pagination.pageSize) setPageSize(pagination.pageSize)
  }

  const bizColumns: ColumnsType<Business> = [
    { title: '名称', dataIndex: 'name', key: 'name', width: 120 },
    { title: '地址', dataIndex: 'address', key: 'address', width: 150, ellipsis: true },
    { title: '电话', dataIndex: 'phone', key: 'phone', width: 120 },
    { title: '简介', dataIndex: 'description', key: 'description', width: 150, ellipsis: true },
    {
      title: '图片',
      dataIndex: 'images',
      key: 'images',
      width: 80,
      render: (images: string[]) =>
        images && images.length > 0 ? (
          <Image src={images[0]} width={48} height={48} style={{ objectFit: 'cover', borderRadius: 4 }} />
        ) : (
          '-'
        ),
    },
    { title: '排序', dataIndex: 'sort_order', key: 'sort_order', width: 70 },
    {
      title: '操作',
      key: 'action',
      width: 140,
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleBizEdit(record)}>
            编辑
          </Button>
          <Popconfirm title="确定删除？" onConfirm={() => handleBizDelete(record.id)}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>上传</div>
    </div>
  )

  return (
    <Row gutter={16}>
      <Col xs={24} md={6}>
        <Card
          title="商家分类"
          size="small"
          extra={
            <Button type="link" size="small" icon={<PlusOutlined />} onClick={handleCatAdd}>
              新增
            </Button>
          }
          loading={catLoading}
        >
          {categories.map((cat) => (
            <Card
              key={cat.id}
              size="small"
              hoverable
              style={{
                marginBottom: 8,
                borderColor: selectedCategory?.id === cat.id ? '#1677ff' : undefined,
              }}
              onClick={() => {
                setSelectedCategory(cat)
                setPage(1)
              }}
              actions={[
                <EditOutlined
                  key="edit"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleCatEdit(cat)
                  }}
                />,
                <Popconfirm
                  key="delete"
                  title="确定删除？"
                  onConfirm={() => handleCatDelete(cat.id)}
                  onPopupClick={(e) => e.stopPropagation()}
                >
                  <DeleteOutlined onClick={(e) => e.stopPropagation()} />
                </Popconfirm>,
              ]}
            >
              <Text strong>
                {cat.icon ? `${cat.icon} ` : ''}
                {cat.name}
              </Text>
            </Card>
          ))}
        </Card>
      </Col>
      <Col xs={24} md={18}>
        <Card
          title={selectedCategory ? `${selectedCategory.name} - 商家列表` : '请选择左侧分类'}
          extra={
            selectedCategory && (
              <Button type="primary" size="small" icon={<PlusOutlined />} onClick={handleBizAdd}>
                新增商家
              </Button>
            )
          }
        >
          <Table
            columns={bizColumns}
            dataSource={businesses}
            rowKey="id"
            loading={bizLoading}
            scroll={{ x: 800 }}
            onChange={handleBizTableChange}
            pagination={{
              current: page,
              pageSize,
              total,
              showSizeChanger: true,
              showTotal: (t) => `共 ${t} 条`,
            }}
          />
        </Card>
      </Col>

      <Modal
        title={editingCategory ? '编辑分类' : '新增分类'}
        open={catModalVisible}
        onOk={handleCatSubmit}
        onCancel={() => setCatModalVisible(false)}
        confirmLoading={catSubmitting}
        destroyOnClose
      >
        <Form form={catForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label="分类名称" rules={[{ required: true, message: '请输入名称' }]}>
            <Input placeholder="请输入分类名称" />
          </Form.Item>
          <Form.Item name="icon" label="图标">
            <Input placeholder="emoji 或图标代码（可选）" />
          </Form.Item>
          <Form.Item name="sort_order" label="排序">
            <InputNumber style={{ width: '100%' }} min={0} placeholder="数字越小越靠前" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={editingBusiness ? '编辑商家' : '新增商家'}
        open={bizModalVisible}
        onOk={handleBizSubmit}
        onCancel={() => setBizModalVisible(false)}
        confirmLoading={bizSubmitting}
        destroyOnClose
        width={640}
      >
        <Form form={bizForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label="商家名称" rules={[{ required: true, message: '请输入名称' }]}>
            <Input placeholder="请输入商家名称" />
          </Form.Item>
          <Form.Item name="address" label="地址">
            <Input placeholder="请输入地址" />
          </Form.Item>
          <Form.Item name="phone" label="电话">
            <Input placeholder="请输入电话" />
          </Form.Item>
          <Form.Item name="description" label="简介">
            <Input.TextArea rows={3} placeholder="请输入简介" />
          </Form.Item>
          <Form.Item label="图片">
            <Upload
              listType="picture-card"
              multiple
              fileList={[
                ...existingImages.map((url) => ({ uid: url, name: 'img', status: 'done' as const, url })),
                ...bizImages,
              ]}
              beforeUpload={(file) => {
                setBizImages((prev) => [
                  ...prev,
                  { uid: `-${Date.now()}`, name: file.name, status: 'done', originFileObj: file },
                ])
                return false
              }}
              onRemove={(file) => {
                if (existingImages.includes(file.uid)) {
                  setExistingImages((prev) => prev.filter((u) => u !== file.uid))
                } else {
                  setBizImages((prev) => prev.filter((f) => f.uid !== file.uid))
                }
              }}
            >
              {uploadButton}
            </Upload>
          </Form.Item>
          <Space style={{ display: 'flex' }} align="start">
            <Form.Item name="longitude" label="经度（可选）">
              <InputNumber placeholder="经度" style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="latitude" label="纬度（可选）">
              <InputNumber placeholder="纬度" style={{ width: '100%' }} />
            </Form.Item>
          </Space>
          <Form.Item name="sort_order" label="排序">
            <InputNumber style={{ width: '100%' }} min={0} placeholder="数字越小越靠前" />
          </Form.Item>
        </Form>
      </Modal>
    </Row>
  )
}
