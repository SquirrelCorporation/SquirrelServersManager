<script setup>
import NextStepCard from '/components/NextStepCard.vue';
import PageHeader from '/components/PageHeader.vue';
</script>

<PageHeader 
  title="Next Step Card Template" 
  icon="👉" 
  time="Reading time: 2 minutes" 
/>

This file demonstrates the usage of the next step card component for guiding users to the next important actions.

## Example

<NextStepCard 
  title="First Time Setup"
  description="Create your admin account and get started with SSM"
  icon="👉"
  link="/docs/getting-started/first-steps"
/>

## Usage Instructions

To use the next step card displayed above, add the following HTML to your markdown files:

```html
<a href="/path/to/page" class="next-step-card">
  <div class="next-step-icon">👉</div>
  <h2>Card Title</h2>
  <p>Description text goes here</p>
</a>
```

The styling for these cards is provided globally in the `custom.css` file and includes:

1. Transparent background allowing the page background to show through
2. Orange border styling matching other UI elements
3. Grid layout with precise alignment and spacing
4. Icon positioned at the top left
5. Clear horizontal separator line between title and description
6. Compact design with appropriate font sizes
7. Proper text colors and no text decorations

These cards are designed to guide users to the next logical step in a process or to highlight important information.
