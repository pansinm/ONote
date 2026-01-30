import classNames from 'classnames';
import type { FC, RefObject } from 'react';
import React, { useRef, useEffect, useCallback, useState } from 'react';
import type { Message as MessageType } from '../types/IMessage';
import IMessage from './Message';
import styles from './MessageList.module.scss';

export interface MessageListProps {
  messages: MessageType[];
  className?: string;
  style?: React.CSSProperties;
  scrollBehavior?: 'smooth' | 'auto';
  onMessageVisible?: (messageId: string) => void;
}

export interface MessageListRef {
  scrollToBottom: (behavior?: ScrollBehavior) => void;
  scrollToMessage: (messageId: string, behavior?: ScrollBehavior) => void;
  getScrollPosition: () => number;
  getScrollHeight: () => number;
}

const MessageList: FC<MessageListProps & React.RefAttributes<MessageListRef>> =
  React.forwardRef<MessageListRef, MessageListProps>((props, ref) => {
    const {
      messages,
      className,
      style,
      scrollBehavior = 'smooth',
      onMessageVisible,
    } = props;

    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
    const prevMessagesLengthRef = useRef(messages.length);

    const scrollToBottom = useCallback(
      (behavior: ScrollBehavior = scrollBehavior) => {
        if (containerRef.current) {
          containerRef.current.scrollTo({
            top: containerRef.current.scrollHeight,
            behavior,
          });
        }
      },
      [scrollBehavior],
    );

    const scrollToMessage = useCallback(
      (messageId: string, behavior: ScrollBehavior = scrollBehavior) => {
        const element = containerRef.current?.querySelector(
          `[data-message-id="${messageId}"]`,
        );
        if (element) {
          element.scrollIntoView({ behavior, block: 'center' });
        }
      },
      [scrollBehavior],
    );

    const getScrollPosition = useCallback(() => {
      return containerRef.current?.scrollTop ?? 0;
    }, []);

    const getScrollHeight = useCallback(() => {
      return containerRef.current?.scrollHeight ?? 0;
    }, []);

    const handleScroll = useCallback(() => {
      if (!containerRef.current || !contentRef.current) return;

      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      const isAtBottom = Math.abs(scrollHeight - scrollTop - clientHeight) < 50;
      setShouldAutoScroll(isAtBottom);
    }, []);

    useEffect(() => {
      if (typeof ref === 'function') {
        ref({
          scrollToBottom,
          scrollToMessage,
          getScrollPosition,
          getScrollHeight,
        });
      } else if (ref) {
        ref.current = {
          scrollToBottom,
          scrollToMessage,
          getScrollPosition,
          getScrollHeight,
        };
      }
    }, [
      ref,
      scrollToBottom,
      scrollToMessage,
      getScrollPosition,
      getScrollHeight,
    ]);

    useEffect(() => {
      const hasNewMessages = messages.length > prevMessagesLengthRef.current;
      prevMessagesLengthRef.current = messages.length;

      if (hasNewMessages && shouldAutoScroll) {
        scrollToBottom('auto');
      }
    }, [messages.length, shouldAutoScroll, scrollToBottom]);

    useEffect(() => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const messageId = entry.target.getAttribute('data-message-id');
              if (messageId && onMessageVisible) {
                onMessageVisible(messageId);
              }
            }
          });
        },
        { threshold: 0.1 },
      );

      const messageElements =
        containerRef.current?.querySelectorAll('[data-message-id]');
      messageElements?.forEach((el) => observer.observe(el));

      return () => observer.disconnect();
    }, [messages, onMessageVisible]);

    return (
      <div
        ref={containerRef}
        className={classNames(styles.container, className)}
        style={style}
        onScroll={handleScroll}
        data-testid="message-list"
      >
        <div ref={contentRef} className={styles.content}>
          {messages.map((message) => (
            <div
              key={message.id}
              data-message-id={message.id}
              className={styles.messageWrapper}
            >
              <IMessage message={message} />
            </div>
          ))}
        </div>
      </div>
    );
  });

MessageList.displayName = 'MessageList';

export default MessageList;
