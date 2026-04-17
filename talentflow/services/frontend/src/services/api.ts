import axios from 'axios'

// Auth / User Service client
export const userClient = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
})

// Job Service client
export const jobClient = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT to every request
const attachAuth = (client: typeof userClient) => {
  client.interceptors.request.use((config) => {
    const token = useAuthStore.getState().accessToken
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      // Forward user ID for backend authorization
      config.headers['X-User-Id'] = useAuthStore.getState().user?.id ?? ''
    }
    return config
  })
}

// Lazy import to avoid circular deps
import { useAuthStore } from '../store/authStore'
attachAuth(userClient)
attachAuth(jobClient)

// ── Auth API ──────────────────────────────────────────────────────────────────
export const authApi = {
  register: (data: RegisterRequest) =>
    userClient.post<UserResponse>('/auth/register', data),

  login: (data: LoginRequest) =>
    userClient.post<TokenResponse>('/auth/login', data),

  logout: () =>
    userClient.post<{ message: string }>('/auth/logout'),

  getMe: () =>
    userClient.get<UserResponse>('/users/me'),

  updateMe: (data: UpdateProfileRequest) =>
    userClient.put<UserResponse>('/users/me', data),
}

// ── Jobs API ──────────────────────────────────────────────────────────────────
export const jobsApi = {
  list: (params?: JobFilters) =>
    jobClient.get<PagedResponse<Job>>('/jobs', { params }),

  get: (id: string) =>
    jobClient.get<Job>(`/jobs/${id}`),

  create: (data: CreateJobRequest) =>
    jobClient.post<Job>('/jobs', data),

  update: (id: string, data: Partial<CreateJobRequest>) =>
    jobClient.put<Job>(`/jobs/${id}`, data),

  delete: (id: string) =>
    jobClient.delete(`/jobs/${id}`),

  apply: (jobId: string, coverLetter?: string) =>
    jobClient.post<Application>(`/jobs/${jobId}/apply`, { coverLetter }),

  getMyApplications: () =>
    jobClient.get<PagedResponse<Application>>('/jobs/my-applications'),
}

// ── Types ──────────────────────────────────────────────────────────────────────
export interface RegisterRequest {
  email: string
  username: string
  password: string
  full_name?: string
  role: 'job_seeker' | 'employer'
}

export interface LoginRequest {
  email: string
  password: string
}

export interface UpdateProfileRequest {
  full_name?: string
  username?: string
}

export interface UserResponse {
  id: string
  email: string
  username: string
  full_name?: string
  role: 'job_seeker' | 'employer' | 'admin'
  is_active: boolean
  is_verified: boolean
  created_at: string
}

export interface TokenResponse {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
}

export interface Job {
  id: string
  title: string
  description: string
  company: string
  location: string
  jobType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'REMOTE' | 'INTERNSHIP'
  status: 'OPEN' | 'CLOSED' | 'DRAFT'
  salaryMin?: number
  salaryMax?: number
  postedByUserId: string
  createdAt: string
}

export interface CreateJobRequest {
  title: string
  description: string
  company: string
  location: string
  jobType: Job['jobType']
  salaryMin?: number
  salaryMax?: number
}

export interface Application {
  id: string
  jobId: string
  applicantUserId: string
  status: string
  coverLetter?: string
  appliedAt: string
}

export interface JobFilters {
  keyword?: string
  location?: string
  jobType?: string
  status?: string
  page?: number
  size?: number
}

export interface PagedResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}
