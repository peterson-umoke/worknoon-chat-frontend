import { Conversation, User } from './types';

export function isConversationParticipant(conversation: Conversation, currentUser: User): boolean {
  return conversation.participants.some((participant) => participant._id === currentUser._id);
}

export function getConversationDisplayParticipant(
  conversation: Conversation,
  currentUser: User,
): User | undefined {
  if (!isConversationParticipant(conversation, currentUser)) {
    return conversation.participants.find((participant) => participant.role === 'customer');
  }

  return conversation.participants.find((participant) => participant._id !== currentUser._id);
}
