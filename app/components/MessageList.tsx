'use client';

import { useRef, useEffect } from 'react';
import { MessageBubble, type Message } from './MessageBubble';
import { LoadingIndicator } from './LoadingIndicator';
import { EmptyState } from './EmptyState';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  onSuggestionClick?: (text: string) => void;
}

export function MessageList({
  messages,
  isLoading,
  onSuggestionClick,
}: MessageListProps) {
  console.log('%c Line:15 🍢 messages', 'color:#fca650', messages);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (messages.length === 0 && !isLoading) {
    return <EmptyState onAction={onSuggestionClick} />;
  }

  return (
    <div className='w-full max-w-5xl mx-auto px-4 flex flex-col pb-32'>
      {/* Remove old card wrapper, just list messages */}
      {messages.map((message, index) => (
        <MessageBubble key={message.id} message={message} index={index} />
      ))}

      {isLoading && <LoadingIndicator />}

      <div ref={messagesEndRef} />
    </div>
  );
}
