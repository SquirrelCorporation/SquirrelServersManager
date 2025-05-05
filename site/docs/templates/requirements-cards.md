<script setup>
import FeatureGrid from '/components/FeatureGrid.vue';
import FeatureCard from '/components/FeatureCard.vue';
import PageHeader from '/components/PageHeader.vue';
</script>

<PageHeader 
  title="Requirements Cards Template" 
  icon="📋" 
  time="Reading time: 2 minutes" 
/>

This file demonstrates the usage of the requirements cards component for displaying system requirements or other checklist items.

## Example

<FeatureGrid>
  <FeatureCard 
    title="Docker Host" 
    icon="🐳" 
    description="
      - ✓ Docker 20.10+ or Docker Engine
      - ✓ Docker Compose V2
      - ✓ 2GB RAM (minimum)
    " 
  />
  
  <FeatureCard 
    title="Network" 
    icon="🌐" 
    description="
      - ✓ Open port 8000 for web interface
      - ✓ Outbound SSH access to devices
    " 
  />
</FeatureGrid>

## Usage Instructions

To use the requirements cards displayed above, add the following HTML to your markdown files:

```html
<div class="requirements-grid">
  <div class="requirement-card">
    <div class="requirement-header">Section Title</div>
    <div class="requirement-content">
      <div class="req-item"><span class="req-check">✓</span> Requirement item 1</div>
      <div class="req-item"><span class="req-check">✓</span> Requirement item 2</div>
      <div class="req-item"><span class="req-check">✓</span> Requirement item 3</div>
    </div>
  </div>
  
  <!-- Add more requirement cards as needed -->
</div>
```

The styling for these cards is provided globally in the `custom.css` file and includes:

1. Dark blue headers (#23233e) with white text
2. Dark card background (#1b1b1d) with orange border
3. Orange check marks for each requirement item
4. Responsive grid layout that adapts to different screen sizes
5. Consistent spacing and typography
6. Proper contrast for readability

These cards are designed to clearly display requirements, features, or other checklist-style information in a visually appealing way.
