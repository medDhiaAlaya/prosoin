// Authentication service for handling login/logout operations
class AuthService {
  private baseURL: string
  private token: string | null = null

  constructor() {
    // Replace with your actual backend URL
    this.baseURL = import.meta.env.VITE_API_URL || "http://localhost:5001/api/v1/users"

    // Check for existing token in localStorage on initialization
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("authToken")
    }
  }

  /**
   * Login user with email and password
   */
  async login(email: string, password: string): Promise<{ token: string; user: any }> {
    try {
      const response = await fetch(`${this.baseURL}/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Login failed: ${response.status}`)
      }

      const data = await response.json()

      // Store token in localStorage and instance
      if (data.token) {
        this.token = data.token
        if (typeof window !== "undefined") {
          localStorage.setItem("authToken", data.token)
        }
      }

      return data
    } catch (error) {
      console.error("Login error:", error)
      throw error
    }
  }

  /**
   * Logout user and clear stored token
   */
  async logout(): Promise<void> {
  this.token = null;

  if (typeof window !== "undefined") {
    localStorage.removeItem("authToken");
  }
}

  /**
   * Get current auth token
   */
  getToken(): string | null {
    return this.token
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.token
  }

  /**
   * Get user profile (example protected endpoint)
   */
  async getUserProfile(): Promise<any> {
    if (!this.token) {
      throw new Error("No authentication token available")
    }

    try {
      const response = await fetch(`${this.baseURL}/auth/profile`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired or invalid
          this.logout()
          throw new Error("Session expired. Please login again.")
        }
        throw new Error(`Failed to fetch profile: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Get profile error:", error)
      throw error
    }
  }

  /**
   * Make authenticated API requests
   */
  async authenticatedRequest(url: string, options: RequestInit = {}): Promise<Response> {
    if (!this.token) {
      throw new Error("No authentication token available")
    }

    const headers = {
      Authorization: `Bearer ${this.token}`,
      "Content-Type": "application/json",
      ...options.headers,
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (response.status === 401) {
      // Token expired or invalid
      this.logout()
      throw new Error("Session expired. Please login again.")
    }

    return response
  }
}

// Export singleton instance
export const authService = new AuthService()

// Export the class for testing or multiple instances if needed
export { AuthService }
