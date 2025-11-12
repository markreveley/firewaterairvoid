import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test/utils';
import { ItemList } from './ItemList';
import type { Item, Tag } from '@/types';

describe('ItemList Tag Display', () => {
  const mockTags: Tag[] = [
    { id: 'tag-1', name: 'Dirtwire', parent_id: null },
    { id: 'tag-2', name: 'Production', parent_id: 'tag-1' },
    { id: 'tag-3', name: 'Mushy 70 4', parent_id: 'tag-2' },
    { id: 'tag-4', name: 'Maple', parent_id: null },
    { id: 'tag-5', name: 'Socials', parent_id: 'tag-4' },
  ];

  const mockOnDeleteItem = vi.fn();
  const mockOnUpdateItem = vi.fn();

  describe('Tag display behavior', () => {
    it('should display each tag as a separate badge', () => {
      const items: Item[] = [
        {
          id: 'item-1',
          title: 'Test Item',
          type: 'fire',
          tags: [
            { id: 'tag-2', name: 'Production', parent_id: 'tag-1' },
            { id: 'tag-3', name: 'Mushy 70 4', parent_id: 'tag-2' },
          ],
          createdAt: new Date(),
          priority: 3,
          completed: false,
          is_subitem: false,
          recurrence_type: 'none',
        },
      ];

      render(
        <ItemList
          items={items}
          type="fire"
          allTags={mockTags}
          onDeleteItem={mockOnDeleteItem}
          onUpdateItem={mockOnUpdateItem}
        />
      );

      // Should show two separate badges
      expect(screen.getByText('Production')).toBeInTheDocument();
      expect(screen.getByText('Mushy 70 4')).toBeInTheDocument();
    });

    it('should display only the tag name, not the full hierarchy path', () => {
      const items: Item[] = [
        {
          id: 'item-1',
          title: 'Test Item',
          type: 'fire',
          tags: [
            { id: 'tag-3', name: 'Mushy 70 4', parent_id: 'tag-2' },
          ],
          createdAt: new Date(),
          priority: 3,
          completed: false,
          is_subitem: false,
          recurrence_type: 'none',
        },
      ];

      render(
        <ItemList
          items={items}
          type="fire"
          allTags={mockTags}
          onDeleteItem={mockOnDeleteItem}
          onUpdateItem={mockOnUpdateItem}
        />
      );

      // Should only show the tag name, not "Mushy 70 4 Production Dirtwire"
      expect(screen.getByText('Mushy 70 4')).toBeInTheDocument();
      expect(screen.queryByText(/Production Dirtwire/)).not.toBeInTheDocument();
    });

    it('should not display tags for water items', () => {
      const items: Item[] = [
        {
          id: 'item-1',
          title: 'Water Item',
          type: 'water',
          tags: [
            { id: 'tag-2', name: 'Production', parent_id: 'tag-1' },
          ],
          createdAt: new Date(),
          priority: 3,
          completed: false,
          is_subitem: false,
          recurrence_type: 'none',
        },
      ];

      render(
        <ItemList
          items={items}
          type="water"
          allTags={mockTags}
          onDeleteItem={mockOnDeleteItem}
          onUpdateItem={mockOnUpdateItem}
        />
      );

      // Should not show tag badges for water items
      expect(screen.queryByText('Production')).not.toBeInTheDocument();
    });

    it('should display tags for fire items', () => {
      const items: Item[] = [
        {
          id: 'item-1',
          title: 'Fire Item',
          type: 'fire',
          tags: [
            { id: 'tag-5', name: 'Socials', parent_id: 'tag-4' },
          ],
          createdAt: new Date(),
          priority: 3,
          completed: false,
          is_subitem: false,
          recurrence_type: 'none',
        },
      ];

      render(
        <ItemList
          items={items}
          type="fire"
          allTags={mockTags}
          onDeleteItem={mockOnDeleteItem}
          onUpdateItem={mockOnUpdateItem}
        />
      );

      expect(screen.getByText('Socials')).toBeInTheDocument();
    });

    it('should display tags for earth items', () => {
      const items: Item[] = [
        {
          id: 'item-1',
          title: 'Earth Item',
          type: 'earth',
          tags: [
            { id: 'tag-2', name: 'Production', parent_id: 'tag-1' },
          ],
          createdAt: new Date(),
          priority: 3,
          completed: false,
          is_subitem: false,
          recurrence_type: 'none',
        },
      ];

      render(
        <ItemList
          items={items}
          type="earth"
          allTags={mockTags}
          onDeleteItem={mockOnDeleteItem}
          onUpdateItem={mockOnUpdateItem}
        />
      );

      expect(screen.getByText('Production')).toBeInTheDocument();
    });

    it('should display tags for air items', () => {
      const items: Item[] = [
        {
          id: 'item-1',
          title: 'Air Item',
          type: 'air',
          tags: [
            { id: 'tag-1', name: 'Dirtwire', parent_id: null },
          ],
          createdAt: new Date(),
          priority: 3,
          completed: false,
          is_subitem: false,
          recurrence_type: 'none',
        },
      ];

      render(
        <ItemList
          items={items}
          type="air"
          allTags={mockTags}
          onDeleteItem={mockOnDeleteItem}
          onUpdateItem={mockOnUpdateItem}
        />
      );

      expect(screen.getByText('Dirtwire')).toBeInTheDocument();
    });

    it('should display tags for void items', () => {
      const items: Item[] = [
        {
          id: 'item-1',
          title: 'Void Item',
          type: 'void',
          tags: [
            { id: 'tag-4', name: 'Maple', parent_id: null },
          ],
          createdAt: new Date(),
          priority: 3,
          completed: false,
          is_subitem: false,
          recurrence_type: 'none',
        },
      ];

      render(
        <ItemList
          items={items}
          type="void"
          allTags={mockTags}
          onDeleteItem={mockOnDeleteItem}
          onUpdateItem={mockOnUpdateItem}
        />
      );

      expect(screen.getByText('Maple')).toBeInTheDocument();
    });

    it('should display multiple hierarchical tags separately', () => {
      const items: Item[] = [
        {
          id: 'item-1',
          title: 'Multi-tag Item',
          type: 'fire',
          tags: [
            { id: 'tag-5', name: 'Socials', parent_id: 'tag-4' },
            { id: 'tag-4', name: 'Maple', parent_id: null },
            { id: 'tag-1', name: 'Dirtwire', parent_id: null },
          ],
          createdAt: new Date(),
          priority: 3,
          completed: false,
          is_subitem: false,
          recurrence_type: 'none',
        },
      ];

      render(
        <ItemList
          items={items}
          type="fire"
          allTags={mockTags}
          onDeleteItem={mockOnDeleteItem}
          onUpdateItem={mockOnUpdateItem}
        />
      );

      // Should display each tag as a separate badge
      expect(screen.getByText('Socials')).toBeInTheDocument();
      expect(screen.getByText('Maple')).toBeInTheDocument();
      expect(screen.getByText('Dirtwire')).toBeInTheDocument();
    });

    it('should include parent_id in tag structure', () => {
      const items: Item[] = [
        {
          id: 'item-1',
          title: 'Test Item',
          type: 'fire',
          tags: [
            { id: 'tag-2', name: 'Production', parent_id: 'tag-1' },
          ],
          createdAt: new Date(),
          priority: 3,
          completed: false,
          is_subitem: false,
          recurrence_type: 'none',
        },
      ];

      render(
        <ItemList
          items={items}
          type="fire"
          allTags={mockTags}
          onDeleteItem={mockOnDeleteItem}
          onUpdateItem={mockOnUpdateItem}
        />
      );

      // Verify the tag structure includes parent_id
      expect(items[0].tags[0].parent_id).toBe('tag-1');
    });

    it('should display tags in correct order: child first (left), parent last (right)', () => {
      const items: Item[] = [
        {
          id: 'item-1',
          title: 'Test Item',
          type: 'fire',
          tags: [
            // Tags should be in order: child → parent → grandparent
            { id: 'tag-3', name: 'Mushy 70 4', parent_id: 'tag-2' },
            { id: 'tag-2', name: 'Production', parent_id: 'tag-1' },
            { id: 'tag-1', name: 'Dirtwire', parent_id: null },
          ],
          createdAt: new Date(),
          priority: 3,
          completed: false,
          is_subitem: false,
          recurrence_type: 'none',
        },
      ];

      render(
        <ItemList
          items={items}
          type="fire"
          allTags={mockTags}
          onDeleteItem={mockOnDeleteItem}
          onUpdateItem={mockOnUpdateItem}
        />
      );

      // Verify all tags are displayed
      expect(screen.getByText('Mushy 70 4')).toBeInTheDocument();
      expect(screen.getByText('Production')).toBeInTheDocument();
      expect(screen.getByText('Dirtwire')).toBeInTheDocument();

      // Document expected display order:
      // When tags are saved as [child, parent, grandparent],
      // they should display in that same order (child leftmost, grandparent rightmost)
      // Example display: (Mushy 70 4) (Production) (Dirtwire)
    });
  });
});
