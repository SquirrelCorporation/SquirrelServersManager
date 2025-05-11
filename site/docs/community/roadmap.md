---
layout: FeatureGuideLayout
title: "Project Roadmap"
icon: 🗺️
time: 5 min read
signetColor: '#00bcd4'
nextStep:
  icon: 📝
  title: Contributing Guide
  description: Learn how you can contribute to the project
  link: /docs/community/contributing
credits: true
---

:::tip In a Nutshell (🌰)
- SSM maintains a public roadmap in GitHub Projects
- Features move through Backlog → Next Release → In Progress → Done
- Tasks are prioritized from P0 (critical) to P3 (nice-to-have)
- The roadmap focuses on integrations, security, and extensibility
- Community feedback helps shape feature priorities
:::

## What is the SSM Roadmap?

The Squirrel Servers Manager roadmap is our public development plan that outlines what features and improvements we're working on, what's coming next, and what we've recently completed. It's a living document that evolves based on user feedback, community contributions, and project goals.

## Visual Explanation

The SSM roadmap follows a structured process to move features from ideas to implementation:

<MentalModelDiagram 
  title="Roadmap Process" 
  imagePath="/images/community-roadmap-process.svg" 
  altText="SSM Roadmap Process" 
  caption="Figure 1: The SSM Roadmap Process" 
/>

## How We Prioritize

We use a combination of factors to prioritize features on our roadmap:

<PriorityGrid :items="[
  {
    label: 'P0: Critical',
    color: '#e74c3c',
    details: [
      'Security vulnerabilities',
      'Major bug fixes',
      'Core functionality issues'
    ]
  },
  {
    label: 'P1: Important',
    color: '#ff9800',
    details: [
      'High-demand features',
      'Significant improvements',
      'Performance enhancements'
    ]
  },
  {
    label: 'P2: Normal',
    color: '#3498db',
    details: [
      'Standard feature requests',
      'UI/UX improvements',
      'Documentation enhancements'
    ]
  },
  {
    label: 'P3: Nice to Have',
    color: '#95a5a6',
    details: [
      'Minor enhancements',
      'Experimental features',
      'Edge case improvements'
    ]
  }
]" />

## Current Priorities

Our current focus areas for the next development cycle include:

<FeatureGrid>
  <FeatureCard
    icon="🔄"
    title="Third-Party Integrations"
    description="Expanding our ecosystem with more integrations and API capabilities."
  />
  <FeatureCard
    icon="🔒"
    title="External Authentication"
    description="Supporting SSO and external authentication providers for enhanced security."
  />
  <FeatureCard
    icon="🔍"
    title="Security Center"
    description="A comprehensive plugin for security scanning and management."
  />
  <FeatureCard
    icon="📦"
    title="Container Technologies"
    description="Expanding container technology support beyond Docker."
  />
</FeatureGrid>

## Recently Completed

Here are some significant features we've recently completed:

<div class="timeline">
  <div class="timeline-item">
    <div class="timeline-dot"></div>
    <div class="timeline-content">
      <div class="timeline-title">Plugin Architecture</div>
      <div class="timeline-description">A flexible plugin system allowing third-party extensions.</div>
    </div>
  </div>
  
  <div class="timeline-item">
    <div class="timeline-dot"></div>
    <div class="timeline-content">
      <div class="timeline-title">Enhanced Docker Support</div>
      <div class="timeline-description">Improved Docker management with better monitoring and controls.</div>
    </div>
  </div>
  
  <div class="timeline-item">
    <div class="timeline-dot"></div>
    <div class="timeline-content">
      <div class="timeline-title">Playbook Execution</div>
      <div class="timeline-description">Reliable playbook execution with better error handling and reporting.</div>
    </div>
  </div>
  
  <div class="timeline-item">
    <div class="timeline-dot"></div>
    <div class="timeline-content">
      <div class="timeline-title">Documentation Improvements</div>
      <div class="timeline-description">Comprehensive documentation with visual guides and examples.</div>
    </div>
  </div>
</div>

<style>
.timeline {
  position: relative;
  padding-left: 30px;
  margin: 20px 0;
}

.timeline::before {
  content: "";
  position: absolute;
  height: 100%;
  width: 2px;
  background-color: var(--vp-c-brand-soft);
  left: 8px;
  top: 0;
}

.timeline-item {
  position: relative;
  margin-bottom: 20px;
}

.timeline-dot {
  position: absolute;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: var(--vp-c-brand);
  left: -30px;
  top: 0;
}

.timeline-content {
  padding-left: 10px;
}

.timeline-title {
  font-weight: bold;
  color: var(--vp-c-brand);
  margin-bottom: 4px;
}

.timeline-description {
  color: var(--vp-c-text-2);
}
</style>

## How to View the Full Roadmap

The complete, up-to-date roadmap is available in our GitHub Projects:

<div class="cta-container">
  <a href="https://github.com/orgs/SquirrelCorporation/projects/2/views/1" class="cta-button" target="_blank">
    <span class="cta-icon">🗺️</span>
    <span class="cta-text">View Full Roadmap on GitHub</span>
  </a>
</div>

<style>
.cta-container {
  margin: 30px 0;
  text-align: center;
}

.cta-button {
  display: inline-flex;
  align-items: center;
  padding: 12px 24px;
  background-color: var(--vp-c-brand);
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 500;
  transition: transform 0.2s, background-color 0.2s;
}

.cta-button:hover {
  background-color: var(--vp-c-brand-dark);
  transform: translateY(-2px);
}

.cta-icon {
  font-size: 20px;
  margin-right: 8px;
}
</style>

## Provide Feedback

We value your input on our roadmap and feature priorities. Here's how you can help shape the future of SSM:

1. **Feature Requests**: Submit feature ideas through our [GitHub Issues](https://github.com/SquirrelCorporation/SquirrelServersManager/issues/new?assignees=&labels=enhancement&template=feature_request.md).

2. **Voting**: Check existing feature requests and add your 👍 to show support for features you'd like to see prioritized.

3. **Discussions**: Join conversations about feature ideas in our [GitHub Discussions](https://github.com/SquirrelCorporation/SquirrelServersManager/discussions) or [Discord Community](https://discord.gg/cnQjsFCGKJ).

4. **Contributions**: Help implement features on the roadmap by [contributing code](/docs/community/contributing).

## Release Process

Our release process follows a predictable pattern to ensure quality and stability:

1. **Feature Development**: Features from the roadmap are developed in feature branches
2. **Testing & QA**: New features undergo testing and quality assurance
3. **Beta Release**: Features are available in beta for early testing
4. **Official Release**: Tested features are included in the stable release
5. **Post-Release Monitoring**: We monitor for issues and collect feedback

## Related Concepts

<FeatureGrid>
  <FeatureCard
    icon="📝"
    title="Contributing Guide"
    description="Learn more about this topic."
    link="/docs/community/contributing"
  />
  <FeatureCard
    icon="🚀"
    title="Release Process"
    description="Learn more about this topic."
    link="/contribute/release"
  />
  <FeatureCard
    icon="🧩"
    title="Plugin Development"
    description="Learn more about this topic."
    link="/docs/developer/plugins"
  />
  <FeatureCard
    icon="🛠️"
    title="Tech Stack"
    description="Learn more about this topic."
    link="/contribute/stack"
  />
</FeatureGrid>

<!-- The CreditsFooter will be shown automatically if 'credits: true' is set in frontmatter -->