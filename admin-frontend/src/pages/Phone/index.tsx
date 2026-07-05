import { useEffect, useState, useCallback } from 'react'
import { Card, Button, Modal, Form, Input, InputNumber, Table, Space, Popconfirm, App, Row, Col, Typography } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { phoneCategoryApi, phoneEntryApi } from '../../api/phone'
import type { PhoneCategory, PhoneEntry } from '../../api/phone'

const { Text } = Typography

interface CategoryFormValues {
  name: string
  icon: string
  sort_order: number
}

interface EntryFormValues {
  name: string
  phone_number: string
  remark: string
  sort_order: number
}

export default function PhoneManage() {
  const [categories, setCategories] = useState<PhoneCategory[]>([])
  const [selectedCategory, setSelectedCategory] = useState<PhoneCategory | null>(null)
  const [entries, setEntries] = useState<PhoneEntry[]>([])
  const [catLoading, setCatLoading] = useState(false)
  const [entryLoading, setEntryLoading] = useState(false)

  const [catModalVisible, setCatModalVisible] = useState(false)
  const [editingCategory, setEditingCategory] = useState<PhoneCategory | null>(null)
  const [catSubmitting, setCatSubmitting] = useState(false)
  const [catForm] = Form.useForm<CategoryFormValues>()

  const [entryModalVisible, setEntryModalVisible] = useState(false)
  const [editingEntry, setEditingEntry] = useState<PhoneEntry | null>(null)
  const [entrySubmitting, setEntrySubmitting] = useState(false)
  const [entryForm] = Form.useForm<EntryFormValues>()

  const { message } = App.useApp()

  const fetchCategories = useCallback(async () => {
    setCatLoading(true)
    try {
      const res = await phoneCategoryApi.list()
      setCategories(res.data)
    } catch {
      message.error('获取分类列表失败')
    } finally {
      setCatLoading(false)
    }
  }, [message])

  const fetchEntries = useCallback(async (categoryId: number) => {
    setEntryLoading(true)
    try {
      const res = await phoneEntryApi.list(categoryId)
      setEntries(res.data)
    } catch {
      message.error('获取条目列表失败')
    } finally {
      setEntryLoading(false)
    }
  }, [message])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  useEffect(() => {
    if (selectedCategory) {
      fetchEntries(selectedCategory.id)
    } else {
      setEntries([])
    }
  }, [selectedCategory, fetchEntries])

  const handleCatAdd = () => {
    setEditingCategory(null)
    catForm.resetFields()
    catForm.setFieldsValue({ sort_order: 0, icon: '' })
    setCatModalVisible(true)
  }

  const handleCatEdit = (record: PhoneCategory) => {
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
      await phoneCategoryApi.delete(id)
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
        await phoneCategoryApi.update(editingCategory.id, values)
        message.success('更新成功')
        if (selectedCategory?.id === editingCategory.id) {
          setSelectedCategory({ ...editingCategory, ...values })
        }
      } else {
        await phoneCategoryApi.create(values)
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

  const handleEntryAdd = () => {
    if (!selectedCategory) {
      message.warning('请先选择分类')
      return
    }
    setEditingEntry(null)
    entryForm.resetFields()
    entryForm.setFieldsValue({ sort_order: 0, remark: '' })
    setEntryModalVisible(true)
  }

  const handleEntryEdit = (record: PhoneEntry) => {
    setEditingEntry(record)
    entryForm.setFieldsValue({
      name: record.name,
      phone_number: record.phone_number,
      remark: record.remark,
      sort_order: record.sort_order,
    })
    setEntryModalVisible(true)
  }

  const handleEntryDelete = async (id: number) => {
    try {
      await phoneEntryApi.delete(id)
      message.success('删除成功')
      selectedCategory && fetchEntries(selectedCategory.id)
    } catch {
      message.error('删除失败')
    }
  }

  const handleEntrySubmit = async () => {
    if (!selectedCategory) return
    try {
      const values = await entryForm.validateFields()
      setEntrySubmitting(true)
      if (editingEntry) {
        await phoneEntryApi.update(editingEntry.id, values)
        message.success('更新成功')
      } else {
        await phoneEntryApi.create({ ...values, category_id: selectedCategory.id })
        message.success('创建成功')
      }
      setEntryModalVisible(false)
      fetchEntries(selectedCategory.id)
    } catch {
      // validation error
    } finally {
      setEntrySubmitting(false)
    }
  }

  const entryColumns: ColumnsType<PhoneEntry> = [
    { title: '名称', dataIndex: 'name', key: 'name', width: 100 },
    { title: '电话号码', dataIndex: 'phone_number', key: 'phone_number', width: 140 },
    { title: '备注', dataIndex: 'remark', key: 'remark', ellipsis: true },
    { title: '排序', dataIndex: 'sort_order', key: 'sort_order', width: 70 },
    {
      title: '操作',
      key: 'action',
      width: 140,
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEntryEdit(record)}>
            编辑
          </Button>
          <Popconfirm title="确定删除？" onConfirm={() => handleEntryDelete(record.id)}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <Row gutter={16}>
      <Col xs={24} md={6}>
        <Card
          title="分类"
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
              onClick={() => setSelectedCategory(cat)}
              actions={[
                <EditOutlined key="edit" onClick={(e) => { e.stopPropagation(); handleCatEdit(cat) }} />,
                <Popconfirm key="delete" title="确定删除？" onConfirm={(e) => { e?.stopPropagation(); handleCatDelete(cat.id) }}>
                  <DeleteOutlined onClick={(e) => e.stopPropagation()} />
                </Popconfirm>,
              ]}
            >
              <Text strong>{cat.icon ? `${cat.icon} ` : ''}{cat.name}</Text>
            </Card>
          ))}
        </Card>
      </Col>
      <Col xs={24} md={18}>
        <Card
          title={
            selectedCategory
              ? `${selectedCategory.name} - 条目列表`
              : '请选择左侧分类'
          }
          extra={
            selectedCategory && (
              <Button type="primary" size="small" icon={<PlusOutlined />} onClick={handleEntryAdd}>
                新增条目
              </Button>
            )
          }
        >
          <Table
            columns={entryColumns}
            dataSource={entries}
            rowKey="id"
            loading={entryLoading}
            pagination={false}
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
        title={editingEntry ? '编辑条目' : '新增条目'}
        open={entryModalVisible}
        onOk={handleEntrySubmit}
        onCancel={() => setEntryModalVisible(false)}
        confirmLoading={entrySubmitting}
        destroyOnClose
      >
        <Form form={entryForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label="名称" rules={[{ required: true, message: '请输入名称' }]}>
            <Input placeholder="请输入名称" />
          </Form.Item>
          <Form.Item name="phone_number" label="电话号码" rules={[{ required: true, message: '请输入电话号码' }]}>
            <Input placeholder="请输入电话号码" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注（可选）" />
          </Form.Item>
          <Form.Item name="sort_order" label="排序">
            <InputNumber style={{ width: '100%' }} min={0} placeholder="数字越小越靠前" />
          </Form.Item>
        </Form>
      </Modal>
    </Row>
  )
}
