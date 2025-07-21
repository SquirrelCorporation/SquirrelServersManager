---
layout: FeatureGuideLayout
title: Documentation Templates
icon: 📄
time: 15 min read
signetColor: '#23233e'
nextStep:
  icon: 📝
  title: Contribution Guide
  description: Learn how to contribute documentation
  link: /docs/community/contributing
credits: false
---

:::tip In a Nutshell (🌰)
- All SSM documentation must use one of our official templates
- Templates enforce consistent structure, required frontmatter, and styling
- Vue components provide interactive elements like diagrams and code examples
- Following documentation standards ensures a cohesive user experience
:::

# Documentation Templates

The Squirrel Servers Manager documentation system uses a set of standardized templates, components, and styling to create a consistent, professional documentation experience. This guide provides a comprehensive overview of all documentation elements and how to use them effectively.

## Why Use Templates?

Templates provide several benefits:

- **Consistent Structure**: Users can navigate any page with familiar patterns
- **Complete Information**: Ensure all necessary sections are included
- **Professional Appearance**: Uniform styling across all documentation
- **Developer Experience**: Focus on content creation, not formatting details
- **Accessibility**: Templates include built-in accessibility features

## Available Templates

<FeatureGrid>
  <FeatureCard title="Feature Guide" description="Step-by-step feature documentation with prerequisites, instructions, and examples." icon="🛠️" />
</FeatureGrid>

### Feature Guide Template

The Feature Guide template is ideal for:

- Step-by-step feature usage instructions
- Configuration guides
- User-facing functionality documentation

```md
---
layout: FeatureGuideLayout
title: "Feature Name"
icon: 🛠️
time: 5 min read
signetColor: '#3a5ccc'
nextStep:
  icon: 📖
  title: Next Guide
  description: Learn about the next feature
  link: /docs/next-guide
credits: true
---

:::tip In a Nutshell (🌰)
- Key summary points for this feature
:::

## Overview

Describe the feature, its purpose, and when to use it.

## Configuration

Provide step-by-step configuration instructions, using code blocks and screenshots as needed.

```bash
# Example command
ssm feature enable
```

## Overview

Explain the purpose and context of this reference information.

## Details

Provide detailed reference information, often in table format:

| Parameter | Description | Default | Required |
|-----------|-------------|---------|----------|
| `HOST` | Host address for the service | `localhost` | Yes |
| `PORT` | Port to listen on | `3000` | No |

## Examples

Show practical examples of usage:

```bash
# Example configuration
HOST=0.0.0.0 PORT=8080 ssm start
```

## Notes

Additional important information, tips, or caveats.
```

## Required Frontmatter

All documentation pages **must** include the following frontmatter:

```md
---
layout: FeatureGuideLayout    # Always use this layout
title: "Page Title"           # Concise, descriptive title
icon: 🛠️                      # Relevant emoji for the page
time: 5 min read              # Estimated reading time
signetColor: '#3a5ccc'        # Section color (see below)
nextStep:                     # Optional, but recommended
  icon: 📖
  title: Next Guide
  description: Learn about the next topic
  link: /docs/next-guide
credits: true                 # Shows credits footer
---
```

### Signet Colors by Section

Each documentation section has a designated color to maintain visual consistency:

<RequirementsGrid :requirements="[
  { header: 'Section Colors', items: [
    'Devices: #3a5ccc (blue)',
    'Containers: #27ae60 (green)',
    'Automations: #e67e22 (orange)',
    'Playbooks: #8e44ad (purple)',
    'Reference: #23233e (dark blue)',
    'Community: #00bcd4 (cyan)',
    'Advanced Guides: #c0392b (red)',
    'Getting Started: #f1c40f (yellow)'
  ]}
]" />

## Essential Components

The SSM documentation uses a variety of Vue components to enhance the user experience. Here are the most commonly used components:

### PageHeader

Automatically generated from frontmatter, but can be used manually if needed:

