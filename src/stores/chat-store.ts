'use client'

import { create } from 'zustand'
import type { ChatMessage } from '@/types'

interface ChatStore {
  isOpen: boolean
  messages: ChatMessage[]
  isTyping: boolean
  unreadCount: number
  openChat: () => void
  closeChat: () => void
  toggleChat: () => void
  sendMessage: (text: string) => void
}

const BOT_REPLIES: Record<string, string> = {
  'shipping': 'We offer free standard shipping on orders over $150. Standard delivery takes 3-5 business days, and express shipping is 1-2 business days for $12.',
  'size': 'You can find our detailed size guide on each product page. Click the "Size Guide" link near the size selector. If you\'re between sizes, we recommend sizing up for a relaxed fit.',
  'return': 'We accept returns within 30 days of delivery. Items must be unworn with original tags. Visit your Account → Returns to start a return. Refunds are processed within 5-7 business days.',
  'default': 'Thank you for reaching out! Our team typically responds within a few hours. For immediate help, you can check our FAQ page or email us at hello@snugandknot.com.',
}

function getBotReply(text: string): string {
  const lower = text.toLowerCase()
  if (lower.includes('ship') || lower.includes('deliver')) return BOT_REPLIES.shipping
  if (lower.includes('size') || lower.includes('fit')) return BOT_REPLIES.size
  if (lower.includes('return') || lower.includes('refund')) return BOT_REPLIES.return
  return BOT_REPLIES.default
}

export const useChatStore = create<ChatStore>((set, get) => ({
  isOpen: false,
  messages: [
    {
      id: 'welcome',
      sender: 'bot',
      text: 'Welcome to Snug & Knot! How can we help you today?',
      timestamp: new Date().toISOString(),
    },
  ],
  isTyping: false,
  unreadCount: 0,

  openChat: () => set({ isOpen: true, unreadCount: 0 }),
  closeChat: () => set({ isOpen: false }),
  toggleChat: () => {
    const isOpen = !get().isOpen
    set({ isOpen, unreadCount: isOpen ? 0 : get().unreadCount })
  },

  sendMessage: (text) => {
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toISOString(),
    }
    set({ messages: [...get().messages, userMsg], isTyping: true })

    setTimeout(() => {
      const botMsg: ChatMessage = {
        id: `msg-${Date.now()}-bot`,
        sender: 'bot',
        text: getBotReply(text),
        timestamp: new Date().toISOString(),
      }
      set({
        messages: [...get().messages, botMsg],
        isTyping: false,
        unreadCount: get().isOpen ? 0 : get().unreadCount + 1,
      })
    }, 1500)
  },
}))
