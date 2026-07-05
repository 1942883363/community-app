const api = require('../../utils/request')

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
      const item = res.data || res
      const news = {
        id: item.ID || item.id,
        title: item.title,
        content: item.content || '',
        cover: item.cover_image || item.cover || '',
        source: item.source || '',
        views: item.view_count || item.views || 0,
        likes: item.like_count || item.likes || 0,
        created_at: this.formatTime(item.created_at || item.publish_time)
      }

      if (!news.content && item.content_html) {
        news.content = item.content_html
      }

      this.setData({ news })
    }).catch(err => {
      wx.showToast({ title: '加载失败', icon: 'none' })
    })
  },

  checkLikeStatus(id) {
    const likedIds = wx.getStorageSync('liked_news_ids') || []
    const isLiked = likedIds.indexOf(Number(id)) !== -1
    this.setData({ isLiked })
  },

  onToggleLike() {
    const { newsId, news, isLiked } = this.data
    const likedIds = wx.getStorageSync('liked_news_ids') || []

    if (isLiked) {
      const idx = likedIds.indexOf(Number(newsId))
      if (idx > -1) likedIds.splice(idx, 1)
      this.setData({
        isLiked: false,
        'news.likes': Math.max(0, (news.likes || 0) - 1)
      })
      wx.showToast({ title: '已取消点赞', icon: 'none' })
    } else {
      likedIds.push(Number(newsId))
      this.setData({
        isLiked: true,
        'news.likes': (news.likes || 0) + 1
      })
      wx.showToast({ title: '点赞成功', icon: 'none' })
    }

    wx.setStorageSync('liked_news_ids', likedIds)
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
