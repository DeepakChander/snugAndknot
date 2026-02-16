'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useChatStore } from '@/stores/chat-store'

const QUICK_REPLIES = [
  { label: 'Shipping question', text: 'I have a shipping question' },
  { label: 'Size help', text: 'I need help with sizing' },
  { label: 'Return request', text: 'I would like to request a return' },
  { label: 'Other', text: 'I have a question' },
] as const

export default function ChatWidget() {
  const {
    isOpen,
    messages,
    isTyping,
    unreadCount,
    openChat,
    closeChat,
    toggleChat,
    sendMessage,
  } = useChatStore()

  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom on new messages
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping, scrollToBottom])

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [isOpen])

  const handleSend = () => {
    const text = inputValue.trim()
    if (!text) return
    sendMessage(text)
    setInputValue('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleQuickReply = (text: string) => {
    sendMessage(text)
  }

  const formatTime = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      })
    } catch {
      return ''
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-45" style={{ zIndex: 45 }}>
      {/* Chat Window */}
      <div
        className={`absolute bottom-16 right-0 transition-all duration-400 ease-[var(--ease-loom-settle)] origin-bottom-right ${
          isOpen
            ? 'opacity-100 scale-100 pointer-events-auto'
            : 'opacity-0 scale-95 pointer-events-none'
        }`}
        role="dialog"
        aria-modal="false"
        aria-label="Live chat support"
        style={{ width: 380, height: 500 }}
      >
        <div className="w-full h-full glass-dark rounded-lg shadow-2xl flex flex-col overflow-hidden border border-burgundy/20">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-burgundy/20 shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-burgundy flex items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-gold)" strokeWidth="1.5">
                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                  </svg>
                </div>
                {/* Online indicator */}
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success-moss rounded-full border-2 border-noir" />
              </div>
              <div>
                <p className="text-sm font-medium text-gold-pale">Snug &amp; Knot Support</p>
                <p className="text-[10px] text-dust">Online now</p>
              </div>
            </div>
            <button
              onClick={closeChat}
              className="w-8 h-8 flex items-center justify-center rounded-full text-dust hover:text-gold-pale hover:bg-burgundy/30 transition-colors"
              aria-label="Close chat"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 no-scrollbar">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] px-3.5 py-2.5 rounded-lg text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-gold-pale/90 text-burgundy rounded-br-sm'
                      : 'bg-burgundy/50 text-gold-pale rounded-bl-sm'
                  }`}
                >
                  <p>{msg.text}</p>
                  <p
                    className={`text-[9px] mt-1 ${
                      msg.sender === 'user' ? 'text-burgundy/50' : 'text-dust/60'
                    }`}
                  >
                    {formatTime(msg.timestamp)}
                  </p>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-burgundy/50 px-4 py-3 rounded-lg rounded-bl-sm">
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-gold-pale/70 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-gold-pale/70 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-gold-pale/70 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies */}
          {messages.length <= 2 && (
            <div className="px-4 pb-2 flex flex-wrap gap-1.5 shrink-0">
              {QUICK_REPLIES.map((qr) => (
                <button
                  key={qr.label}
                  onClick={() => handleQuickReply(qr.text)}
                  className="px-3 py-1.5 text-[11px] font-medium text-gold-pale border border-gold/30 rounded-full hover:bg-gold/10 hover:border-gold/50 transition-colors"
                >
                  {qr.label}
                </button>
              ))}
            </div>
          )}

          {/* Input Area */}
          <div className="px-4 py-3 border-t border-burgundy/20 shrink-0">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                className="flex-1 px-3.5 py-2.5 bg-burgundy/20 border border-burgundy/30 rounded-full text-sm text-gold-pale placeholder:text-dust/50 focus:outline-none focus:border-gold/50 transition-colors"
              />
              <button
                onClick={handleSend}
                disabled={!inputValue.trim()}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-burgundy text-gold-pale hover:bg-burgundy-light disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
                aria-label="Send message"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <button
        onClick={toggleChat}
        className="relative w-14 h-14 rounded-full bg-burgundy text-gold-pale shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center justify-center chat-fab"
        aria-label={isOpen ? 'Close chat' : 'Open chat support'}
        style={{
          animation: isOpen ? 'none' : 'chat-breathe 3s ease-in-out infinite',
        }}
      >
        {/* Chat / Close Icon */}
        {isOpen ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
          </svg>
        )}

        {/* Notification Dot */}
        {!isOpen && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-gold text-burgundy-deep text-[10px] font-bold rounded-full flex items-center justify-center chat-notification-dot">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Inline Keyframe Styles */}
      <style jsx>{`
        @keyframes chat-breathe {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        .chat-notification-dot {
          animation: chat-dot-pulse 2s ease-in-out infinite;
        }

        @keyframes chat-dot-pulse {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(241, 225, 148, 0.5);
          }
          50% {
            transform: scale(1.1);
            box-shadow: 0 0 0 6px rgba(241, 225, 148, 0);
          }
        }
      `}</style>
    </div>
  )
}
