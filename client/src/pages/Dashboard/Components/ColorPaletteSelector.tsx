import React, { useState } from 'react';
import { Select, Space, Tooltip, Row, Col, Popover, Button, ColorPicker } from 'antd';
import { BgColorsOutlined } from '@ant-design/icons';
import { COLOR_PALETTES, ColorPalette } from './utils/colorPalettes';

interface ColorPaletteSelectorProps {
  value?: string;
  onChange?: (paletteId: string, customColors?: string[]) => void;
  allowCustom?: boolean;
  showLabel?: boolean;
}

const ColorPaletteSelector: React.FC<ColorPaletteSelectorProps> = ({
  value = 'default',
  onChange,
  allowCustom = true,
  showLabel = true
}) => {
  const [selectedPalette, setSelectedPalette] = useState(value);
  const [customColors, setCustomColors] = useState<string[]>([
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#FFD93D', '#6BCF7F'
  ]);
  const [editingColorIndex, setEditingColorIndex] = useState<number | null>(null);

  const handlePaletteChange = (paletteId: string) => {
    setSelectedPalette(paletteId);
    if (onChange) {
      onChange(paletteId, paletteId === 'custom' ? customColors : undefined);
    }
  };

  const handleCustomColorChange = (color: any, index: number) => {
    const newColors = [...customColors];
    // Ant Design ColorPicker returns color object with toHexString method
    const hexColor = typeof color === 'string' ? color : color.toHexString();
    newColors[index] = hexColor;
    setCustomColors(newColors);
    if (onChange && selectedPalette === 'custom') {
      onChange('custom', newColors);
    }
  };

  const renderColorPreview = (colors: string[]) => (
    <Space size={4}>
      {colors.slice(0, 5).map((color, index) => (
        <div
          key={index}
          style={{
            width: 16,
            height: 16,
            backgroundColor: color,
            borderRadius: '50%',
            border: '1px solid #3a3a3e',
            boxShadow: `0 0 4px ${color}40`
          }}
        />
      ))}
      {colors.length > 5 && (
        <span style={{ fontSize: '12px', color: '#8c8c8c' }}>+{colors.length - 5}</span>
      )}
    </Space>
  );

  const renderCustomPalette = () => (
    <div style={{ marginTop: 16 }}>
      <Row gutter={[8, 8]}>
        {customColors.map((color, index) => (
          <Col key={index} span={3}>
            <ColorPicker
              value={color}
              onChange={(newColor) => handleCustomColorChange(newColor, index)}
              size="small"
              showText={false}
              presets={[
                {
                  label: 'Suggested',
                  colors: [
                    '#F5222D', '#FA541C', '#FA8C16', '#FAAD14', '#FADB14',
                    '#A0D911', '#52C41A', '#13C2C2', '#1890FF', '#2F54EB',
                    '#722ED1', '#EB2F96'
                  ]
                }
              ]}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  backgroundColor: color,
                  borderRadius: 4,
                  border: '2px solid #3a3a3e',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  boxShadow: editingColorIndex === index ? `0 0 8px ${color}` : 'none'
                }}
              />
            </ColorPicker>
          </Col>
        ))}
      </Row>
    </div>
  );

  const options = [
    ...Object.values(COLOR_PALETTES).map(palette => ({
      value: palette.id,
      label: (
        <Space>
          <span>{palette.name}</span>
          {renderColorPreview(palette.colors)}
        </Space>
      ),
      searchLabel: palette.name,
      description: palette.description
    })),
    ...(allowCustom ? [{
      value: 'custom',
      label: (
        <Space>
          <span>Custom</span>
          {selectedPalette === 'custom' && renderColorPreview(customColors)}
        </Space>
      ),
      searchLabel: 'Custom',
      description: 'Create your own color palette'
    }] : [])
  ];

  return (
    <div>
      <Space direction="vertical" style={{ width: '100%' }}>
        {showLabel && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <BgColorsOutlined style={{ color: '#8c8c8c' }} />
            <span style={{ color: '#d9d9d9', fontSize: '14px' }}>Color Theme</span>
          </div>
        )}
        
        <Select
          value={selectedPalette}
          onChange={handlePaletteChange}
          options={options}
          style={{ width: '100%' }}
          optionRender={(option) => (
            <div>
              <div>{option.label}</div>
              {option.data.description && (
                <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
                  {option.data.description}
                </div>
              )}
            </div>
          )}
        />

        {selectedPalette === 'custom' && allowCustom && renderCustomPalette()}
      </Space>
    </div>
  );
};

export default ColorPaletteSelector;