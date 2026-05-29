import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';

// Mock canvas-confetti
vi.mock('canvas-confetti', () => ({
  default: vi.fn(),
}));

describe('App component rendering and routing tests', () => {
  it('should render the app header and brand name', () => {
    render(<App />);
    expect(screen.getByText('DEV')).toBeDefined();
    expect(screen.getByText('OPS')).toBeDefined();
    expect(screen.getAllByText('v4')[0]).toBeDefined();
  });

  it('should render primary tabs', () => {
    render(<App />);
    expect(screen.getByText('☑ Roadmap')).toBeDefined();
    expect(screen.getByText('⊞ Kanban')).toBeDefined();
    expect(screen.getByText('◎ Focus')).toBeDefined();
    expect(screen.getByText('⌨ Labs')).toBeDefined();
  });

  it('should switch view when clicking tabs', () => {
    render(<App />);
    const kanbanTab = screen.getByText('⊞ Kanban');
    fireEvent.click(kanbanTab);
    expect(screen.getByText(/Day Progress Kanban/i)).toBeDefined();
  });

  it('should display the roadmap flow toggle and show/hide the flow elements', () => {
    render(<App />);
    
    // Toggle button should exist
    const toggleBtn = screen.getByText(/Roadmap Architecture Flow/i);
    expect(toggleBtn).toBeDefined();

    // Two elements should be visible initially (one in flow chart, one in filters)
    expect(screen.getAllByText('Foundations & Culture').length).toBe(2);

    // Clicking toggle button should collapse/hide the flow
    fireEvent.click(toggleBtn);
    // Only the filter button remains
    expect(screen.getAllByText('Foundations & Culture').length).toBe(1);

    // Clicking toggle button again should show the flow again
    fireEvent.click(toggleBtn);
    expect(screen.getAllByText('Foundations & Culture').length).toBe(2);
  });

  it('should allow filtering phases by clicking nodes in the flowchart', () => {
    render(<App />);
    
    // Click on Phase 1 node (first element is the node, second is the fpill button)
    const phaseNodes = screen.getAllByText('Foundations & Culture');
    fireEvent.click(phaseNodes[0]);

    // Verify clear filter bar is rendered
    expect(screen.getByText(/Clear Filter & Show All/i)).toBeDefined();

    // Click clear filter button
    const clearBtn = screen.getByText(/Clear Filter & Show All/i);
    fireEvent.click(clearBtn);
    expect(screen.queryByText(/Clear Filter & Show All/i)).toBeNull();
  });
});


