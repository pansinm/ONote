import React from 'react';
import { render, screen } from '@testing-library/react';
import SessionDivider from '../SessionDivider';

jest.mock('../SessionDivider.module.scss', () => ({
  sessionDivider: 'session-divider',
  label: 'label',
}));

describe('SessionDivider', () => {
  it('应该渲染分界线组件', () => {
    render(<SessionDivider />);
    expect(screen.getByText('以下是新对话')).toBeInTheDocument();
  });

  it('应该有正确的类名', () => {
    const { container } = render(<SessionDivider />);
    expect(container.querySelector('.session-divider')).toBeInTheDocument();
    expect(container.querySelector('.label')).toBeInTheDocument();
  });
});
