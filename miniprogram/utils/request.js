const { BASE_URL } = require('./config')

const getUserId = () => {
  let userId = wx.getStorageSync('user_id')
  if (!userId) {
    userId = 'mp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    wx.setStorageSync('user_id', userId)
  }
  return userId
}

const request = (url, method = 'GET', data = {}) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: BASE_URL + url,
      method,
      data,
      header: {
        'Content-Type': 'application/json',
        'X-User-Id': getUserId()
      },
      success(res) {
        if (res.statusCode === 200 && res.data.code === 200) {
          resolve(res.data.data)
        } else {
          reject(res.data)
        }
      },
      fail(err) {
        wx.showToast({ title: '网络请求失败', icon: 'none' })
        reject(err)
      }
    })
  })
}

const get = (url, params) => request(url, 'GET', params)

const post = (url, data) => request(url, 'POST', data)

const put = (url, data) => request(url, 'PUT', data)

const del = (url) => request(url, 'DELETE')

const upload = (url, filePath, formData = {}) => {
  return new Promise((resolve, reject) => {
    wx.uploadFile({
      url: BASE_URL + url,
      filePath,
      name: 'file',
      formData,
      header: {
        'X-User-Id': getUserId()
      },
      success(res) {
        const data = JSON.parse(res.data)
        if (data.code === 200) {
          resolve(data.data)
        } else {
          reject(data)
        }
      },
      fail(err) {
        wx.showToast({ title: '上传失败', icon: 'none' })
        reject(err)
      }
    })
  })
}

const getUserIdStatic = getUserId

module.exports = {
  get,
  post,
  put,
  del,
  upload,
  getUserId: getUserIdStatic
}
