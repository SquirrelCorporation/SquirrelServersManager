import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';

export interface UIState {
  // Sidebar state
  sidebarCollapsed: boolean;
  sidebarPinned: boolean;
  
  // Theme and appearance
  theme: 'light' | 'dark' | 'system';
  compactMode: boolean;
  
  // Modals and overlays
  activeModals: Set<string>;
  drawerOpen: string | null;
  
  // Page-specific UI state
  pageLoading: boolean;
  pageError: string | null;
  
  // Bulk actions
  selectedItems: Map<string, Set<string>>; // page -> selected item IDs
  bulkActionMode: boolean;
  
  // Actions
  setSidebarCollapsed: (collapsed: boolean) => void;
  setSidebarPinned: (pinned: boolean) => void;
  toggleSidebar: () => void;
  
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setCompactMode: (compact: boolean) => void;
  
  openModal: (modalId: string) => void;
  closeModal: (modalId: string) => void;
  closeAllModals: () => void;
  isModalOpen: (modalId: string) => boolean;
  
  setDrawer: (drawerId: string | null) => void;
  
  setPageLoading: (loading: boolean) => void;
  setPageError: (error: string | null) => void;
  
  selectItem: (page: string, itemId: string) => void;
  unselectItem: (page: string, itemId: string) => void;
  selectAllItems: (page: string, itemIds: string[]) => void;
  clearSelection: (page: string) => void;
  getSelectedItems: (page: string) => string[];
  
  setBulkActionMode: (enabled: boolean) => void;
  
  // Reset actions
  resetUI: () => void;
}

export const useUIStore = create<UIState>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      // Initial state
      sidebarCollapsed: false,
      sidebarPinned: true,
      theme: 'system',
      compactMode: false,
      activeModals: new Set(),
      drawerOpen: null,
      pageLoading: false,
      pageError: null,
      selectedItems: new Map(),
      bulkActionMode: false,
      
      // Sidebar actions
      setSidebarCollapsed: (collapsed) => 
        set({ sidebarCollapsed: collapsed }, false, 'ui/setSidebarCollapsed'),
      
      setSidebarPinned: (pinned) => 
        set({ sidebarPinned: pinned }, false, 'ui/setSidebarPinned'),
      
      toggleSidebar: () => 
        set((state) => ({ 
          sidebarCollapsed: !state.sidebarCollapsed 
        }), false, 'ui/toggleSidebar'),
      
      // Theme actions
      setTheme: (theme) => 
        set({ theme }, false, 'ui/setTheme'),
      
      setCompactMode: (compact) => 
        set({ compactMode: compact }, false, 'ui/setCompactMode'),
      
      // Modal actions
      openModal: (modalId) => 
        set((state) => ({
          activeModals: new Set([...state.activeModals, modalId])
        }), false, 'ui/openModal'),
      
      closeModal: (modalId) => 
        set((state) => {
          const newModals = new Set(state.activeModals);
          newModals.delete(modalId);
          return { activeModals: newModals };
        }, false, 'ui/closeModal'),
      
      closeAllModals: () => 
        set({ activeModals: new Set() }, false, 'ui/closeAllModals'),
      
      isModalOpen: (modalId) => get().activeModals.has(modalId),
      
      // Drawer actions
      setDrawer: (drawerId) => 
        set({ drawerOpen: drawerId }, false, 'ui/setDrawer'),
      
      // Page state actions
      setPageLoading: (loading) => 
        set({ pageLoading: loading }, false, 'ui/setPageLoading'),
      
      setPageError: (error) => 
        set({ pageError: error }, false, 'ui/setPageError'),
      
      // Selection actions
      selectItem: (page, itemId) => 
        set((state) => {
          const newSelection = new Map(state.selectedItems);
          if (!newSelection.has(page)) {
            newSelection.set(page, new Set());
          }
          newSelection.get(page)!.add(itemId);
          return { selectedItems: newSelection };
        }, false, 'ui/selectItem'),
      
      unselectItem: (page, itemId) => 
        set((state) => {
          const newSelection = new Map(state.selectedItems);
          if (newSelection.has(page)) {
            newSelection.get(page)!.delete(itemId);
          }
          return { selectedItems: newSelection };
        }, false, 'ui/unselectItem'),
      
      selectAllItems: (page, itemIds) => 
        set((state) => {
          const newSelection = new Map(state.selectedItems);
          newSelection.set(page, new Set(itemIds));
          return { selectedItems: newSelection };
        }, false, 'ui/selectAllItems'),
      
      clearSelection: (page) => 
        set((state) => {
          const newSelection = new Map(state.selectedItems);
          newSelection.delete(page);
          return { selectedItems: newSelection };
        }, false, 'ui/clearSelection'),
      
      getSelectedItems: (page) => 
        Array.from(get().selectedItems.get(page) || []),
      
      setBulkActionMode: (enabled) => 
        set({ bulkActionMode: enabled }, false, 'ui/setBulkActionMode'),
      
      // Reset action
      resetUI: () => 
        set({
          sidebarCollapsed: false,
          sidebarPinned: true,
          theme: 'system',
          compactMode: false,
          activeModals: new Set(),
          drawerOpen: null,
          pageLoading: false,
          pageError: null,
          selectedItems: new Map(),
          bulkActionMode: false,
        }, false, 'ui/resetUI'),
    })),
    {
      name: 'ui-store',
      // Persist sidebar and theme preferences
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        sidebarPinned: state.sidebarPinned,
        theme: state.theme,
        compactMode: state.compactMode,
      }),
    }
  )
);