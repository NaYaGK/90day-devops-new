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

  it('should render BackToTop button and handle click', () => {
    const scrollToMock = vi.fn();
    window.scrollTo = scrollToMock;
    
    render(<App />);
    
    const btn = screen.getByLabelText('Back to top');
    expect(btn).toBeDefined();
    
    fireEvent.click(btn);
    expect(scrollToMock).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });

  it('should render Font size cycle button and handle font size cycling', () => {
    localStorage.removeItem('devops90_font_size');
    
    render(<App />);
    
    const fontBtn = screen.getByTitle('Adjust Font Size');
    expect(fontBtn).toBeDefined();
    expect(fontBtn.textContent).toContain('Aa');
    
    // Cycle to lg (Large) -> Aa⁺
    fireEvent.click(fontBtn);
    expect(fontBtn.textContent).toContain('Aa⁺');
    expect(localStorage.getItem('devops90_font_size')).toBe('lg');
    
    // Cycle to xl (Extra Large) -> Aa++
    fireEvent.click(fontBtn);
    expect(fontBtn.textContent).toContain('Aa++');
    expect(localStorage.getItem('devops90_font_size')).toBe('xl');

    // Cycle to sm (Small) -> Aa⁻
    fireEvent.click(fontBtn);
    expect(fontBtn.textContent).toContain('Aa⁻');
    expect(localStorage.getItem('devops90_font_size')).toBe('sm');

    // Cycle back to md (Normal) -> Aa
    fireEvent.click(fontBtn);
    expect(fontBtn.textContent).toContain('Aa');
    expect(localStorage.getItem('devops90_font_size')).toBe('md');
  });
});
