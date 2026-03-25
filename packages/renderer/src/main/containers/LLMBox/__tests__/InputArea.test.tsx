import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import InputArea, { type InputAreaProps, type Quote } from '../InputArea';

// Mock Fluent UI 组件
jest.mock('@fluentui/react-components', () => ({
  Button: ({ children, disabled, onClick, icon, className }: any) => (
    <button
      data-testid={className}
      disabled={disabled}
      onClick={onClick}
      className={className}
    >
      {icon}
      {children}
    </button>
  ),
}));

// Mock Fluent UI 图标
jest.mock('@fluentui/react-icons', () => ({
  SendRegular: () => <span data-testid="send-icon">Send</span>,
  DismissRegular: () => <span data-testid="dismiss-icon">×</span>,
  ArrowClockwiseRegular: () => <span data-testid="loading-icon">Loading</span>,
}));

// Mock 样式文件
jest.mock('../InputArea.module.scss', () => ({
  inputArea: 'input-area',
  quoteArea: 'quote-area',
  quoteContent: 'quote-content',
  quoteSource: 'quote-source',
  quoteText: 'quote-text',
  quoteClose: 'quote-close',
  textarea: 'textarea',
  toolbar: 'toolbar',
  sendButton: 'send-button',
}));

const defaultProps: InputAreaProps = {
  value: '',
  onChange: jest.fn(),
  onSend: jest.fn(),
};

