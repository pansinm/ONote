import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LLMBox from './LLMBox';
import { Message } from './types';

// Mock the useLLMChat hook
jest.mock('./useLLMChat', () => ({
  useLLMChat: () => ({
    messages: [
      {
        id: '1',
        content: 'Hello!',
        role: 'user' as const,
        timestamp: new Date('2024-01-01T00:00:00Z'),
      },
      {
        id: '2',
        content: 'Hi there! How can I help you?',
        role: 'assistant' as const,
        timestamp: new Date('2024-01-01T00:00:05Z'),
      },
    ],
    isLoading: false,
    error: null,
    sendMessage: jest.fn(),
    clearMessages: jest.fn(),
  }),
}));

describe('LLMBox', () => {
  it('renders chat messages correctly', () => {
    render(
      <LLMBox onSendMessage={jest.fn()} messages={[]} isLoading={false} />,
    );

    // Check if user message is rendered
    expect(screen.getByText('Hello!')).toBeInTheDocument();

    // Check if assistant message is rendered
    expect(
      screen.getByText('Hi there! How can I help you?'),
    ).toBeInTheDocument();
  });

  it('shows loading indicator when isLoading is true', () => {
    render(<LLMBox onSendMessage={jest.fn()} messages={[]} isLoading={true} />);

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('calls onSendMessage when sending a message', async () => {
    const mockSendMessage = jest.fn();
    render(
      <LLMBox
        onSendMessage={mockSendMessage}
        messages={[]}
        isLoading={false}
      />,
    );

    const input = screen.getByPlaceholderText(
      '输入消息... (Enter发送，Shift+Enter换行)',
    );
    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      expect(mockSendMessage).toHaveBeenCalledWith('Test message', undefined);
    });
  });
});
