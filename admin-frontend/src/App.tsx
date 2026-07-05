import { Routes, Route, Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from './stores/auth'
import MainLayout from './components/Layout'
import LoginPage from './pages/Login'
import DashboardPage from './pages/Dashboard'
import CategoryManage from './pages/News/CategoryManage'
import NewsList from './pages/News/NewsList'
import NewsEdit from './pages/News/NewsEdit'
import FeedbackManage from './pages/Feedback'
import PhoneManage from './pages/Phone'
import EventManage from './pages/Event'
import BusinessManage from './pages/Business'

function AuthGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <AuthGuard>
            <MainLayout />
          </AuthGuard>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="news/categories" element={<CategoryManage />} />
        <Route path="news/list" element={<NewsList />} />
        <Route path="news/edit" element={<NewsEdit />} />
        <Route path="news/edit/:id" element={<NewsEdit />} />
        <Route path="feedback" element={<FeedbackManage />} />
        <Route path="phone" element={<PhoneManage />} />
        <Route path="events" element={<EventManage />} />
        <Route path="business" element={<BusinessManage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
