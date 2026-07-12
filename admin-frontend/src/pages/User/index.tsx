import { useEffect, useState, useCallback } from 'react'
import { Table, Button, Input, Modal, Form, Space, Popconfirm, App, Tag, Upload, Image } from 'antd'
import { DeleteOutlined, EditOutlined, SearchOutlined, PlusOutlined } from '@ant-design/icons'
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table'
import type { FilterValue } from 'antd/es/table/interface'
import type { UploadFile } from 'antd/es/upload/interface'
import { userApi } from '../../api/user'
import type { User } from '../../api/user'
import { uploadFile } from '../../api/request'

interface UserFormValues {
  nickname: string
  phone: string
  password: string
}

export default function UserManage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [keyword, setKeyword] = useState('')

  const [modalVisible, setModalVisible] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [form] = Form.useForm<UserFormValues>()
  const [avatarFile, setAvatarFile] = useState<UploadFile | null>(null)
  const [avatarUrl, setAvatarUrl] = useState('')

  const { message } = App.useApp()

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const res = await userApi.list({ page, page_size: pageSize, keyword: keyword || undefined })
      setUsers(res.data.items)
      setTotal(res.data.total)
    } catch {
      message.error('获取用户列表失败')
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, keyword, message])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleTableChange = (
    pagination: TablePaginationConfig,
    _filters: Record<string, FilterValue | null>
  ) => {
    if (pagination.current) setPage(pagination.current)
    if (pagination.pageSize) setPageSize(pagination.pageSize)
  }

  const handleSearch = (value: string) => {
    setKeyword(value)
    setPage(1)
  }

  const handleEdit = (record: User) => {
    setEditingUser(record)
    setAvatarFile(null)
    setAvatarUrl(record.avatar || '')
    form.setFieldsValue({
      nickname: record.nickname,
      phone: record.phone,
      password: '',
    })
    setModalVisible(true)
  }

  const handleDelete = async (id: number) => {
    try {
      await userApi.delete(id)
      message.success('删除成功')
      fetchUsers()
    } catch {
      message.error('删除失败')
    }
  }

  const handleSubmit = async () => {
    if (!editingUser) return
    try {
      const values = await form.validateFields()
      setSubmitting(true)

      let uploadedAvatarUrl = avatarUrl
      if (avatarFile?.originFileObj) {
        try {
          const res = await uploadFile(avatarFile.originFileObj as File)
          uploadedAvatarUrl = res.data.url
        } catch {
          message.error('头像上传失败')
          return
        }
      }

      const data: Partial<User> & { password?: string } = {
        nickname: values.nickname,
        phone: values.phone,
        avatar: uploadedAvatarUrl,
      }
      if (values.password && values.password.trim()) {
        data.password = values.password.trim()
      }

      await userApi.update(editingUser.id, data)
      message.success('更新成功')
      setModalVisible(false)
      fetchUsers()
    } catch {
      // validation error
    } finally {
      setSubmitting(false)
    }
  }

  const columns: ColumnsType<User> = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 70 },
    { title: 'OpenID', dataIndex: 'openid', key: 'openid', width: 200, ellipsis: true },
    {
      title: '头像',
      dataIndex: 'avatar',
      key: 'avatar',
      width: 80,
      render: (url: string) =>
        url ? <Image src={url} width={40} height={40} style={{ borderRadius: 20, objectFit: 'cover' }} /> : '-',
    },
    { title: '昵称', dataIndex: 'nickname', key: 'nickname', width: 120, ellipsis: true },
    { title: '手机号', dataIndex: 'phone', key: 'phone', width: 130 },
    {
      title: '注册时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 170,
    },
    {
      title: '最后活跃',
      dataIndex: 'updated_at',
      key: 'updated_at',
      width: 170,
    },
    {
      title: '操作',
      key: 'action',
      width: 140,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm title="确定删除该用户？" onConfirm={() => handleDelete(record.id)}>
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
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <Input.Search
          placeholder="搜索昵称或OpenID"
          allowClear
          style={{ width: 300 }}
          enterButton={<><SearchOutlined /> 搜索</>}
          onSearch={handleSearch}
        />
      </div>
      <Table
        columns={columns}
        dataSource={users}
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
        title="编辑用户"
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        confirmLoading={submitting}
        destroyOnClose
        width={480}
      >
        {editingUser && (
          <div style={{ marginBottom: 16 }}>
            <Tag color="blue">OpenID: {editingUser.openid}</Tag>
          </div>
        )}
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item label="头像">
            <Upload
              listType="picture-card"
              maxCount={1}
              showUploadList={{ showPreviewIcon: false }}
              beforeUpload={(file) => {
                setAvatarFile({ uid: '-1', name: file.name, status: 'done', originFileObj: file })
                return false
              }}
              onRemove={() => {
                setAvatarFile(null)
                setAvatarUrl('')
              }}
              fileList={
                avatarUrl && !avatarFile
                  ? [{ uid: '-1', name: 'avatar', status: 'done', url: avatarUrl }]
                  : avatarFile
                    ? [avatarFile]
                    : []
              }
            >
              {avatarUrl || avatarFile ? null : (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>上传</div>
                </div>
              )}
            </Upload>
          </Form.Item>
          <Form.Item name="nickname" label="昵称">
            <Input placeholder="请输入昵称" />
          </Form.Item>
          <Form.Item name="phone" label="手机号">
            <Input placeholder="请输入手机号" />
          </Form.Item>
          <Form.Item name="password" label="新密码" extra="留空则不修改密码，输入新密码需至少6位">
            <Input.Password placeholder="留空不修改，输入则重置密码" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
