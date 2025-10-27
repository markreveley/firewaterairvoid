import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@/test/utils';
import { ParentItemSelector } from './ParentItemSelector';
import type { Item } from '@/types';

describe('ParentItemSelector', () => {
  const mockItems: Item[] = [
    {
      id: '1',
      title: 'Fire Task',
      type: 'fire',
      tags: [],
      createdAt: new Date(),
      priority: 0,
      completed: false,
    },
    {
      id: '2',
      title: 'Water Article',
      type: 'water',
      tags: [],
      createdAt: new Date(),
      priority: 0,
      completed: false,
    },
    {
      id: '3',
      title: 'Air Analysis',
      type: 'air',
      tags: [],
      createdAt: new Date(),
      priority: 0,
      completed: false,
    },
  ];

  it('should render with placeholder text when no parent selected', () => {
    const onSelectParent = vi.fn();
    render(
      <ParentItemSelector
        selectedParent={null}
        onSelectParent={onSelectParent}
        allItems={mockItems}
      />
    );

    expect(screen.getByText('Select parent item...')).toBeInTheDocument();
  });

  it('should display selected parent title', () => {
    const onSelectParent = vi.fn();
    const selectedParent = { id: '1', title: 'Fire Task' };

    render(
      <ParentItemSelector
        selectedParent={selectedParent}
        onSelectParent={onSelectParent}
        allItems={mockItems}
      />
    );

    expect(screen.getByText('Fire Task')).toBeInTheDocument();
  });

  it('should truncate long titles', () => {
    const onSelectParent = vi.fn();
    const longTitle = 'This is a very long title that should be truncated after thirty characters';
    const selectedParent = { id: '1', title: longTitle };

    render(
      <ParentItemSelector
        selectedParent={selectedParent}
        onSelectParent={onSelectParent}
        allItems={mockItems}
      />
    );

    expect(screen.getByText(/This is a very long title that.../)).toBeInTheDocument();
  });

  it('should show clear button when parent is selected', () => {
    const onSelectParent = vi.fn();
    const selectedParent = { id: '1', title: 'Fire Task' };

    render(
      <ParentItemSelector
        selectedParent={selectedParent}
        onSelectParent={onSelectParent}
        allItems={mockItems}
      />
    );

    // Look for the X button (clear button)
    const clearButtons = screen.getAllByRole('button');
    expect(clearButtons.length).toBeGreaterThan(0);
  });

  it('should call onSelectParent with null when clear button clicked', () => {
    const onSelectParent = vi.fn();
    const selectedParent = { id: '1', title: 'Fire Task' };

    render(
      <ParentItemSelector
        selectedParent={selectedParent}
        onSelectParent={onSelectParent}
        allItems={mockItems}
      />
    );

    // Find and click the clear button (first button with X icon)
    const buttons = screen.getAllByRole('button');
    const clearButton = buttons[0]; // The X button is first
    fireEvent.click(clearButton);

    expect(onSelectParent).toHaveBeenCalledWith(null);
  });

  it('should exclude current item from list', () => {
    const onSelectParent = vi.fn();

    render(
      <ParentItemSelector
        selectedParent={null}
        onSelectParent={onSelectParent}
        allItems={mockItems}
        currentItemId="2"
      />
    );

    // Open the popover
    const trigger = screen.getByRole('combobox');
    fireEvent.click(trigger);

    // Should show 2 items (excluding currentItemId "2")
    // Fire Task and Air Analysis, but not Water Article
    expect(screen.queryByText('Water Article')).not.toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const onSelectParent = vi.fn();

    const { container } = render(
      <ParentItemSelector
        selectedParent={null}
        onSelectParent={onSelectParent}
        allItems={mockItems}
        className="custom-class"
      />
    );

    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });
});
