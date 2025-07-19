// Predefined color palettes for charts
export interface ColorPalette {
  id: string;
  name: string;
  colors: string[];
  description?: string;
}

export const COLOR_PALETTES: Record<string, ColorPalette> = {
  default: {
    id: 'default',
    name: 'Default',
    colors: ['#52c41a', '#faad14', '#1890ff', '#f5222d', '#722ed1', '#13c2c2', '#fa8c16'],
    description: 'Original SSM colors'
  },
  vibrant: {
    id: 'vibrant',
    name: 'Vibrant',
    colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#FFD93D', '#6BCF7F'],
    description: 'Bright and energetic'
  },
  pastel: {
    id: 'pastel',
    name: 'Pastel',
    colors: ['#FFE5E5', '#E5F3FF', '#E5FFE5', '#FFF5E5', '#F5E5FF', '#E5FFF5', '#FFE5F5'],
    description: 'Soft and subtle'
  },
  monochrome: {
    id: 'monochrome',
    name: 'Monochrome',
    colors: ['#4A90E2', '#5A9FEE', '#6AAEF5', '#7ABDFF', '#8AC5FF', '#9AD0FF', '#AADAFF'],
    description: 'Single color variations'
  },
  earth: {
    id: 'earth',
    name: 'Earth Tones',
    colors: ['#D2691E', '#8B4513', '#A0522D', '#CD853F', '#DEB887', '#BC8F8F', '#F4A460'],
    description: 'Natural and warm'
  },
  neon: {
    id: 'neon',
    name: 'Neon',
    colors: ['#FF073A', '#0FFFFF', '#39FF14', '#FF10F0', '#FFFF33', '#FF6600', '#9D00FF'],
    description: 'Electric and bold'
  },
  professional: {
    id: 'professional',
    name: 'Professional',
    colors: ['#2E86AB', '#A23B72', '#F18F01', '#C73E1D', '#6A994E', '#BC4B51', '#5B8C85'],
    description: 'Business appropriate'
  }
};

// Utility function to get colors for a palette
export const getPaletteColors = (paletteId: string): string[] => {
  return COLOR_PALETTES[paletteId]?.colors || COLOR_PALETTES.default.colors;
};

// Assign consistent colors to items based on their ID/name
export const getColorForItem = (
  itemId: string, 
  paletteId: string, 
  index: number = 0
): string => {
  const colors = getPaletteColors(paletteId);
  // Use a hash of the itemId for consistent color assignment
  const hash = itemId.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  const colorIndex = Math.abs(hash) % colors.length;
  return colors[colorIndex] || colors[index % colors.length];
};

// Get color by index with fallback
export const getColorByIndex = (
  paletteId: string,
  index: number
): string => {
  const colors = getPaletteColors(paletteId);
  return colors[index % colors.length];
};