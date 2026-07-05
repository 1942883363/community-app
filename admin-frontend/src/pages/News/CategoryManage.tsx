import { useEffect, useState, useCallback } from 'react'
import { Table, Button, Modal, Form, Input, InputNumber, Select, Popconfirm, Space, App } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { categoryApi } from '../../api/news'
import type { Category } from '../../api/news'

interface CategoryFormValues {
  name: string
  sort_order: number
  parent_id?: number
}

export default function CategoryManage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [form] = Form.useForm<CategoryFormValues>()
  const { message } = App.useApp()

  const fetchCategories = useCallback(async () => {
    setLoading(true)
    try {
      const res = await categoryApi.list()
      setCategories(res.data)
    } catch {
      message.error('获取分类列表失败')
    } finally {
      setLoading(false)
    }
  }, [message])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const handleAdd = () => {
    setEditingCategory(null)
    form.resetFields()
    form.setFieldsValue({ sort_order: 0 })
    setModalVisible(true)
  }

  const handleEdit = (record: Category) => {
    setEditingCategory(record)
    form.setFieldsValue({
      name: record.name,
      sort_order: record.sort_order,
      parent_id: record.parent_id ?? undefined,
    })
    setModalVisible(true)
  }

  const handleDelete = async (id: number) => {
    try {
      await categoryApi.delete(id)
      message.success('删除成功')
      fetchCategories()
    } catch {
      message.error('删除失败')
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      setSubmitting(true)
      const data: Partial<Category> = {
        name: values.name,
        sort_order: values.sort_order,
        parent_id: values.parent_id ?? null,
      }
      if (editingCategory) {
        await categoryApi.update(editingCategory.id, data)
        message.success('更新成功')
      } else {
        await categoryApi.create(data)
        message.success('创建成功')
      }
      setModalVisible(false)
      fetchCategories()
    } catch {
      // validation error handled by antd
    } finally {
      setSubmitting(false)
    }
  }

  const parentOptions = categories
    .filter((c) => !c.parent_id)
    .map((c) => ({ label: c.name, value: c.id }))

  const columns: ColumnsType<Category> = [
    { title: '名称', dataIndex: 'name', key: 'name' },
    { title: '排序', dataIndex: 'sort_order', key: 'sort_order', width: 80 },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定删除该分类？"
            description="如有子分类，请先删除子分类"
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
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新增分类
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={categories}
        rowKey="id"
        loading={loading}
        defaultExpandAllRows
        pagination={false}
      />
      <Modal
        title={editingCategory ? '编辑分类' : '新增分类'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        confirmLoading={submitting}
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="name"
            label="分类名称"
            rules={[{ required: true, message: '请输入分类名称' }]}
          >
            <Input placeholder="请输入分类名称" />
          </Form.Item>
          <Form.Item name="parent_id" label="父分类">
            <Select
              allowClear
              placeholder="选择父分类（留空为顶级分类）"
              options={parentOptions}
            />
          </Form.Item>
          <Form.Item
            name="sort_order"
            label="排序"
            rules={[{ required: true, message: '请输入排序值' }]}
          >
            <InputNumber style={{ width: '100%' }} min={0} placeholder="数字越小越靠前" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