```md
<PageHeader title="Demo Title" icon="🧩" time="5 min read" signetColor="#00bcd4" />
```
<PageHeader title="Demo Title" icon="🧩" time="5 min read" signetColor="#00bcd4" />

---

### PlatformNote

Used for platform-specific instructions:

```md
<PlatformNote platform="macOS">
This is a macOS-specific note.
</PlatformNote>
```

<PlatformNote platform="macOS">
This is a macOS-specific note.
</PlatformNote>

---

### CopyButton

Provides a copy-to-clipboard button for code snippets:

```md
<CopyButton :code="'npm install squirrel-servers-manager'" />
```

<CopyButton :code="'npm install squirrel-servers-manager'" />

---

### NextStepCard

Guides users to the next logical documentation page:

```md
<NextStepCard icon="👉" title="Next Step" description="Go to the next guide" link="/docs/next-guide" />
```

<NextStepCard icon="👉" title="Next Step" description="Go to the next guide" link="/docs/next-guide" />

---

### SectionHeader

Creates consistent section headers:

```md
<SectionHeader title="Section Title" />
```

<SectionHeader title="Section Title" />

---

### FeatureGrid & FeatureCard

Displays a grid of features with icons and descriptions:

```md
<FeatureGrid>
  <FeatureCard title="Feature 1" description="Description for feature 1." icon="🛠️" />
  <FeatureCard title="Feature 2" description="Description for feature 2." icon="💡" />
</FeatureGrid>
```

<FeatureGrid>
  <FeatureCard title="Feature 1" description="Description for feature 1." icon="🛠️" />
  <FeatureCard title="Feature 2" description="Description for feature 2." icon="💡" />
</FeatureGrid>

---

### RequirementsGrid

Shows system or software requirements in a grid format:

```md
<RequirementsGrid :requirements="[
  { header: 'Docker Host', items: ['Docker 20.10+', '2GB RAM'] },
  { header: 'Target Devices', items: ['SSH access', 'Python 3.8+'] }
]" />
```

<RequirementsGrid :requirements="[
  { header: 'Docker Host', items: ['Docker 20.10+', '2GB RAM'] },
  { header: 'Target Devices', items: ['SSH access', 'Python 3.8+'] }
]" />

---

### StepPath

Visualizes a multi-step process with connecting lines:

```md
<StepPath :steps="[
  { number: 1, title: 'Step One', description: 'First step', link: '#', linkText: 'Learn more' },
  { number: 2, title: 'Step Two', description: 'Second step', link: '#', linkText: 'Next' }
]" />
```

<StepPath :steps="[
  { number: 1, title: 'Step One', description: 'First step', link: '#', linkText: 'Learn more' },
  { number: 2, title: 'Step Two', description: 'Second step', link: '#', linkText: 'Next' }
]" />

---

### PlaybookCodeExample

Displays Ansible playbook code with proper syntax highlighting:

```md
<PlaybookCodeExample :code="'---\n- name: Example\n  hosts: all\n  tasks:\n    - debug: msg=\'Hello\''" language="yaml" />
```

<PlaybookCodeExample :code="'---\n- name: Example\n  hosts: all\n  tasks:\n    - debug: msg=\'Hello\''" language="yaml" />

---

### MentalModelDiagram

Displays a mental model diagram with caption:

```md
<MentalModelDiagram title="Device Architecture" imagePath="/images/device-architecture.svg" altText="Device Architecture Diagram" caption="Figure 1: The Device Architecture in SSM" />
```

<MentalModelDiagram title="Device Architecture" imagePath="/images/device-architecture.svg" altText="Device Architecture Diagram" caption="Figure 1: The Device Architecture in SSM" />

---

### ProcessSteps

Displays a sequence of numbered steps:

```md
<ProcessSteps :steps="[
  { number: 1, title: 'Step 1', description: 'Do this first.' },
  { number: 2, title: 'Step 2', description: 'Then do this.' }
]" />
```

<ProcessSteps :steps="[
  { number: 1, title: 'Step 1', description: 'Do this first.' },
  { number: 2, title: 'Step 2', description: 'Then do this.' }
]" />

