import React from 'react';
import { render, screen } from '@testing-library/react';
import Header, { type HeaderProps, type AgentState } from '../Header';

// Mock 样式文件
jest.mock('../Header.module.scss', () => ({
  header: 'header',
  titleContainer: 'title-container',
  icon: 'icon',
  iconAnimating: 'icon-animating',
  title: 'title',
}));

const defaultProps: HeaderProps = {};

describe('Header', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // 1. 基础渲染测试
  describe('基础渲染', () => {
    it('应该正常渲染组件', () => {
      render(<Header {...defaultProps} />);
      expect(screen.getByText('Agent')).toBeInTheDocument();
    });

    it('应该渲染默认的 Agent 图标', () => {
      const { container } = render(<Header {...defaultProps} />);
      const icon = container.querySelector('.bi-robot');
      expect(icon).toBeInTheDocument();
    });

    it('应该渲染标题', () => {
      render(<Header {...defaultProps} title="自定义标题" />);
      expect(screen.getByText('自定义标题')).toBeInTheDocument();
    });

    it('应该有正确的 aria-label', () => {
      const { container } = render(<Header {...defaultProps} />);
      const icon = container.querySelector('[aria-label="Agent icon"]');
      expect(icon).toBeInTheDocument();
    });
  });

  // 2. 属性测试
  describe('属性', () => {
    it('应该使用默认标题 "Agent"', () => {
      render(<Header {...defaultProps} />);
      expect(screen.getByText('Agent')).toBeInTheDocument();
    });

    it('应该渲染自定义标题', () => {
      render(<Header {...defaultProps} title="AI Assistant" />);
      expect(screen.getByText('AI Assistant')).toBeInTheDocument();
    });

    it('应该应用自定义 className', () => {
      const customClassName = 'custom-header-class';
      const { container } = render(<Header {...defaultProps} className={customClassName} />);
      const header = container.querySelector('.header');
      expect(header).toHaveClass(customClassName);
    });

    it('应该应用自定义 style', () => {
      const customStyle = { backgroundColor: '#f0f0f0', padding: '20px' };
      const { container } = render(<Header {...defaultProps} style={customStyle} />);
      const header = container.querySelector('.header');
      expect(header).toHaveStyle(customStyle);
    });

    it('应该渲染自定义图标', () => {
      const customIcon = <i className="bi bi-star" data-testid="custom-icon" />;
      const { container } = render(<Header {...defaultProps} icon={customIcon} />);
      expect(container.querySelector('.bi-robot')).not.toBeInTheDocument();
      expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    });

    it('应该同时应用 className 和 style', () => {
      const customClassName = 'my-class';
      const customStyle = { color: 'red' };
      const { container } = render(
        <Header {...defaultProps} className={customClassName} style={customStyle} />
      );
      const header = container.querySelector('.header');
      expect(header).toHaveClass(customClassName);
      expect(header).toHaveStyle({ color: 'red' });
    });
  });

  // 3. Agent 状态测试
  describe('Agent 状态', () => {
    it('应该在 idle 状态下不添加动画类', () => {
      const { container } = render(<Header {...defaultProps} agentState="idle" />);
      const icon = container.querySelector('.icon');
      expect(icon).not.toHaveClass('icon-animating');
    });

    it('应该在 thinking 状态下添加动画类', () => {
      const { container } = render(<Header {...defaultProps} agentState="thinking" />);
      const icon = container.querySelector('.icon');
      expect(icon).toHaveClass('icon-animating');
    });

    it('应该在 executing 状态下添加动画类', () => {
      const { container } = render(<Header {...defaultProps} agentState="executing" />);
      const icon = container.querySelector('.icon');
      expect(icon).toHaveClass('icon-animating');
    });

    it('应该在未指定 agentState 时默认为 idle', () => {
      const { container } = render(<Header {...defaultProps} />);
      const icon = container.querySelector('.icon');
      expect(icon).not.toHaveClass('icon-animating');
    });

    it('应该在所有工作状态下应用动画', () => {
      const workingStates: AgentState[] = ['thinking', 'executing'];

      workingStates.forEach((state) => {
        const { container } = render(<Header {...defaultProps} agentState={state} />);
        const icon = container.querySelector('.icon');
        expect(icon).toHaveClass('icon-animating');
      });
    });
  });

  // 4. 自定义图标测试
  describe('自定义图标', () => {
    it('应该优先使用自定义图标而不是默认图标', () => {
      const customIcon = <span data-testid="custom-icon">Custom</span>;
      render(<Header {...defaultProps} icon={customIcon} />);
      expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    });

    it('自定义图标应该不受 agentState 影响', () => {
      const customIcon = <span data-testid="custom-icon">Custom</span>;
      render(<Header {...defaultProps} icon={customIcon} agentState="thinking" />);
      expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    });

    it('应该在无自定义图标时使用默认 Bootstrap Icons', () => {
      const { container } = render(<Header {...defaultProps} />);
      expect(container.querySelector('.bi')).toBeInTheDocument();
      expect(container.querySelector('.bi-robot')).toBeInTheDocument();
    });
  });

  // 5. 组合测试
  describe('组合场景', () => {
    it('应该同时支持自定义标题、样式和工作状态', () => {
      const customStyle = { border: '2px solid red' };
      const { container } = render(
        <Header
          title="Working Agent"
          agentState="thinking"
          style={customStyle}
          className="working"
        />
      );
      expect(screen.getByText('Working Agent')).toBeInTheDocument();
      const header = container.querySelector('.header');
      expect(header).toHaveClass('working');
      expect(header).toHaveStyle(customStyle);
      expect(container.querySelector('.icon')).toHaveClass('icon-animating');
    });

    it('应该支持自定义图标和自定义样式', () => {
      const customIcon = <i data-testid="star-icon">★</i>;
      const customStyle = { backgroundColor: 'yellow' };
      const { container } = render(
        <Header icon={customIcon} style={customStyle} title="Star Agent" />
      );
      expect(screen.getByTestId('star-icon')).toBeInTheDocument();
      expect(container.querySelector('.header')).toHaveStyle(customStyle);
    });

    it('应该在 idle 状态下正确渲染所有自定义属性', () => {
      const { container } = render(
        <Header
          title="Idle Agent"
          agentState="idle"
          className="idle-class"
          style={{ opacity: 0.7 }}
        />
      );
      expect(screen.getByText('Idle Agent')).toBeInTheDocument();
      const header = container.querySelector('.header');
      expect(header).toHaveClass('idle-class');
      expect(header).toHaveStyle({ opacity: 0.7 });
      expect(container.querySelector('.icon')).not.toHaveClass('icon-animating');
    });
  });

  // 6. DOM 结构测试
  describe('DOM 结构', () => {
    it('应该有正确的类名结构', () => {
      const { container } = render(<Header {...defaultProps} />);
      expect(container.querySelector('.header')).toBeInTheDocument();
      expect(container.querySelector('.title-container')).toBeInTheDocument();
      expect(container.querySelector('.title')).toBeInTheDocument();
    });

    it('应该在 titleContainer 中包含图标和标题', () => {
      const { container } = render(<Header {...defaultProps} title="Test" />);
      const titleContainer = container.querySelector('.title-container');
      expect(titleContainer).toContainElement(container.querySelector('.icon'));
      expect(titleContainer).toContainElement(screen.getByText('Test'));
    });
  });
});
