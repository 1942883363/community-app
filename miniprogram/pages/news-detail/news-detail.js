const api = require('../../utils/request')
const { resolveImage } = api

Page({
  data: {
    newsId: '',
    news: {},
    isLiked: false
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ newsId: options.id })
      this.loadDetail(options.id)
      this.checkLikeStatus(options.id)
    }
  },

  onShareAppMessage() {
    const { news } = this.data
    return {
      title: news.title || '社区资讯',
      path: `/pages/news-detail/news-detail?id=${this.data.newsId}`
    }
  },

  loadDetail(id) {
    api.get(`/news/${id}`).then(res => {
      const news = {
        id: res.id,
        title: res.title,
        content: res.content || '',
        cover: resolveImage(res.cover_image || ''),
        views: res.view_count || 0,
        likes: res.like_count || 0,
        created_at: this.formatTime(res.created_at)
      }

      this.setData({ news })
    }).catch(err => {
      wx.showToast({ title: '加载失败', icon: 'none' })
    })
  },

  checkLikeStatus(id) {
    api.get(`/news/${id}/like-status`).then(res => {
      this.setData({ isLiked: res.liked })
    }).catch(() => {})
  },

  onToggleLike() {
    const { newsId, news, isLiked } = this.data

    api.post(`/news/${newsId}/like`).then(res => {
      this.setData({
        isLiked: res.liked,
        'news.likes': res.like_count
      })
      wx.showToast({ title: res.liked ? '点赞成功' : '已取消点赞', icon: 'none' })
    }).catch(err => {
      wx.showToast({ title: '操作失败', icon: 'none' })
    })
  },

  formatTime(dateStr) {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }
})
