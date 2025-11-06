import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useTags } from './useTags';
import type { Tag } from '@/types';
import { supabase } from '@/integrations/supabase/client-safe';

// Mock the Supabase client
vi.mock('@/integrations/supabase/client-safe', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe('useTags', () => {
  const mockTags: Tag[] = [
    { id: '1', name: 'Fire Tag 1', type: 'fire', parent_id: null },
    { id: '2', name: 'Fire Tag 2', type: 'fire', parent_id: '1' },
    { id: '3', name: 'Earth Tag', type: 'earth', parent_id: null },
  ];

  let mockSelect: any;
  let mockOrder: any;
  let consoleErrorSpy: any;

  beforeEach(() => {
    // Create mock chain for Supabase query
    mockOrder = vi.fn();
    mockSelect = vi.fn(() => ({
      order: mockOrder,
    }));

    (supabase.from as any).mockReturnValue({
      select: mockSelect,
    });

    // Spy on console.error
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.clearAllMocks();
    consoleErrorSpy.mockRestore();
  });

  it('should fetch tags successfully', async () => {
    mockOrder.mockResolvedValue({
      data: mockTags,
      error: null,
    });

    const { result } = renderHook(() => useTags());

    // Initially loading
    expect(result.current.isLoading).toBe(true);
    expect(result.current.allTags).toEqual([]);

    // Wait for the hook to finish loading
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Check that tags were loaded
    expect(result.current.allTags).toEqual(mockTags);
    expect(mockSelect).toHaveBeenCalledWith('*');
    expect(mockOrder).toHaveBeenCalledWith('name', { ascending: true });
  });

  it('should handle empty tags array', async () => {
    mockOrder.mockResolvedValue({
      data: [],
      error: null,
    });

    const { result } = renderHook(() => useTags());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.allTags).toEqual([]);
  });

  it('should handle null data from database', async () => {
    mockOrder.mockResolvedValue({
      data: null,
      error: null,
    });

    const { result } = renderHook(() => useTags());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.allTags).toEqual([]);
  });

  it('should handle database errors', async () => {
    const mockError = { message: 'Database connection failed' };
    mockOrder.mockResolvedValue({
      data: null,
      error: mockError,
    });

    const { result } = renderHook(() => useTags());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.allTags).toEqual([]);
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error loading tags:', mockError);
  });

  it('should only fetch tags once on mount', async () => {
    mockOrder.mockResolvedValue({
      data: mockTags,
      error: null,
    });

    const { result, rerender } = renderHook(() => useTags());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Rerender the hook
    rerender();

    // Should still only have called the query once
    expect(mockSelect).toHaveBeenCalledTimes(1);
    expect(mockOrder).toHaveBeenCalledTimes(1);
  });

  it('should return tags sorted by name', async () => {
    const unsortedTags = [
      { id: '3', name: 'Zebra', type: 'fire', parent_id: null },
      { id: '1', name: 'Apple', type: 'fire', parent_id: null },
      { id: '2', name: 'Banana', type: 'fire', parent_id: null },
    ];

    mockOrder.mockResolvedValue({
      data: unsortedTags,
      error: null,
    });

    const { result } = renderHook(() => useTags());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Verify order was called with ascending
    expect(mockOrder).toHaveBeenCalledWith('name', { ascending: true });
  });
});
