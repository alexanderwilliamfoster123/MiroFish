import service, { requestWithRetry } from './index'

/**
 * Get the seeded-page roster (deduplicated, with suggested groups)
 */
export const getRoster = () => {
  return requestWithRetry(() => service.get('/api/ad-reaction/roster'), 3, 1000)
}

/**
 * Run an ad reaction simulation
 * @param {Object} data - { headline, caption?, pages: [names], personas_per_page? }
 */
export const simulateReaction = (data) => {
  return service.post('/api/ad-reaction/simulate', data)
}
