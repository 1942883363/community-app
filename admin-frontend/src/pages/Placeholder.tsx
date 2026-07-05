export default function PlaceholderPage({ title }: { title: string }) {
  return (
    <div style={{ textAlign: 'center', paddingTop: 60 }}>
      <h2>{title}</h2>
      <p style={{ color: '#999' }}>该页面正在开发中...</p>
    </div>
  )
}
