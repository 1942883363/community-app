import { useState } from 'react'
import { Layout, Menu, Button, theme } from 'antd'
import {
  DashboardOutlined,
  FileTextOutlined,
  MessageOutlined,
  PhoneOutlined,
  CalendarOutlined,
  ShopOutlined,
  UserOutlined,
  PictureOutlined,
  LogoutOutlined,
} from '@ant-design/icons'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../stores/auth'

const { Header, Sider, Content } = Layout

const menuItems = [
  {
    key: '/',
    icon: <DashboardOutlined />,
    label: '仪表盘',
  },
  {
    key: '/news',
    icon: <FileTextOutlined />,
    label: '资讯管理',
    children: [
      { key: '/news/categories', icon: null, label: '分类管理' },
      { key: '/news/list', icon: null, label: '资讯列表' },
    ],
  },
  {
    key: '/feedback',
    icon: <MessageOutlined />,
    label: '反馈管理',
  },
  {
    key: '/phone',
    icon: <PhoneOutlined />,
    label: '电话簿管理',
  },
  {
    key: '/events',
    icon: <CalendarOutlined />,
    label: '活动管理',
  },
  {
    key: '/business',
    icon: <ShopOutlined />,
    label: '商家管理',
  },
  {
    key: '/users',
    icon: <UserOutlined />,
    label: '用户管理',
  },
  {
    key: '/reviews',
    icon: <PictureOutlined />,
    label: '图片审核',
  },
]

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()
  const { token: themeToken } = theme.useToken()

  const handleMenuClick = (info: { key: string }) => {
    navigate(info.key)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const selectedKey = location.pathname === '/' ? '/' : location.pathname

  let openKey: string | undefined
  if (location.pathname.startsWith('/news')) {
    openKey = '/news'
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: collapsed ? 16 : 20,
            fontWeight: 'bold',
            whiteSpace: 'nowrap',
          }}
        >
          {collapsed ? '后台' : '管理后台'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          defaultOpenKeys={openKey ? [openKey] : undefined}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            background: themeToken.colorBgContainer,
            padding: '0 24px',
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <span>{user?.nickname || user?.username || '管理员'}</span>
          <Button type="text" icon={<LogoutOutlined />} onClick={handleLogout}>
            退出
          </Button>
        </Header>
        <Content style={{ margin: 24 }}>
          <div
            style={{
              background: themeToken.colorBgContainer,
              borderRadius: themeToken.borderRadiusLG,
              padding: 24,
              minHeight: 360,
            }}
          >
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  )
}
