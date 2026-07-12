const api = require('../../utils/request')

Page({
  data: {
    tab: 'register',
    avatarUrl: '',
    nickname: '',
    phone: '',
    password: '',
    submitting: false,
    showLoginError: ''
  },

  onLoad() {},

  onSwitchTab(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({ tab, showLoginError: '', nickname: '', phone: '', password: '' })
  },

  onChooseAvatar(e) {
    const { avatarUrl } = e.detail
    this.setData({ avatarUrl })
  },

  onNicknameInput(e) {
    this.setData({ nickname: e.detail.value, showLoginError: '' })
  },

  onPhoneInput(e) {
    const { value } = e.detail
    const filtered = value.replace(/[^\d]/g, '')
    this.setData({ phone: filtered, showLoginError: '' })
  },

  onPasswordInput(e) {
    this.setData({ password: e.detail.value, showLoginError: '' })
  },

  onSubmit() {
    const { tab, nickname, phone, password } = this.data

    if (tab === 'register') {
      if (!nickname.trim()) {
        wx.showToast({ title: '请输入昵称', icon: 'none' })
        return
      }
      if (!phone || phone.length !== 11) {
        wx.showToast({ title: '请输入正确的11位手机号', icon: 'none' })
        return
      }
      if (!password || password.length < 6) {
        wx.showToast({ title: '密码至少6位', icon: 'none' })
        return
      }
      this.doRegister()
    } else {
      if (!phone || phone.length !== 11) {
        wx.showToast({ title: '请输入正确的11位手机号', icon: 'none' })
        return
      }
      if (!password) {
        wx.showToast({ title: '请输入密码', icon: 'none' })
        return
      }
      this.doLogin()
    }
  },

  doRegister() {
    const { avatarUrl, nickname, phone, password } = this.data

    this.setData({ submitting: true, showLoginError: '' })

    const submit = (avatarParam = '') => {
      const payload = {
        mode: 'register',
        nickname: nickname.trim(),
        phone: phone,
        password: password
      }
      if (avatarParam) payload.avatar = avatarParam

      api.put('/users/register', payload).then(() => {
        wx.showToast({ title: '注册成功', icon: 'success' })
        wx.removeStorageSync('login_skip')
        wx.setStorageSync('need_refresh_mine', true)
        setTimeout(() => wx.switchTab({ url: '/pages/mine/mine' }), 800)
      }).catch(err => {
        const msg = (err && err.message) ? err.message : '注册失败'
        if (err && err.code === 409) {
          this.setData({ showLoginError: msg, submitting: false })
          wx.showToast({ title: msg, icon: 'none' })
        } else if (err && err.code === 400) {
          this.setData({ showLoginError: msg, submitting: false })
          wx.showToast({ title: msg, icon: 'none' })
        } else {
          this.setData({ showLoginError: '连接服务器失败', submitting: false })
          wx.showToast({ title: '连接服务器失败', icon: 'none' })
        }
      })
    }

    if (avatarUrl && avatarUrl.startsWith('http://tmp/')) {
      wx.uploadFile({
        url: api.BASE_URL + '/upload/public',
        filePath: avatarUrl,
        name: 'file',
        header: { 'X-User-Id': api.getUserId() },
        success(res) {
          try {
            const data = JSON.parse(res.data)
            submit(data.code === 200 ? data.data.url : '')
          } catch (e) {
            submit('')
          }
        },
        fail(err) {
          console.error('头像上传失败', err)
          wx.showToast({ title: '头像上传失败', icon: 'none' })
          this.setData({ submitting: false })
        }
      })
    } else {
      submit(avatarUrl || undefined)
    }
  },

  doLogin() {
    const { phone, password } = this.data

    this.setData({ submitting: true, showLoginError: '' })

    const payload = {
      mode: 'login',
      phone: phone,
      password: password
    }

    api.post('/users/login', payload).then(() => {
      wx.showToast({ title: '登录成功', icon: 'success' })
      wx.removeStorageSync('login_skip')
      wx.setStorageSync('need_refresh_mine', true)
      setTimeout(() => wx.switchTab({ url: '/pages/mine/mine' }), 800)
    }).catch(err => {
      const msg = (err && err.message) ? err.message : '登录失败'
      if (err && err.code === 404) {
        this.setData({ showLoginError: '该手机号未注册，请先注册' })
        wx.showToast({ title: '该手机号未注册，请先注册', icon: 'none' })
      } else if (err && err.code === 400) {
        this.setData({ showLoginError: msg })
        wx.showToast({ title: msg, icon: 'none' })
      } else {
        this.setData({ showLoginError: '连接服务器失败' })
        wx.showToast({ title: '连接服务器失败', icon: 'none' })
      }
      this.setData({ submitting: false })
    })
  },

  onSkip() {
    wx.setStorageSync('login_skip', true)
    wx.switchTab({ url: '/pages/mine/mine' })
  }
})
