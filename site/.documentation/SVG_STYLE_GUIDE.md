# SVG Style Guide for SSM Documentation (v2)

This guide defines the visual style for SVG diagrams in the Squirrel Servers Manager documentation and site, emphasizing clarity and a modern, flat aesthetic.

## 1. Canvas Background
- Default SVG canvas background: `#1e1e1e` (Dark Gray)
  - This should be set on the root `<svg>` element or an initial `<rect>` covering the full viewbox if a specific canvas color distinct from the page background is desired.

## 2. Node Styles

### 2.1. General Node Appearance ("Containers", "Bubbles")
- **Background Color**: `#1b1b1f` (Very Dark Gray/Off-Black)
- **Border**: 
  - Style: `solid`
  - Width: `4px`
  - Position: **Left side only**
- **Accent Border Colors**: Use one of the following for the left border to differentiate node types or categories.
  1.  `#ff9800` (Orange)
  2.  `#4caf50` (Green)
  3.  `#3498db` (Blue)
  4.  `#9b59b6` (Purple)
  5.  `#1abc9c` (Teal)
- **Rounded Corners**: `rx="8" ry="8"` (Recommended for a subtle rounded effect)
- **Shadows**: Generally omitted for a flatter design. If used, they should be subtle.

### 2.2. Specific Node Backgrounds
- **Single Nodes / Branch Nodes**: 
  - These nodes can optionally use a distinct background color: `#a8b1ff` (Light Lavender/Blue).
  - When this background is used, the left border rule (Section 2.1) may be overridden or adjusted for contrast if necessary.

## 3. Typography

- **Default Font Family**: `Inter, ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"`

### 3.1. Main Titles (Overall Diagram Title)
- **Font-weight**: `bold`
- **Color**: `#dfdfd6` (Light Gray)
- **Font-size**: `16px` 
  - *Note: This is the same size as in-node titles. Consider a larger size (e.g., `20px` or `24px`) for main titles if more hierarchy is needed.*

### 3.2. Titles within Nodes
- **Font-weight**: `bold`
- **Color**: `#dfdfd6` (Light Gray)
- **Font-size**: `16px`

### 3.3. Subtext (Descriptive text in nodes or general annotations)
- **Color**: `#98989f` (Medium Gray)
- **Font-size**: `13px` (equivalent to `0.8rem` at `16px` base, rounded)
- **Font-weight**: `400` (Normal)

## 4. Connections (Lines and Arrows)
- **Stroke Color**: `#666666` (Darker Gray) - Chosen for good visibility against the dark canvas and node backgrounds.
- **Stroke Width**: `1.5px` or `2px`
- **Stroke Style**: `solid` or `dashed` (e.g., `stroke-dasharray="4,4"`) for different types of relationships.
- **Arrowheads**: Use standard SVG markers if arrows are needed. Match marker fill to the stroke color.

## 5. Icons
- If icons are used within nodes or alongside text, ensure they have good contrast with their background.
- Prefer simple, single-color SVG icons or well-chosen Unicode characters that render consistently.

## Example Snippet (Illustrative)

```xml
<svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#1e1e1e"/>
  
  <text x="150" y="25" text-anchor="middle" 
        font-family="Inter, sans-serif" font-size="16px" font-weight="bold" fill="#dfdfd6">
    Diagram Title
  </text>

  <!-- Node with Left Border -->
  <g transform="translate(50, 50)">
    <rect width="200" height="100" rx="8" ry="8" fill="#1b1b1f"/>
    <rect width="4" height="100" rx="0" ry="0" fill="#ff9800"/> <!-- Left border, note rx/ry for sharp edge -->
    <text x="15" y="30" 
          font-family="Inter, sans-serif" font-size="16px" font-weight="bold" fill="#dfdfd6">
      Node Title
    </text>
    <text x="15" y="55" 
          font-family="Inter, sans-serif" font-size="13px" font-weight="400" fill="#98989f">
      Some descriptive subtext for this node.
    </text>
  </g>
  
  <!-- Single/Branch Node with Special Background -->
  <g transform="translate(50, 160)">
     <rect width="200" height="30" rx="8" ry="8" fill="#a8b1ff"/>
     <!-- Text for this node -->
  </g>
</svg>
```

---
**Follow this guide for all new SVG diagrams to ensure a consistent, modern, and accessible visual style.** 