---


## VitePress Features

The SSM documentation leverages standard VitePress features for enhanced content presentation:

### Tabs

Use tabs for platform-specific or alternative instructions:

```md
::: code-group
```bash [npm]
npm install squirrel-servers-manager
```

```bash [yarn]
yarn add squirrel-servers-manager
```
:::
```

::: code-group
```bash [npm]
npm install squirrel-servers-manager
```

```bash [yarn]
yarn add squirrel-servers-manager
```
:::

### Callouts

Use callouts for important information:

```md
:::tip
Helpful tip or trick.
:::

:::warning
Important caution or warning.
:::

:::danger
Critical warning about potential data loss.
:::

:::info
Neutral information.
:::
```

:::tip
Helpful tip or trick.
:::

:::warning
Important caution or warning.
:::

:::danger
Critical warning about potential data loss.
:::

:::info
Neutral information.
:::

### Collapsible Details

Use details for optional or verbose information:

```md
<details>
<summary>Advanced Configuration Options</summary>

Additional content here...
</details>
```

<details>
<summary>Advanced Configuration Options</summary>

Additional content here...
</details>

## Writing Guidelines

### Core Writing Principles

- **Clear & Concise**: Use short sentences (15-20 words max). Break complex ideas into multiple sentences.
- **Active Voice**: Write "SSM connects to your server" instead of "Your server is connected to by SSM."
- **Direct Instructions**: Use imperative mood for tasks: "Click the Add button" not "You should click the Add button."
- **Consistent Terminology**: Use the same term for the same concept throughout (e.g., always "device" not sometimes "server").

### Page Structure Standards

- **"In a Nutshell" Section**: Every complex document should begin with a summary section:
  ```md
  :::tip In a Nutshell (🌰)
  - Connect SSH with password or key
  - Enable sudo if needed for container management
  - Test connection before saving
  :::
  ```
- **Progressive Disclosure**: Start with simple concepts, then introduce advanced options.
- **Step Numbering**: Always number sequential steps using ordered lists (1. 2. 3.).
- **Chunking**: Group related information under clear headings.

### Visual Enhancement Guidelines

- **Be Graphical**: Every major feature should include at least one screenshot or diagram.
- **Be Colorful**: Use consistent color coding in diagrams and callouts:
  - Green: Success paths, recommended options
  - Blue: Information, neutral options
  - Yellow: Caution, requires attention
  - Red: Critical warnings, potential data loss
- **Icons & Emojis**: Use consistent icons/emojis as visual markers for repeated elements:
  - 🔑 Security-related information
  - 🚀 Performance tips
  - 🔄 Workflow processes
  - 🧩 Plugins and extensions
  - 🛠️ Configuration options

## Creating Documentation Diagrams

The SSM documentation uses SVG diagrams to visualize complex concepts. These should be created as follows:

1. Design the diagram using a tool like Figma, Inkscape, or a diagramming tool
2. Export as SVG with optimized settings
3. Save in the `/site/public/images/` directory
4. Reference using the `MentalModelDiagram` component

For code-based diagrams (e.g., flowcharts or architecture diagrams), consider using:

1. Vue Flow (for interactive diagrams in development)
2. Mermaid syntax (when supported by VitePress)
3. Pre-rendered SVG (most compatible option)

## Testing Your Documentation

Before submitting documentation:

1. **Local Preview**: Run the docs site locally with `cd site && npm run dev`
2. **Mobile Responsiveness**: Verify the layout works on small screens
3. **Component Functionality**: Test interactive components
4. **Link Validation**: Ensure all internal and external links work
5. **Code Example Verification**: Test that all code examples work as described

## Next Steps

Ready to contribute? Follow these steps:

1. Choose the appropriate template for your documentation type
2. Copy the template file as a starting point
3. Fill in all required frontmatter and sections
4. Add appropriate components and illustrations
5. Submit your documentation following the contribution guidelines