describe('InputArea', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // 1. 基础渲染测试
  describe('基础渲染', () => {
    it('应该正常渲染组件', () => {
      render(<InputArea {...defaultProps} />);
      expect(screen.getByRole('textbox')).toBeInTheDocument();
      expect(screen.getByTestId('send-button')).toBeInTheDocument();
    });

    it('应该渲染输入框和发送按钮', () => {
      render(<InputArea {...defaultProps} />);
      expect(screen.getByRole('textbox')).toBeInTheDocument();
      expect(screen.getByTestId('send-button')).toBeInTheDocument();
    });

    it('应该应用自定义 className 和 style', () => {
      const customClassName = 'custom-class';
      const customStyle = { backgroundColor: 'red' };
      const { container } = render(
        <InputArea {...defaultProps} className={customClassName} style={customStyle} />,
      );
      const wrapper = container.querySelector('.input-area');
      expect(wrapper).toHaveClass(customClassName);
      expect(wrapper).toHaveStyle({ backgroundColor: 'red' });
    });
  });

  // 2. 受控组件测试
  describe('受控组件行为', () => {
    it('应该正确显示 value 属性', () => {
      render(<InputArea {...defaultProps} value="测试内容" />);
      expect(screen.getByRole('textbox')).toHaveValue('测试内容');
    });

    it('应该在输入时触发 onChange', () => {
      const handleChange = jest.fn();
      render(<InputArea {...defaultProps} onChange={handleChange} />);

      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: '新内容' } });

      expect(handleChange).toHaveBeenCalledWith('新内容');
    });

    it('应该更新输入内容', () => {
      const { rerender } = render(<InputArea {...defaultProps} value="初始值" />);
      expect(screen.getByRole('textbox')).toHaveValue('初始值');

      rerender(<InputArea {...defaultProps} value="更新值" />);
      expect(screen.getByRole('textbox')).toHaveValue('更新值');
    });
  });

  // 3. 发送功能测试
  describe('发送功能', () => {
    it('应该在点击发送按钮时触发 onSend', () => {
      const handleSend = jest.fn();
      render(<InputArea {...defaultProps} value="有内容" onSend={handleSend} />);

      const sendButton = screen.getByTestId('send-button');
      fireEvent.click(sendButton);

      expect(handleSend).toHaveBeenCalled();
    });

    it('应该在输入为空时禁用发送按钮', () => {
      render(<InputArea {...defaultProps} value="" />);
      expect(screen.getByTestId('send-button')).toBeDisabled();
    });

    it('应该在有内容时启用发送按钮', () => {
      render(<InputArea {...defaultProps} value="有内容" />);
      expect(screen.getByTestId('send-button')).not.toBeDisabled();
    });

    it('应该在 disabled 属性为 true 时禁用发送按钮', () => {
      render(<InputArea {...defaultProps} value="有内容" disabled={true} />);
      expect(screen.getByTestId('send-button')).toBeDisabled();
    });

    it('应该在 loading 状态时禁用发送按钮并显示加载图标', () => {
      render(<InputArea {...defaultProps} value="有内容" loading={true} />);
      expect(screen.getByTestId('send-button')).toBeDisabled();
      expect(screen.getByTestId('loading-icon')).toBeInTheDocument();
    });

    it('应该在非 loading 状态时显示发送图标', () => {
      render(<InputArea {...defaultProps} value="有内容" loading={false} />);
      expect(screen.getByTestId('send-icon')).toBeInTheDocument();
    });
  });

  // 4. 引用功能测试
  describe('引用功能', () => {
    const mockQuote: Quote = {
      id: '1',
      content: '这是一段引用内容',
      source: '来源文件',
    };

    it('应该显示引用内容', () => {
      render(<InputArea {...defaultProps} quote={mockQuote} />);
      expect(screen.getByText('这是一段引用内容')).toBeInTheDocument();
      expect(screen.getByText('来源文件')).toBeInTheDocument();
    });

    it('应该在点击关闭按钮时触发 onClearQuote', () => {
      const handleClearQuote = jest.fn();
      render(
        <InputArea {...defaultProps} quote={mockQuote} onClearQuote={handleClearQuote} />,
      );

      const closeButton = screen.getByLabelText('清除引用');
      fireEvent.click(closeButton);

      expect(handleClearQuote).toHaveBeenCalled();
    });

    it('应该在没有引用时不显示引用区域', () => {
      render(<InputArea {...defaultProps} />);
      expect(screen.queryByText('来源文件')).not.toBeInTheDocument();
    });

    it('应该截断过长的引用内容', () => {
      const longQuote: Quote = {
        id: '1',
        content: 'a'.repeat(150),
      };
      render(<InputArea {...defaultProps} quote={longQuote} />);
      expect(screen.getByText(/a+\.\.\./)).toBeInTheDocument();
    });
  });

  // 5. 键盘快捷键测试
  describe('键盘快捷键', () => {
    it('应该在按下 Ctrl + Enter 时触发发送', () => {
      const handleSend = jest.fn();
      render(<InputArea {...defaultProps} value="有内容" onSend={handleSend} />);

      const textarea = screen.getByRole('textbox');
      fireEvent.keyDown(textarea, { key: 'Enter', ctrlKey: true });

      expect(handleSend).toHaveBeenCalled();
    });

    it('应该在按下 Cmd + Enter 时触发发送', () => {
      const handleSend = jest.fn();
      render(<InputArea {...defaultProps} value="有内容" onSend={handleSend} />);

      const textarea = screen.getByRole('textbox');
      fireEvent.keyDown(textarea, { key: 'Enter', metaKey: true });

      expect(handleSend).toHaveBeenCalled();
    });

    it('应该在单独按下 Enter 时不触发发送', () => {
      const handleSend = jest.fn();
      render(<InputArea {...defaultProps} value="有内容" onSend={handleSend} />);

      const textarea = screen.getByRole('textbox');
      fireEvent.keyDown(textarea, { key: 'Enter' });

      expect(handleSend).not.toHaveBeenCalled();
    });

    it('应该在输入为空时不触发发送', () => {
      const handleSend = jest.fn();
      render(<InputArea {...defaultProps} value="" onSend={handleSend} />);

      const textarea = screen.getByRole('textbox');
      fireEvent.keyDown(textarea, { key: 'Enter', ctrlKey: true });

      expect(handleSend).not.toHaveBeenCalled();
    });
  });

  // 6. 属性测试
  describe('属性', () => {
    it('应该正确显示 placeholder', () => {
      render(<InputArea {...defaultProps} placeholder="请输入消息" />);
      expect(screen.getByPlaceholderText('请输入消息')).toBeInTheDocument();
    });

    it('应该在 disabled 为 true 时禁用输入框', () => {
      render(<InputArea {...defaultProps} disabled={true} />);
      expect(screen.getByRole('textbox')).toBeDisabled();
    });

    it('应该设置正确的行数', () => {
      render(<InputArea {...defaultProps} minRows={5} />);
      expect(screen.getByRole('textbox')).toHaveAttribute('rows', '5');
    });

    it('应该使用默认的 placeholder', () => {
      render(<InputArea {...defaultProps} />);
      expect(screen.getByPlaceholderText('输入消息...')).toBeInTheDocument();
    });
  });

  // 7. 样式测试
  describe('样式', () => {
    it('应该正确应用 className 到根元素', () => {
      const customClass = 'my-custom-class';
      const { container } = render(
        <InputArea {...defaultProps} className={customClass} />,
      );
      expect(container.querySelector('.input-area')).toHaveClass('input-area');
      expect(container.querySelector('.input-area')).toHaveClass(customClass);
    });

    it('应该正确应用 style 到根元素', () => {
      const customStyle = { padding: '10px', margin: '5px' };
      const { container } = render(<InputArea {...defaultProps} style={customStyle} />);
      expect(container.querySelector('.input-area')).toHaveStyle(customStyle);
    });
  });
});
