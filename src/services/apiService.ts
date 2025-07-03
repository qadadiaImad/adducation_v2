class ApiService {
  private baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://m4o0sko4wscoc4g8kw880sok.37.27.220.218.sslip.io'

  private getAuthHeaders() {
    const token = localStorage.getItem('auth_token')
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    }
  }

  async get(endpoint: string) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: this.getAuthHeaders(),
      })
      return await response.json()
    } catch (error) {
      console.error('API GET error:', error)
      throw error
    }
  }

  async post(endpoint: string, data: any) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      })
      return await response.json()
    } catch (error) {
      console.error('API POST error:', error)
      throw error
    }
  }

  async put(endpoint: string, data: any) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      })
      return await response.json()
    } catch (error) {
      console.error('API PUT error:', error)
      throw error
    }
  }

  async delete(endpoint: string) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      })
      return await response.json()
    } catch (error) {
      console.error('API DELETE error:', error)
      throw error
    }
  }

  // Learning Content endpoints
  async getLearningContent(params?: any) {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : ''
    return this.get(`/learning-content${queryString}`)
  }

  async getLearningContentById(id: string) {
    return this.get(`/learning-content/${id}`)
  }

  // Interview endpoints
  async getInterviewQuestions(params: any) {
    const queryString = new URLSearchParams(params).toString()
    return this.get(`/interviews/questions?${queryString}`)
  }

  async submitInterviewResponse(data: any) {
    return this.post('/interviews/responses', data)
  }

  // User Progress endpoints
  async addXpToUser(userId: string, xpAmount: number) {
    return this.post(`/users/${userId}/xp`, { xp: xpAmount })
  }
}

export const apiService = new ApiService()