---
layout: FeatureGuideLayout
title: "Concepts"
icon: 💡 # Lightbulb icon
time: 3 min read
signetColor: '#3498db' # Blue for Concepts
credits: true
feedbackSupport: true
---


## Understanding SSM's Core Concepts

Welcome to the Concepts section of the Squirrel Servers Manager documentation. This area is designed to help you understand the fundamental ideas and mental models that power SSM.

:::tip In a Nutshell (🌰)
Understanding these core concepts will help you get the most out of SSM and make better decisions about how to structure your server management workflow.
:::

## Why Mental Models Matter

Mental models are simplified representations of how something works. Having the right mental models for SSM helps you:

- Make better decisions about how to organize your infrastructure
- Troubleshoot problems more effectively
- Take full advantage of SSM's capabilities
- Communicate more clearly with other users and contributors

## Core Concepts

<FeatureGrid>
  <FeatureCard
    icon="🏗️"
    title="Architecture Overview"
    description="Understand how SSM's components work together to provide a seamless management experience."
    link="./architecture"
  />
  <FeatureCard
    icon="🔌"
    title="Agentless Operation"
    description="Learn how SSM manages servers without requiring agent software to be installed."
    link="./agentless"
  />
  <FeatureCard
    icon="💻"
    title="Device Data Model"
    description="Explore how SSM represents and tracks devices in your infrastructure."
    link="./device-model"
  />
  <FeatureCard
    icon="🔒"
    title="Security Model"
    description="Discover how SSM secures connections and protects sensitive information."
    link="./security"
  />
  <FeatureCard
    icon="🧩"
    title="Plugin System"
    description="Learn about SSM's extensible plugin architecture for adding new capabilities."
    link="./plugins"
  />
</FeatureGrid>

## Mental Models

Understanding these mental models will help you work more effectively with SSM:

<FeatureGrid>
  <FeatureCard
    icon="💻"
    title="Device Model"
    description="How SSM represents and manages servers, VMs, and other computing resources."
    link="./models/devices"
  />
  <FeatureCard
    icon="📦"
    title="Container Model"
    description="How containers are deployed, managed, and monitored across your infrastructure."
    link="./models/containers"
  />
  <FeatureCard
    icon="🔄"
    title="Automation Model"
    description="How automations are structured to respond to events and perform actions."
    link="./models/automation"
  />
  <FeatureCard
    icon="📋"
    title="Playbooks Model"
    description="How Ansible playbooks are used for configuration management and orchestration."
    link="./models/playbooks"
  />
</FeatureGrid>

## How These Concepts Work Together

In SSM, these concepts work together to create a cohesive management experience:

1. **Devices** form the foundation of your infrastructure
2. **Containers** run on devices to provide isolated application environments
3. **Playbooks** configure devices and services consistently
4. **Automations** respond to events and perform actions across your infrastructure
5. The **Plugin System** extends SSM's capabilities for specific needs

Understanding how these concepts interact will help you build a more effective server management workflow.
