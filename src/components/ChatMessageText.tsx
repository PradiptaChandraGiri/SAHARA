import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface ChatMessageTextProps {
  text: string
}

// Renders AI/user message text as formatted markdown (bold, italic,
// lists, links) instead of raw text. Deliberately restricts and styles
// elements safely so the AI's output renders cleanly within chat bubbles.
export default function ChatMessageText({ text }: ChatMessageTextProps) {
  if (!text) return null

  return (
    <div className="chat-markdown" style={{ lineHeight: 1.55 }}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          strong: ({ children }) => (
            <strong style={{ fontWeight: 700, color: 'inherit' }}>{children}</strong>
          ),
          em: ({ children }) => (
            <em style={{ fontStyle: 'italic', color: 'inherit' }}>{children}</em>
          ),
          ul: ({ children }) => (
            <ul style={{ paddingLeft: '1.25rem', margin: '6px 0', listStyleType: 'disc' }}>
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol style={{ paddingLeft: '1.25rem', margin: '6px 0', listStyleType: 'decimal' }}>
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li style={{ margin: '3px 0' }}>{children}</li>
          ),
          p: ({ children }) => (
            <p style={{ margin: '4px 0', lineHeight: 1.55 }} className="last:mb-0">
              {children}
            </p>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: 'underline', color: '#01575E', fontWeight: 600 }}
            >
              {children}
            </a>
          ),
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  )
}
