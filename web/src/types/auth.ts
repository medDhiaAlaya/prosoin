// Type definitions for authentication
export interface LoginCredentials {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  user: User
  message?: string
}

export interface User {
  id: string
  email: string
  name?: string
  role?: string
  createdAt?: string
  updatedAt?: string
}

export interface AuthError {
  message: string
  code?: string
  status?: number
}
