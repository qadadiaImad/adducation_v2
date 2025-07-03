import { User } from '@/stores/authStore'

class AuthService {
  private baseUrl: string
  private actualBackendUrl: string
  private isBackendAvailable: boolean = true

  constructor() {
    // Use the actual backend URL directly now that CORS is configured
    this.actualBackendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://m4o0sko4wscoc4g8kw880sok.37.27.220.218.sslip.io'
    this.baseUrl = this.actualBackendUrl
    
    // Skip connection check on server side
    if (typeof window !== 'undefined') {
      this.checkBackendConnection()
    }
  }
  
  private async checkBackendConnection() {
    console.log('Checking backend connection through proxy to:', this.actualBackendUrl)
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)
      
      // Since we're only running this on the client side now, we can use relative URLs
      console.log('Fetching from proxy URL:', this.baseUrl)
      
      const response = await fetch(this.baseUrl, {
        method: 'GET',
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      this.isBackendAvailable = response.ok
      console.log('Backend available:', this.isBackendAvailable)
    } catch (error) {
      console.error('Backend connection check failed:', error)
      this.isBackendAvailable = false
    }
  }

  async login(email: string, password: string) {
    try {
      console.log('Login attempt with:', { email, baseUrl: this.actualBackendUrl })
      console.log('Backend available status:', this.isBackendAvailable)
      
      if (!this.isBackendAvailable) {
        console.warn('Backend is not available, showing detailed error')
        return { 
          success: false, 
          message: `Backend server at ${this.actualBackendUrl} is not responding. Please check your connection or server status.` 
        }
      }
      
      // Try different endpoint variations to see which one works
      const endpoints = [
        '/api/auth/login',
        '/auth/login',
        '/login'
      ];
      
      let response = null;
      let data = null;
      let endpointUsed = '';
      
      for (const endpoint of endpoints) {
        const url = `${this.baseUrl}${endpoint}`;
        console.log(`Trying login endpoint: ${url}`);
        
        try {
          response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
          });
          
          console.log(`Endpoint ${endpoint} response status:`, response.status);
          
          if (response.status !== 404) {
            endpointUsed = endpoint;
            break;
          }
        } catch (err) {
          console.error(`Error with endpoint ${endpoint}:`, err);
        }
      }
      
      if (!response) {
        console.error('All login endpoints failed');
        return { success: false, message: 'Login failed. Could not connect to any endpoint.' };
      }
      
      try {
        data = await response.json();
        console.log(`Login response data from ${endpointUsed}:`, data);
      } catch (err) {
        console.error('Error parsing response JSON:', err);
        return { success: false, message: 'Login failed. Invalid response from server.' };
      }
      
      // Check if response is ok and either data.success is true or we have tokens in the response
      if (response.ok && (data.success || data.accessToken || data.token)) {
        console.log('Login successful, setting token and user');
        this.setToken(data.accessToken || data.token);
        this.setCurrentUser(data.user);
        return { success: true, user: data.user, token: data.accessToken || data.token };
      }
      
