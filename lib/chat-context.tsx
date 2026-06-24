'use client'

import { type ChatUIMessage } from '@/components/chat/types'
import { type ReactNode } from 'react'
import { Chat } from '@ai-sdk/react'
import { DataPart } from '@/ai/messages/data-parts'
import { DataUIPart } from 'ai'
import { createContext, useContext, useState } from 'react'
import { useDataStateMapper } from '@/app/state'
import { mutate } from 'swr'
import { toast } from 'sonner'

interface ChatContextValue {
  chat: Chat<ChatUIMessage>
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined)

export function ChatProvider({ children }: { children: ReactNode }) {
  const mapDataToState = useDataStateMapper()

  const [{ chat }] = useState(() => {
    let handleData = mapDataToState
    const instance = new Chat<ChatUIMessage>({
      onToolCall: () => mutate('/api/auth/info'),
      onData: (data: DataUIPart<DataPart>) => handleData(data),
      onError: (error) => {
        toast.error(`Communication error with the AI: ${error.message}`)
        console.error('Error sending message:', error)
      },
    })
    return {
      chat: instance,
      update: (fn: typeof mapDataToState) => {
        handleData = fn
      },
    }
  })

  chat.update(mapDataToState)

  return (
    <ChatContext.Provider value={{ chat: chat.chat }}>
      {children}
    </ChatContext.Provider>
  )
}

export function useSharedChatContext() {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useSharedChatContext must be used within a ChatProvider')
  }
  return context
}
