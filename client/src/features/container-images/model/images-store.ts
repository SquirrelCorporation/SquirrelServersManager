import { create } from 'zustand';
import { subscribeWithSelector, devtools } from 'zustand/middleware';
import { ContainerImage } from '@shared/api/containers';

export interface ImageFilters {
  deviceUuid?: string;
  repository?: string;
  tag?: string;
  inUse?: boolean;
  search?: string;
}

export interface ImagesState {
  // Image data
  images: ContainerImage[];
  imagesLoading: boolean;
  imagesError: string | null;
  
  // Selected images for bulk operations
  selectedImageIds: Set<string>;
  
  // Filters
  filters: ImageFilters;
  
  // Actions
  setImages: (images: ContainerImage[]) => void;
  updateImage: (imageId: string, updates: Partial<ContainerImage>) => void;
  removeImage: (imageId: string) => void;
  addImage: (image: ContainerImage) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: Partial<ImageFilters>) => void;
  clearFilters: () => void;
  
  // Selection actions
  selectImage: (imageId: string) => void;
  deselectImage: (imageId: string) => void;
  selectAllImages: () => void;
  clearSelection: () => void;
  toggleImageSelection: (imageId: string) => void;
  
  // Computed getters
  getFilteredImages: () => ContainerImage[];
  getImageById: (id: string) => ContainerImage | undefined;
  getImagesByDevice: (deviceUuid: string) => ContainerImage[];
  getUnusedImages: () => ContainerImage[];
  getSelectedImages: () => ContainerImage[];
  getImageStats: () => {
    total: number;
    inUse: number;
    unused: number;
    totalSize: number;
    byDevice: Record<string, number>;
  };
}

export const useImagesStore = create<ImagesState>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      // State
      images: [],
      imagesLoading: false,
      imagesError: null,
      selectedImageIds: new Set(),
      filters: {},

      // Actions
      setImages: (images) => {
        set({
          images,
          imagesError: null,
        });
      },

      updateImage: (imageId, updates) => {
        const state = get();
        const images = state.images.map(image =>
          image.id === imageId ? { ...image, ...updates } : image
        );
        set({ images });
      },

      removeImage: (imageId) => {
        const state = get();
        const images = state.images.filter(img => img.id !== imageId);
        const selectedImageIds = new Set(state.selectedImageIds);
        selectedImageIds.delete(imageId);
        
        set({
          images,
          selectedImageIds,
        });
      },

      addImage: (image) => {
        const state = get();
        // Check if image already exists
        const existingIndex = state.images.findIndex(img => img.id === image.id);
        
        let images;
        if (existingIndex >= 0) {
          // Update existing image
          images = [...state.images];
          images[existingIndex] = image;
        } else {
          // Add new image
          images = [image, ...state.images];
        }
        
        set({ images });
      },

      setLoading: (loading) => set({ imagesLoading: loading }),

      setError: (error) => set({ imagesError: error }),

      setFilters: (newFilters) => {
        const state = get();
        set({
          filters: { ...state.filters, ...newFilters }
        });
      },

      clearFilters: () => set({ filters: {} }),

      // Selection actions
      selectImage: (imageId) => {
        const state = get();
        const selectedImageIds = new Set(state.selectedImageIds);
        selectedImageIds.add(imageId);
        set({ selectedImageIds });
      },

      deselectImage: (imageId) => {
        const state = get();
        const selectedImageIds = new Set(state.selectedImageIds);
        selectedImageIds.delete(imageId);
        set({ selectedImageIds });
      },

      selectAllImages: () => {
        const state = get();
        const filteredImages = state.getFilteredImages();
        const selectedImageIds = new Set(filteredImages.map(img => img.id));
        set({ selectedImageIds });
      },

      clearSelection: () => set({ selectedImageIds: new Set() }),

      toggleImageSelection: (imageId) => {
        const state = get();
        if (state.selectedImageIds.has(imageId)) {
          state.deselectImage(imageId);
        } else {
          state.selectImage(imageId);
        }
      },

      // Computed getters
      getFilteredImages: () => {
        const state = get();
        const { images, filters } = state;

        return images.filter(image => {
          // Device filter
          if (filters.deviceUuid && image.deviceUuid !== filters.deviceUuid) {
            return false;
          }

          // Repository filter
          if (filters.repository && !image.repository.includes(filters.repository)) {
            return false;
          }

          // Tag filter
          if (filters.tag && image.tag !== filters.tag) {
            return false;
          }

          // In use filter
          if (filters.inUse !== undefined && image.inUse !== filters.inUse) {
            return false;
          }

          // Search filter
          if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            const matchesRepository = image.repository.toLowerCase().includes(searchLower);
            const matchesTag = image.tag.toLowerCase().includes(searchLower);
            const matchesId = image.id.toLowerCase().includes(searchLower);
            
            if (!matchesRepository && !matchesTag && !matchesId) {
              return false;
            }
          }

          return true;
        });
      },

      getImageById: (id) => {
        const state = get();
        return state.images.find(image => image.id === id);
      },

      getImagesByDevice: (deviceUuid) => {
        const state = get();
        return state.images.filter(image => image.deviceUuid === deviceUuid);
      },

      getUnusedImages: () => {
        const state = get();
        return state.images.filter(image => !image.inUse);
      },

      getSelectedImages: () => {
        const state = get();
        return state.images.filter(image => 
          state.selectedImageIds.has(image.id)
        );
      },

      getImageStats: () => {
        const state = get();
        const images = state.images;
        
        const stats = {
          total: images.length,
          inUse: 0,
          unused: 0,
          totalSize: 0,
          byDevice: {} as Record<string, number>,
        };

        images.forEach(image => {
          // Usage counts
          if (image.inUse) {
            stats.inUse++;
          } else {
            stats.unused++;
          }

          // Size calculation
          stats.totalSize += image.size;

          // Device counts
          stats.byDevice[image.deviceUuid] = (stats.byDevice[image.deviceUuid] || 0) + 1;
        });

        return stats;
      },
    })),
    { name: 'ImagesStore' }
  )
);

// Convenience hooks
export function useImageList() {
  return useImagesStore(state => ({
    images: state.getFilteredImages(),
    allImages: state.images,
    loading: state.imagesLoading,
    error: state.imagesError,
    stats: state.getImageStats(),
  }));
}

export function useImageSelection() {
  return useImagesStore(state => ({
    selectedIds: state.selectedImageIds,
    selectedImages: state.getSelectedImages(),
    selectImage: state.selectImage,
    deselectImage: state.deselectImage,
    selectAll: state.selectAllImages,
    clearSelection: state.clearSelection,
    toggleSelection: state.toggleImageSelection,
  }));
}

export function useImageFilters() {
  return useImagesStore(state => ({
    filters: state.filters,
    setFilters: state.setFilters,
    clearFilters: state.clearFilters,
  }));
}

export function useImageActions() {
  return useImagesStore(state => ({
    setImages: state.setImages,
    updateImage: state.updateImage,
    removeImage: state.removeImage,
    addImage: state.addImage,
    setLoading: state.setLoading,
    setError: state.setError,
  }));
}