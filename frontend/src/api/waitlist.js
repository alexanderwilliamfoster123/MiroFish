import service from './index'

// 加入等候名单
export const subscribeWaitlist = (email) => {
  return service.post('/api/waitlist/subscribe', { email })
}

// 获取订阅人数
export const getWaitlistCount = () => {
  return service.get('/api/waitlist/count')
}
