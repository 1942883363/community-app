import { Card, Row, Col, Statistic } from 'antd'
import {
  FileTextOutlined,
  MessageOutlined,
  PhoneOutlined,
  CalendarOutlined,
} from '@ant-design/icons'

export default function DashboardPage() {
  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>欢迎回来</h2>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="资讯总数" value={0} prefix={<FileTextOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="反馈总数" value={0} prefix={<MessageOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="电话簿条目" value={0} prefix={<PhoneOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="活动总数" value={0} prefix={<CalendarOutlined />} />
          </Card>
        </Col>
      </Row>
    </div>
  )
}
