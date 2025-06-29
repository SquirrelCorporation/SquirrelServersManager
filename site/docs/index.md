---
layout: FeatureGuideLayout
title: "Documentation Overview"
icon: "📚"
time: "3 min read"
signetColor: '#f1c40f'
nextStep:
  icon: "🚀"
  title: "Getting Started"
  description: "Begin your journey with SSM installation and first steps."
  link: "/docs/getting-started/"
credits: true
---

## Welcome to Squirrel Servers Manager Documentation !

Squirrel Servers Manager (SSM) is a versatile backend and frontend solution for configuration and Docker management. It's designed to be **simple** to use while offering comprehensive customization options. This portal provides all the information you need to install, configure, use, and understand SSM.

No agents required — just SSH!


<script setup>
// @intellij-keep
import Diagram from './../components/Diagram.vue';
</script>

<p align="center">
  <img src="/images/squirrels-optimized_running_fox.svg" alt="firsttime2" width="102.4" height="153.6">
</p>

<FeatureGrid>
  <FeatureCard
    icon="🚀"
    title="Quick Start: Installation"
    description="Get up and running with SSM in just a few minutes."
    link="/docs/getting-started/installation"
  />
</FeatureGrid>

## <span style="display: flex; align-items: center;"><img src="/images/overview-magic.svg" alt="tldr" style="margin-right: 8px;" /> Automagic Features</span>

Once a device is added, SSM will automagically:

<FeatureGrid>
  <FeatureCard
    icon="📉"
    title="Downtime Detection"
    description="Detect downtimes automatically."
  />
  <FeatureCard
    icon="⚙️"
    title="System Info Retrieval"
    description="Retrieve hardware key usage and software versions."
  />
  <FeatureCard
    icon="🐳"
    title="Docker Element Sync"
    description="Pull running containers and Docker elements."
  />
  <FeatureCard
    icon="✨"
    title="Update Detection"
    description="Detect container image updates."
  />
  <FeatureCard
    icon="🚀"
    title="Container Management"
    description="Allow you to deploy & manage containers on your devices."
  />
  <FeatureCard
    icon="📜"
    title="Playbook Execution"
    description="Allow you to run playbooks for configuration management."
  />
</FeatureGrid>

## <span style="display: flex; align-items: center;"><img src="/images/overview-reference-architecture.svg" alt="tldr" style="margin-right: 8px;" /> Schematic Overview</span>

<ClientOnly>
  <Diagram/>
</ClientOnly>

## <span style="display: flex; align-items: center;"><img src="/images/overview-device-database-encryption-1-solid.svg" alt="tldr" style="margin-right: 8px;" />SSH based</span>

- Connections from SSM 🐿️ to your devices 🌰🌰🌰 run through `SSH`.
- Credentials are encrypted using Ansible Vault.

## Explore Our Documentation

<FeatureGrid columns="3">
  <FeatureCard
    icon="🚀"
    title="Getting Started"
    description="Installation, first steps, requirements, and troubleshooting basics."
    link="/docs/getting-started/"
  />
  <FeatureCard
    icon="📖"
    title="User Guides"
    description="Detailed how-to guides for using SSM features like device and container management, playbooks, and settings."
    link="/docs/user-guides/"
  />
  <FeatureCard
    icon="💡"
    title="Concepts"
    description="Understand the core architecture, agentless operation, data models, and security principles of SSM."
    link="/docs/concepts/"
  />
  <FeatureCard
    icon="📚"
    title="Reference"
    description="Detailed reference material for environment variables, configurations (SSH, Docker, Ansible), and technical specifications."
    link="/docs/reference/"
  />
  <FeatureCard
    icon="🧑‍💻"
    title="Developer Docs"
    description="Information for developers on plugins, API integration, and contributing to SSM."
    link="/docs/developer/"
  />
  <FeatureCard
    icon="🤝"
    title="Community & Support"
    description="Find out how to contribute, get support, and view the project roadmap."
    link="/docs/community/support/"
  />
</FeatureGrid>