      console.log('Login failed:', data.message || 'Invalid credentials');
      return { success: false, message: data.message || 'Invalid credentials' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Login failed. Please check your connection.' };
    }
  }

  async register(userData: any) {
    try {
      console.log('Register attempt with:', { userData, baseUrl: this.actualBackendUrl })
      
      const url = `${this.baseUrl}/api/auth/register`;
      console.log(`Registering at: ${url}`);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })

      console.log('Register response status:', response.status)
      const data = await response.json()
      console.log('Register response data:', data)
      
      if (response.ok && data.success) {
        console.log('Registration successful, setting token and user')
        this.setToken(data.accessToken)
        this.setCurrentUser(data.user)
        return { success: true, user: data.user, token: data.accessToken }
      }
      
      console.log('Registration failed:', data.message || 'Registration failed')
      return { success: false, message: data.message || 'Registration failed' }
    } catch (error) {
      console.error('Registration error:', error)
      return { success: false, message: 'Registration failed. Please check your connection.' }
    }
  }

  async updateProfile(userId: string, data: Partial<User>) {
    try {
      const token = this.getToken();
      if (!token) return null;

      const url = `${this.baseUrl}/api/users/${userId}`;
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to update profile')
      }

      const updatedUser = await response.json()
      this.setCurrentUser(updatedUser)
      return updatedUser
    } catch (error) {
      console.error('Profile update error:', error)
      return null
    }
  }

  async getUserProgress(userId: string) {
    try {
      const token = this.getToken();
      if (!token) return null;

      // Try different endpoint patterns for user progress
      const endpoints = [
        `/api/users/${userId}/progress`,
        `/users/${userId}/progress`,
        `/user/${userId}/progress`
      ];
      
      let response = null;
      let endpointUsed = '';
      
      for (const endpoint of endpoints) {
        const url = `${this.baseUrl}${endpoint}`;
        console.log(`Trying user progress endpoint: ${url}`);
        
        try {
          response = await fetch(url, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`
            },
          });
          
          console.log(`Endpoint ${endpoint} response status:`, response.status);
          
          if (response.status !== 404) {
            endpointUsed = endpoint;
            break;
          }
        } catch (err) {
          console.error(`Error with endpoint ${endpoint}:`, err);
        }
      }

      if (!response || !response.ok) {
        throw new Error('Failed to get user progress')
      }

      const data = await response.json();
      console.log(`User progress data from ${endpointUsed}:`, data);
      return data;
    } catch (error) {
      console.error('Get user progress error:', error)
      return null
    }
  }

  async updateUserProgress(userId: string, progressData: any) {
    try {
      const token = this.getToken();
      if (!token) return null;

      // Try different endpoint patterns for user progress
      const endpoints = [
        `/api/users/${userId}/progress`,
        `/users/${userId}/progress`,
        `/user/${userId}/progress`
      ];
      
      let response = null;
      let endpointUsed = '';
      
      // Format the progress data according to what the backend expects
      // This is to fix the 400 Bad Request errors
      const formattedData = {
        ...progressData,
        // Ensure these fields match what the backend expects
        userId: userId,
        user_id: userId, // Try both formats
        // Add any missing required fields with default values
        xp: progressData.xp || progressData.total_xp || 0,
        level: progressData.level || progressData.current_level || 1,
        streak: progressData.streak || progressData.current_streak || 0
      };
      
      console.log('Sending formatted progress data:', formattedData);
      
      for (const endpoint of endpoints) {
        const url = `${this.baseUrl}${endpoint}`;
        console.log(`Trying update progress endpoint: ${url}`);
        
        try {
          response = await fetch(url, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(formattedData),
          });
          
          console.log(`Endpoint ${endpoint} response status:`, response.status);
          
          if (response.status !== 404) {
            endpointUsed = endpoint;
            
            // If we get a 400 error, try with a POST request instead
            if (response.status === 400) {
              console.log('Trying POST instead of PUT for endpoint:', endpoint);
              response = await fetch(url, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formattedData),
              });
              console.log(`POST request status:`, response.status);
            }
            
            break;
          }
        } catch (err) {
          console.error(`Error with endpoint ${endpoint}:`, err);
        }
      }

      // Handle non-OK responses more gracefully
      if (!response) {
        throw new Error('Failed to update user progress - no valid endpoint found')
      }
      
      if (!response.ok) {
        // For 400 errors, log the response body to help debug
        try {
          const errorBody = await response.text();
          console.error('Error response body:', errorBody);
        } catch (e) {}
        
        // Return a partial success to prevent cascading errors
        console.warn('Progress update failed but continuing execution');
        return { partial: true, message: 'Progress update failed but continuing' };
      }

      const data = await response.json();
      console.log(`Update progress data from ${endpointUsed}:`, data);
      return data;
    } catch (error) {
      console.error('Update user progress error:', error)
      // Return a partial success to prevent cascading errors
      return { partial: true, message: 'Progress update failed but continuing' };
    }
  }

  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('current_user')
    }
  }

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token')
    }
    return null
  }

  getCurrentUser(): User | null {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('current_user')
      return userStr ? JSON.parse(userStr) : null
    }
    return null
  }

  private setToken(token: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token)
    }
  }

  private setCurrentUser(user: User) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('current_user', JSON.stringify(user))
    }
  }
}

export const authService = new AuthService()