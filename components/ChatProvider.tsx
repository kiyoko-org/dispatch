import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Message {
	id: string;
	text: string;
	timestamp: string;
	isOwn: boolean;
	status: 'sending' | 'sent' | 'delivered' | 'read';
}

export interface ChatPreview {
	id: string;
	phoneNumber: string;
	lastMessage: string;
	timestamp: string;
	unreadCount: number;
	isEmergency?: boolean;
}

interface ChatContextType {
	chats: ChatPreview[];
	messages: { [phoneNumber: string]: Message[] };
	addMessage: (phoneNumber: string, message: Omit<Message, 'id'>, isEmergency?: boolean) => void;
	getMessages: (phoneNumber: string) => Message[];
	markAsRead: (phoneNumber: string) => void;
	updateMessageStatus: (phoneNumber: string, messageId: string, status: Message['status']) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChatContext = () => {
	const context = useContext(ChatContext);
	if (!context) {
		throw new Error('useChatContext must be used within a ChatProvider');
	}
	return context;
};

interface ChatProviderProps {
	children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
	const [chats, setChats] = useState<ChatPreview[]>([]);
	const [messages, setMessages] = useState<{ [phoneNumber: string]: Message[] }>({});

	const addMessage = (phoneNumber: string, message: Omit<Message, 'id'>, isEmergency?: boolean) => {
		const newMessage: Message = {
			...message,
			id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
		};

		// Add message to messages
		setMessages(prev => ({
			...prev,
			[phoneNumber]: [...(prev[phoneNumber] || []), newMessage]
		}));

		// Update or create chat preview
		setChats(prev => {
			const existingChatIndex = prev.findIndex(chat => chat.phoneNumber === phoneNumber);
			const chatPreview: ChatPreview = {
				id: phoneNumber,
				phoneNumber,
				lastMessage: message.text,
				timestamp: message.timestamp,
				unreadCount: message.isOwn ? 0 : 1,
				isEmergency: isEmergency || false
			};

			if (existingChatIndex >= 0) {
				const updatedChats = [...prev];
				const existingChat = updatedChats[existingChatIndex];
				updatedChats[existingChatIndex] = {
					...chatPreview,
					unreadCount: message.isOwn ? 0 : existingChat.unreadCount + 1
				};
				// Move to top
				updatedChats.unshift(updatedChats.splice(existingChatIndex, 1)[0]);
				return updatedChats;
			} else {
				return [chatPreview, ...prev];
			}
		});

		// Simulate message status updates for own messages
		if (message.isOwn && message.status === 'sending') {
			setTimeout(() => {
				updateMessageStatus(phoneNumber, newMessage.id, 'sent');
			}, 1000);
			
			setTimeout(() => {
				updateMessageStatus(phoneNumber, newMessage.id, 'delivered');
			}, 2000);
		}
	};

	const getMessages = (phoneNumber: string): Message[] => {
		return messages[phoneNumber] || [];
	};

	const markAsRead = (phoneNumber: string) => {
		setChats(prev =>
			prev.map(chat =>
				chat.phoneNumber === phoneNumber
					? { ...chat, unreadCount: 0 }
					: chat
			)
		);
	};

	const updateMessageStatus = (phoneNumber: string, messageId: string, status: Message['status']) => {
		setMessages(prev => ({
			...prev,
			[phoneNumber]: (prev[phoneNumber] || []).map(msg =>
				msg.id === messageId ? { ...msg, status } : msg
			)
		}));
	};

	const value: ChatContextType = {
		chats,
		messages,
		addMessage,
		getMessages,
		markAsRead,
		updateMessageStatus
	};

	return (
		<ChatContext.Provider value={value}>
			{children}
		</ChatContext.Provider>
	);
};
