import {
  User,
  AuthResponse,
  Conversation,
  Message,
  UploadResponse,
  RegisterInput,
  LoginInput,
  ProfileUpdateInput,
  CreateConversationInput,
  SendMessageInput,
} from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

function authHeaders(token: string): RequestInit {
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
}

// Auth
export async function login(input: LoginInput): Promise<AuthResponse> {
  return fetchApi<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function register(input: RegisterInput): Promise<AuthResponse> {
  return fetchApi<AuthResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function getProfile(token: string): Promise<User> {
  return fetchApi<User>('/api/auth/profile', authHeaders(token));
}

export async function updateProfile(token: string, data: ProfileUpdateInput): Promise<AuthResponse> {
  return fetchApi<AuthResponse>('/api/auth/profile', {
    method: 'PUT',
    ...authHeaders(token),
    body: JSON.stringify(data),
  });
}

export async function getUsers(token: string): Promise<User[]> {
  return fetchApi<User[]>('/api/auth/users', authHeaders(token));
}

// Conversations
export async function createConversation(
  token: string,
  input: CreateConversationInput,
): Promise<Conversation> {
  return fetchApi<Conversation>('/api/conversations', {
    method: 'POST',
    ...authHeaders(token),
    body: JSON.stringify(input),
  });
}

export async function getConversations(token: string): Promise<Conversation[]> {
  return fetchApi<Conversation[]>('/api/conversations', authHeaders(token));
}

export async function getConversationById(token: string, id: string): Promise<Conversation> {
  return fetchApi<Conversation>(`/api/conversations/${id}`, authHeaders(token));
}

export async function deleteConversation(token: string, id: string): Promise<{ message: string }> {
  return fetchApi<{ message: string }>(`/api/conversations/${id}`, {
    method: 'DELETE',
    ...authHeaders(token),
  });
}

// Messages
export async function getMessages(token: string, conversationId: string): Promise<Message[]> {
  return fetchApi<Message[]>(`/api/messages/${conversationId}`, authHeaders(token));
}

export async function sendMessage(
  token: string,
  input: SendMessageInput,
): Promise<Message> {
  return fetchApi<Message>('/api/messages', {
    method: 'POST',
    ...authHeaders(token),
    body: JSON.stringify(input),
  });
}

export async function markAsRead(
  token: string,
  conversationId: string,
): Promise<{ message: string }> {
  return fetchApi<{ message: string }>(`/api/messages/${conversationId}/read`, {
    method: 'PUT',
    ...authHeaders(token),
  });
}

// Upload
export async function uploadFile(token: string, file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE}/api/upload`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Upload failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}
