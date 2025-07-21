---
layout: FeatureGuideLayout
title: "Reference"
icon: "📚" # Books/reference icon
time: "5 min read"
signetColor: '#23233e'
nextStep:
  icon: "➡️"
  title: "Environment Variables"
  description: "Continue to the next relevant section."
  link: "/docs/reference/environment-variables"
credits: true
feedbackSupport: true
---

This section provides comprehensive technical reference documentation for Squirrel Servers Manager. Use these resources when you need detailed information about specific components, configuration parameters, or technical specifications.

<p align="center">
  <img src="/images/squirrel-reference.png" alt="firsttime2" width="102.4" height="153.6">
</p>

:::tip In a Nutshell (🌰)
- Technical reference materials for SSM
- Detailed configuration parameters and options
- Advanced technical topics and integrations
- Reference materials for developers and system administrators
:::


## Technical Guides

<script setup>
const referenceCategories = [
  {
    icon: "⚙️",
    title: "Installation & Configuration",
    description: "Guides for installing and configuring SSM and agents.",
    link: "/docs/reference/installation/manual-ssm-from-source",
    subLinks: [
      { text: "Manual SSM Installation", href: "/docs/reference/installation/manual-ssm-from-source" },
      { text: "Manual Agent Installation", href: "/docs/reference/installation/manual-agent-install" }
    ]
  },
  {
    icon: "🔑",
    title: "SSH Integration",
    description: "How SSM connects to devices and containers via SSH.",
    link: "/docs/reference/ssh-configuration",
    subLinks: [
      { text: "SSH Connection Principles", href: "/docs/reference/ssh-configuration" },
      { text: "Ansible SSH Connection", href: "/docs/reference/ansible/connection-methods" },
      { text: "Docker SSH Connection", href: "/docs/reference/docker/connection" }
    ]
  },
  {
    icon: "📜",
    title: "Ansible Reference",
    description: "Reference for Ansible usage and configuration in SSM.",
    link: "/docs/reference/ansible/security",
    subLinks: [
      { text: "Ansible Principles", href: "/docs/reference/ansible/security" },
      { text: "Ansible Configuration", href: "/docs/reference/ansible/configuration" }
    ]
  },
  {
    icon: "🐳",
    title: "Docker Reference",
    description: "Docker integration and container management in SSM.",
    link: "/docs/reference/docker-configuration",
    subLinks: [
      { text: "Docker Principles", href: "/docs/reference/docker-configuration" },
      { text: "Container Labels", href: "/docs/reference/containers/labelling" }
    ]
  }
];
</script>

<FeatureGrid>
  <SubLinkFeatureCard
    v-for="cat in referenceCategories"
    :key="cat.title"
    :icon="cat.icon"
    :title="cat.title"
    :description="cat.description"
    :link="cat.link"
    :subLinks="cat.subLinks"
  />
</FeatureGrid>


## Developer Reference

<FeatureGrid>
  <FeatureCard
    icon="🔌"
    title="Plugins API"
    description="Learn how to develop plugins for extending SSM functionality."
    link="/docs/developer/plugins"
  />
  <FeatureCard
    icon="📄"
    title="Documentation Standards"
    description="Guidelines for contributing to SSM documentation."
    link="/docs/developer/documentation-template"
  />
</FeatureGrid>
