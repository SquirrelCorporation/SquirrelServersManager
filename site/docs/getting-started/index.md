---
layout: FeatureGuideLayout
title: "Getting Started with SSM"
icon: 🚀
time: 10 min read
signetColor: '#f1c40f'
nextStep:
  icon: 🛠️
  title: Installation Guide
  description: Choose your installation method and get SSM up and running
  link: /docs/getting-started/installation
credits: true
feedbackSupport: true
---
Squirrel Servers Manager (SSM) is a powerful yet simple platform that allows you to manage servers, containers, and automate tasks without installing agents on your devices. This guide will walk you through getting started with SSM, from installation to deploying your first container.

:::tip In a Nutshell (🌰)
- Squirrel Servers Manager (SSM) is an agentless DevOps tool for managing servers
- The 10-minute onboarding process: install, create admin account, add device, deploy container
- Multiple installation options available (Docker, Proxmox, manual)
- No agents required - SSM uses SSH to securely connect to your devices
- All key features are accessible through an intuitive web interface
:::

## Welcome to Squirrel Servers Manager

<p align="center">
  <img src="/images/squirrels-happy-fox.svg" alt="firsttime2" width="102.4" height="153.6">
</p>

> I built Squirrel Servers Manager to make infrastructure management simple, secure, and accessible for everyone. I wanted a tool that could automate complex server and container operations without requiring agents or heavyweight platforms—just SSH. My goal was to empower users to manage their devices, containers, and automations with confidence, using a modern, open-source solution that’s easy to deploy, extend, and maintain. - Squirrel Dev.

## SSM Architecture Overview

SSM uses an agentless architecture, which means you don't need to install any software on your target devices. Instead, SSM connects to your servers using secure SSH connections, allowing you to manage them remotely. This approach makes SSM lightweight, secure, and easy to deploy.

<MentalModelDiagram 
  title="SSM System Architecture" 
  imagePath="/images/getting-started-system-architecture.svg" 
  altText="SSM System Architecture" 
  caption="Figure 1: SSM's agentless architecture" 
/> 

## Core Features

SSM offers four main feature areas that work together to provide a comprehensive server management solution:

<MentalModelDiagram 
  title="SSM Core Features" 
  imagePath="/images/getting-started-feature-highlights.svg" 
  altText="SSM Feature Highlights" 
  caption="Figure 2: The four pillars of SSM" 
/>

## Quick Start Path

Follow these four steps to get up and running with SSM:

<StepPath :steps="[
  {
    number: 1,
    title: 'Installation',
    description: 'Install SSM using Docker or on Proxmox',
    link: '/docs/getting-started/installation',
    linkText: 'Installation Guide →'
  },
  {
    number: 2,
    title: 'First-Time Setup',
    description: 'Create admin account and log in',
    link: '/docs/getting-started/first-steps',
    linkText: 'First Steps Guide →'
  },
  {
    number: 3,
    title: 'Add a Device',
    description: 'Connect your first server or device',
    link: '/docs/user-guides/devices/adding-devices',
    linkText: 'Device Setup →'
  },
  {
    number: 4,
    title: 'Deploy a Container',
    description: 'Deploy and manage your first container',
    link: '/docs/user-guides/containers/management',
    linkText: 'Container Guide →'
  }
]" />

## System Requirements

Before you begin, make sure your environment meets these requirements:

<RequirementsGrid :requirements="[
  {
    header: 'Docker Host',
    items: [
      'Docker 20.10+ or Docker Engine',
      'Docker Compose V2',
      '2GB RAM (minimum)',
      '10GB free disk space',
      'Linux-based OS'
    ]
  },
  {
    header: 'Target Devices',
    items: [
      'SSH access (password or key)',
      'Python 3.8+ for Ansible features',
      'Sudo privileges for container management',
      'Docker for container features'
    ]
  },
  {
    header: 'Browser Support',
    items: [
      'Chrome 90+',
      'Firefox 90+',
      'Safari 15+',
      'Edge 90+'
    ]
  },
  {
    header: 'Network',
    items: [
      'Open port 8000 for web interface',
      'Outbound SSH access to devices',
      'Internet access for updates'
    ]
  }
]" />

## Installation Methods

SSM offers multiple installation methods to fit your needs:

<FeatureGrid>
  <FeatureCard
    icon="🐳"
    title="Docker Installation"
    description="Recommended method using Docker and Docker Compose for quick setup."
    link="/docs/getting-started/installation#docker-installation"
  />
  <FeatureCard
    icon="🖥️"
    title="Proxmox Installation"
    description="Optimized setup for Proxmox Virtual Environment hosts."
    link="/docs/getting-started/installation#proxmox-installation"
  />
  <FeatureCard
    icon="⚙️"
    title="Manual Installation"
    description="For advanced users wanting full control over the setup."
    link="/docs/reference/installation/manual-ssm-from-source"
  />
  <FeatureCard
    icon="📦"
    title="Dockerless Setup"
    description="For environments where Docker is not available or preferred."
    link="/docs/getting-started/installation#dockerless-setup"
  />
</FeatureGrid>

## Key Advantages of SSM

<AdvantagesSection :advantagesData="[
  {
    icon: '🔐',
    title: 'Agentless Architecture',
    description: 'No need to install agents on your servers. SSM uses SSH for secure, lightweight management.',
  },
  {
    icon: '🧩',
    title: 'Plugin System',
    description: 'Extend SSM\'s functionality with plugins to meet your specific needs.',
  },
  {
    icon: '🔄',
    title: 'Container Orchestration',
    description: 'Easily deploy and manage Docker containers across multiple servers.',
  },
  {
    icon: '📊',
    title: 'Monitoring & Statistics',
    description: 'Track server performance and health with built-in monitoring tools.',
  },
  {
    icon: '⚙️',
    title: 'Automations',
    description: 'Create powerful automation workflows triggered by events or schedules.',
  },
  {
    icon: '📘',
    title: 'Ansible Playbooks',
    description: 'Use Ansible playbooks for sophisticated configuration management.',
  },
]" />

## Where to Go Next

After completing the initial setup, explore these areas to get the most out of SSM:

<FeatureGrid>
  <FeatureCard
    icon="📱"
    title="Device Management"
    description="Learn to manage and monitor your devices"
    link="/docs/user-guides/devices/"
  />
  
  <FeatureCard
    icon="🐳"
    title="Container Management"
    description="Deploy and manage Docker containers"
    link="/docs/user-guides/containers/"
  />
  
  <FeatureCard
    icon="🤖"
    title="Automations"
    description="Set up automated tasks and workflows"
    link="/docs/user-guides/automations/"
  />
  
  <FeatureCard
    icon="📚"
    title="Playbooks"
    description="Use Ansible playbooks for configuration"
    link="/docs/user-guides/playbooks/"
  />
</FeatureGrid>