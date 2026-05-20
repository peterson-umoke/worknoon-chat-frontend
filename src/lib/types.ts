export type Role = 'admin' | 'agent' | 'customer' | 'designer' | 'merchant';

export interface User {
  _id: string;
  username: string;
  email: string;
  role: Role;
  avatar: string;
  isOnline: boolean;
  lastActive: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ConversationContext {
  productId: string;
  productName: string;
  productImage: string;
  productPrice: string;
  orderId: string;
}

export type ConversationType = 'customer-to-agent' | 'customer-to-designer' | 'customer-to-merchant' | 'general';

export interface Conversation {
  _id: string;
  participants: User[];
  type: ConversationType;
  context: ConversationContext;
  lastMessage: Message | null;
  unreadCount: Record<string, number>;
  createdAt: string;
  updatedAt: string;
}

export type FileType = 'text' | 'image' | 'document';

export interface Message {
  _id: string;
  conversationId: string;
  sender: User;
  content: string;
  fileType: FileType;
  isRead: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface AuthResponse {
  _id: string;
  username: string;
  email: string;
  role: Role;
  avatar: string;
  token: string;
}

export interface UploadResponse {
  url: string;
  fileName: string;
  fileType: FileType;
  size: number;
}

export interface RegisterInput {
  username: string;
  email: string;
  password: string;
  role?: Role;
  avatar?: string;
}

export interface LoginInput {
  emailOrUsername: string;
  password: string;
}

export interface ProfileUpdateInput {
  username?: string;
  email?: string;
  password?: string;
  role?: Role;
  avatar?: string;
}

export interface CreateConversationInput {
  participantIds?: string[];
  type?: ConversationType;
  context?: Partial<ConversationContext>;
}

export interface SendMessageInput {
  conversationId: string;
  content: string;
  fileType?: FileType;
}
