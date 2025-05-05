<script setup>
import FeatureGrid from '/components/FeatureGrid.vue';
import FeatureCard from '/components/FeatureCard.vue';
import PageHeader from '/components/PageHeader.vue';
</script>

<PageHeader 
  title="Main Features Example" 
  icon="⭐" 
  time="Reading time: 2 minutes" 
/>

This file demonstrates the usage of the main feature cards that are visible on the getting-started page.

## Core Features

<FeatureGrid>
  <FeatureCard 
    title="Device Management" 
    icon="📱" 
    description="Learn to manage and monitor your devices" 
    link="/docs/user-guides/devices/" 
  />
  
  <FeatureCard 
    title="Container Management" 
    icon="🐳" 
    description="Deploy and manage Docker containers" 
    link="/docs/user-guides/containers/" 
  />
  
  <FeatureCard 
    title="Automations" 
    icon="🤖" 
    description="Set up automated tasks and workflows" 
    link="/docs/user-guides/automations/" 
  />
  
  <FeatureCard 
    title="Playbooks" 
    icon="📚" 
    description="Use Ansible playbooks for configuration" 
    link="/docs/user-guides/playbooks/" 
  />
</FeatureGrid>

## Usage Instructions

To use the main feature cards displayed above, add the following HTML to your markdown files:

```html
<div class="features-grid">
  <a href="/path/to/page" class="main-feature-card">
    <h2>📱 Feature Title</h2>
    <p style="text-decoration: none; border-bottom: none;">Feature description text goes here</p>
  </a>
  
  <!-- Add more cards as needed -->
</div>
```

The styling for these cards is provided globally in the `custom.css` file and includes:

1. Dark background (#1b1b1d) for contrast
2. Simple orange border styling
3. Reduced spacing between the heading and description text (15px margin)
4. Compact text sizes (1.4rem for headings, 0.85rem for descriptions)
5. Plain gray subtitle text with no underlines
6. Subtle hover effect on the border only
7. Clean, minimal design with no internal separators

These cards are designed to be the primary navigation elements for major feature sections, matching the overall design aesthetic of the site.
