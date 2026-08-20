// Auth Request Types
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface StaffRegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface StaffLoginRequest {
  email: string;
  password: string;
}

// Appointment Request Types
export interface CreateAppointmentRequest {
  therapyId: string;
  scheduledAt: string;
  notes?: string;
}

export interface UpdateAppointmentRequest {
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
}

// Response Types
export interface AuthResponse {
  agentId?: string;
  staffId?: string;
  email: string;
  name: string;
  token: string;
}

export interface AppointmentResponse {
  id: string;
  agentId: string;
  therapyId: string;
  scheduledAt: string;
  status: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AgentResponse {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  wellnessScore?: number;
  totalAppointments?: number;
  completedAppointments?: number;
  lastAppointmentAt?: string | null;
}

export interface ErrorResponse {
  error: string;
}
