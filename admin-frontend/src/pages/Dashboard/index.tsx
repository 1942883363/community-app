import { useEffect, useState } from 'react'
import { Card, Row, Col, Statistic } from 'antd'
import {
  FileTextOutlined,
  MessageOutlined,
  PhoneOutlined,
  CalendarOutlined,
  ShopOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { getStats } from '../../api/dashboard'
import type { DashboardStats } from '../../api/dashboard'

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    news_count: 0,
    feedback_count: 0,
    phone_count: 0,
    event_count: 0,
    business_count: 0,
    user_count: 0,
  })

  useEffect(() => {
    getStats().then((res) => {
      setStats(res.data)
    }).catch(() => {})
  }, [])

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>数据概览</h2>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic title="资讯总数" value={stats.news_count} prefix={<FileTextOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic title="反馈总数" value={stats.feedback_count} prefix={<MessageOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic title="电话簿条目" value={stats.phone_count} prefix={<PhoneOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic title="活动总数" value={stats.event_count} prefix={<CalendarOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic title="周边商家" value={stats.business_count} prefix={<ShopOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic title="用户数" value={stats.user_count} prefix={<UserOutlined />} />
          </Card>
        </Col>
      </Row>
    </div>
  )
}
