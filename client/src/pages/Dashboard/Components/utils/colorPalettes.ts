// Predefined color palettes for charts
export interface ColorPalette {
  id: string;
  name: string;
  colors: string[];
  description?: string;
  semantic?: {
    positive: string;      // Success, healthy, good performance
    negative: string;      // Error, danger, poor performance
    warning: string;       // Warning, caution, medium performance
    neutral: string;       // Normal, info, neutral data
    primary: string;       // Primary accent color
    secondary: string;     // Secondary accent color
  };
}

export const COLOR_PALETTES: Record<string, ColorPalette> = {
  default: {
    id: 'default',
    name: 'Default',
    colors: ['#52c41a', '#faad14', '#1890ff', '#f5222d', '#722ed1', '#13c2c2', '#fa8c16'],
    description: 'Original SSM colors',
    semantic: {
      positive: '#52c41a',    // Green for success
      negative: '#f5222d',    // Red for danger
      warning: '#faad14',     // Orange for warning
      neutral: '#1890ff',     // Blue for neutral/info
      primary: '#1890ff',     // Blue as primary
      secondary: '#722ed1'    // Purple as secondary
    }
  },
  vibrant: {
    id: 'vibrant',
    name: 'Vibrant',
    colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#FFD93D', '#6BCF7F'],
    description: 'Bright and energetic',
    semantic: {
      positive: '#6BCF7F',    // Bright green
      negative: '#FF6B6B',    // Bright red
      warning: '#FFD93D',     // Bright yellow
      neutral: '#45B7D1',     // Sky blue
      primary: '#4ECDC4',     // Teal
      secondary: '#FFA07A'    // Light salmon
    }
  },
  pastel: {
    id: 'pastel',
    name: 'Pastel',
    colors: ['#FFE5E5', '#E5F3FF', '#E5FFE5', '#FFF5E5', '#F5E5FF', '#E5FFF5', '#FFE5F5'],
    description: 'Soft and subtle',
    semantic: {
      positive: '#E5FFE5',    // Pastel green
      negative: '#FFE5E5',    // Pastel red
      warning: '#FFF5E5',     // Pastel yellow
      neutral: '#E5F3FF',     // Pastel blue
      primary: '#E5F3FF',     // Pastel blue
      secondary: '#F5E5FF'    // Pastel purple
    }
  },
  monochrome: {
    id: 'monochrome',
    name: 'Monochrome',
    colors: ['#4A90E2', '#5A9FEE', '#6AAEF5', '#7ABDFF', '#8AC5FF', '#9AD0FF', '#AADAFF'],
    description: 'Single color variations',
    semantic: {
      positive: '#4A90E2',    // Dark blue (most saturated)
      negative: '#AADAFF',    // Light blue (for contrast)
      warning: '#7ABDFF',     // Medium blue
      neutral: '#6AAEF5',     // Medium-dark blue
      primary: '#4A90E2',     // Dark blue
      secondary: '#8AC5FF'    // Light-medium blue
    }
  },
  earth: {
    id: 'earth',
    name: 'Earth Tones',
    colors: ['#D2691E', '#8B4513', '#A0522D', '#CD853F', '#DEB887', '#BC8F8F', '#F4A460'],
    description: 'Natural and warm',
    semantic: {
      positive: '#8B4513',    // Dark brown (stable)
      negative: '#BC8F8F',    // Rosy brown
      warning: '#F4A460',     // Sandy brown
      neutral: '#D2691E',     // Chocolate
      primary: '#A0522D',     // Sienna
      secondary: '#DEB887'    // Burlywood
    }
  },
  neon: {
    id: 'neon',
    name: 'Neon',
    colors: ['#FF073A', '#0FFFFF', '#39FF14', '#FF10F0', '#FFFF33', '#FF6600', '#9D00FF'],
    description: 'Electric and bold',
    semantic: {
      positive: '#39FF14',    // Neon green
      negative: '#FF073A',    // Neon red
      warning: '#FFFF33',     // Neon yellow
      neutral: '#0FFFFF',     // Cyan
      primary: '#0FFFFF',     // Cyan
      secondary: '#FF10F0'    // Neon pink
    }
  },
  professional: {
    id: 'professional',
    name: 'Professional',
    colors: ['#2E86AB', '#A23B72', '#F18F01', '#C73E1D', '#6A994E', '#BC4B51', '#5B8C85'],
    description: 'Business appropriate',
    semantic: {
      positive: '#6A994E',    // Sage green
      negative: '#C73E1D',    // Rust red
      warning: '#F18F01',     // Amber
      neutral: '#2E86AB',     // Steel blue
      primary: '#2E86AB',     // Steel blue
      secondary: '#5B8C85'    // Teal grey
    }
  },
  system: {
    id: 'system',
    name: 'System Status',
    colors: ['#38A169', '#3182CE', '#ECC94B', '#E53E3E', '#5e9a35', '#DD6B20', '#A0AEC0'],
    description: 'System monitoring colors',
    semantic: {
      positive: '#38A169',    // Green
      negative: '#E53E3E',    // Red
      warning: '#ECC94B',     // Yellow
      neutral: '#3182CE',     // Blue
      primary: '#3182CE',     // Blue
      secondary: '#A0AEC0'    // Gray
    }
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

// Get semantic color for a specific meaning
export const getSemanticColor = (
  paletteId: string, 
  semantic: keyof ColorPalette['semantic']
): string => {
  const palette = COLOR_PALETTES[paletteId] || COLOR_PALETTES.default;
  return palette.semantic?.[semantic] || COLOR_PALETTES.default.semantic![semantic];
};

// Get all semantic colors for a palette
export const getSemanticColors = (paletteId: string) => {
  const palette = COLOR_PALETTES[paletteId] || COLOR_PALETTES.default;
  return palette.semantic || COLOR_PALETTES.default.semantic!;
};