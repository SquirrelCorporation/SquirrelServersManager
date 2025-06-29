---
layout: FeatureGuideLayout
title: "User Guides"
icon: "📚"
time: "5 min read"
signetColor: '#f1c40f'
credits: true
feedbackSupport: true
---

:::tip In a Nutshell (🌰)
- Comprehensive guides for all major SSM features
- Step-by-step instructions with screenshots
- Organized by functional areas (devices, containers, etc.)
- Includes troubleshooting and best practices
- Follow user paths based on your specific needs
:::

## What You'll Find Here

The User Guides section provides detailed instructions for using all major features of Squirrel Servers Manager, organized by functional area.

<FeatureGrid>
  <SubLinkFeatureCard
    v-for="feature in mainFeatures"
    :key="feature.title"
    :icon="feature.icon"
    :title="feature.title"
    :description="feature.description"
    :link="feature.link"
    :subLinks="feature.subLinks"
  />
</FeatureGrid>

## Getting Started

If you're new to SSM, we recommend following this learning path:
<StepPath :steps="gettingStartedSteps" />

## User Paths

Depending on your role and goals, you might want to explore the documentation in different orders:

<script setup>
import StepPath from '/components/StepPath.vue';
import FeatureGrid from '/components/FeatureGrid.vue';
import SubLinkFeatureCard from '/components/SubLinkFeatureCard.vue';

const devOpsSteps = [
  { number: 1, title: "Container Management", description: "Master deploying and managing Docker containers.", link: "/docs/user-guides/containers/management", linkText: "Explore Management" },
  { number: 2, title: "Container Stacks", description: "Define and run multi-container applications using Docker Compose.", link: "/docs/user-guides/stacks/containers/editor", linkText: "Explore Stacks" },
  { number: 3, title: "Automations", description: "Automate routine tasks and workflows for your servers.", link: "/docs/user-guides/automations/overview", linkText: "Explore Automations" },
  { number: 4, title: "Remote Stack Repositories", description: "Manage and use remote repositories for container stacks.", link: "/docs/user-guides/stacks/containers/remote-stacks", linkText: "Explore Repositories" }
];

const adminSteps = [
  { number: 1, title: "Device Management", description: "Add, configure, and monitor your physical or virtual devices.", link: "/docs/user-guides/devices/management", linkText: "Explore Devices" },
  { number: 2, title: "SSH Configuration", description: "Set up secure SSH connections for device management.", link: "/docs/user-guides/devices/configuration/ssh", linkText: "Explore SSH Config" },
  { number: 3, title: "Playbooks", description: "Use Ansible playbooks for advanced server configuration.", link: "/docs/user-guides/stacks/playbooks/overview", linkText: "Explore Playbooks" },
  { number: 4, title: "Scheduled Tasks", description: "Configure and manage scheduled automations.", link: "/docs/user-guides/automations/schedules", linkText: "Explore Schedules" }
];

const homeLabSteps = [
  { number: 1, title: "Adding Devices", description: "Get your first server or device connected to SSM.", link: "/docs/user-guides/devices/adding-devices", linkText: "Learn Adding Devices" },
  { number: 2, title: "Deploying from Store", description: "Quickly deploy common applications from the template store.", link: "/docs/user-guides/containers/deploy-store", linkText: "Explore Store" },
  { number: 3, title: "Container Basics", description: "Understand the fundamentals of container management.", link: "/docs/user-guides/containers/management", linkText: "Learn Container Basics" },
  { number: 4, title: "Simple Automations", description: "Create basic automations to simplify your lab tasks.", link: "/docs/user-guides/automations/creating", linkText: "Explore Creating Automations" }
];

const gettingStartedSteps = [
  { number: 1, title: "First Steps", description: "Begin with adding your first device to SSM.", link: "/docs/user-guides/devices/adding-devices", linkText: "Add a Device" },
  { number: 2, title: "Container Basics", description: "Learn the fundamentals of managing containers.", link: "/docs/user-guides/containers/management", linkText: "Manage Containers" },
  { number: 3, title: "Simple Deployment", description: "Try deploying an application from the template store.", link: "/docs/user-guides/containers/deploy-store", linkText: "Deploy from Store" },
  { number: 4, title: "Automate", description: "Set up basic automations for your routine tasks.", link: "/docs/user-guides/automations/overview", linkText: "Setup Automations" }
];

const mainFeatures = [
  {
    icon: "🖥️",
    title: "Devices",
    description: "Add, configure, manage, and monitor your servers and devices",
    link: "/docs/user-guides/devices/",
    subLinks: [
      { text: "Adding devices", href: "/docs/user-guides/devices/adding-devices" },
      { text: "Management", href: "/docs/user-guides/devices/management" }
    ]
  },
  {
    icon: "🐳",
    title: "Containers",
    description: "Deploy and manage Docker containers across your infrastructure",
    link: "/docs/user-guides/containers/",
    subLinks: [
      { text: "Container basics", href: "/docs/user-guides/containers/management" },
      { text: "Deploy from store", href: "/docs/user-guides/containers/deploy-store" }
    ]
  },
  {
    icon: "⏱️",
    title: "Automations",
    description: "Set up scheduled tasks and automated workflows",
    link: "/docs/user-guides/automations/",
    subLinks: [
      { text: "Automation basics", href: "/docs/user-guides/automations/overview" },
      { text: "Schedules", href: "/docs/user-guides/automations/schedules" }
    ]
  },
  {
    icon: "📦",
    title: "Stacks",
    description: "Deploy multi-container applications and run Ansible playbooks",
    link: "/docs/user-guides/stacks/",
    subLinks: [
      { text: "Playbooks", href: "/docs/user-guides/stacks/playbooks/overview" },
      { text: "Container Stacks", href: "/docs/user-guides/stacks/containers/editor" }
    ]
  }
];

const advancedFeaturesData = [
  {
    icon: "🗄️",
    title: "Repository Management",
    description: "Work with local and remote repositories for playbooks and container stacks.",
    link: "/docs/user-guides/repositories/", // General link for the category
    subLinks: [
      { text: "Local Repositories", href: "/docs/user-guides/repositories/local-playbooks" },
      { text: "Remote Repositories", href: "/docs/user-guides/repositories/remote-playbooks" }
    ]
  },
  {
    icon: "⚙️",
    title: "System Settings",
    description: "Configure global system settings and integrations.",
    link: "/docs/user-guides/settings/", // General link for the category
    subLinks: [
      { text: "General Settings", href: "/docs/user-guides/settings/overview" },
      { text: "Container Registries", href: "/docs/user-guides/settings/registry" },
      { text: "MCP Settings", href: "/docs/user-guides/settings/mcp" }
    ]
  }
];
</script>

### For DevOps Engineers

Focus on container orchestration and automation:
<StepPath :steps="devOpsSteps" />

### For System Administrators

Prioritize device management and playbooks:
<StepPath :steps="adminSteps" />

### For Home Lab Users

Start with the basics and build up:
<StepPath :steps="homeLabSteps" />

## Advanced Features

Beyond the basics, SSM offers advanced capabilities for power users:

<FeatureGrid>
  <SubLinkFeatureCard
    v-for="feature in advancedFeaturesData"
    :key="feature.title"
    :icon="feature.icon"
    :title="feature.title"
    :description="feature.description"
    :link="feature.link"
    :subLinks="feature.subLinks"
  />
</FeatureGrid>
