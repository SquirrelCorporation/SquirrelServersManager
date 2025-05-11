---
layout: FeatureGuideLayout
title: "Why Create a Plugin"
icon: 💡
time: 5 min read
signetColor: '#4caf50'
nextStep:
  icon: 🧩
  title: Plugin System
  description: Return to the Plugin System documentation
  link: /docs/developer/plugins
credits: true
---

:::tip In a Nutshell (🌰)
- Plugins enable you to extend SSM with custom functionality tailored to your needs
- Create dedicated user interfaces that seamlessly integrate with the main application
- Add custom backend logic with API endpoints and database storage
- Maintain clean separation between core SSM and your custom functionality
- Share and distribute your plugins with the broader SSM community
:::

:::info Latest Documentation
For the absolute latest updates, examples, and potential template changes, please refer to the canonical documentation within the [SquirrelServersManager-Plugins repository](https://github.com/SquirrelCorporation/SquirrelServersManager-Plugins).
:::

## Benefits of Creating SSM Plugins

Squirrel Servers Manager (SSM) is designed to be extensible through a robust plugin system. While the core application provides comprehensive features for managing servers and infrastructure, plugins offer a powerful way to tailor SSM to specific needs, integrate external tools, or introduce entirely new functionality.

### 1. Extend Without Forking

Perhaps the most significant benefit of using plugins is the ability to extend SSM without modifying its core codebase. This means:

- Your extensions will continue to work with future SSM updates
- You don't need to maintain your own fork of the entire project
- You can focus solely on the specific functionality you need to add
- You avoid the complexity of understanding and modifying the entire codebase

### 2. Leverage Existing SSM Infrastructure

Creating a plugin for SSM allows you to:

- **Access Core APIs:** Your plugin runs within the main SSM environment, with the ability to interact with core SSM data and services.
- **Utilize Authentication:** Plugins benefit from SSM's existing user authentication and authorization mechanisms.
- **Use Shared UI Components:** Leverage Ant Design components and the established SSM UI patterns.

### 3. Manage Dedicated Data

- **Isolated Database:** By declaring a `database` field in your manifest, SSM automatically provisions a dedicated MongoDB database for your plugin.
- **Data Persistence:** Store and retrieve configuration, state, or any other data relevant to your plugin's functionality.
- **Data Separation:** Your plugin's data doesn't interfere with the core application data or other plugins.

### 4. Integrate Custom User Interfaces

- **Seamless Frontend Integration:** Build UIs using React and Ant Design that are dynamically loaded within the main SSM application.
- **Dedicated Plugin Pages:** Configure your plugin to have its own page within the SSM interface at `/plugins/<your-plugin-id>`.
- **Module Federation:** Leverage Webpack Module Federation for efficient, isolated UI code loading.

### 5. Extend Backend Functionality

- **Custom API Endpoints:** Expose your own REST API endpoints under the `/plugins/<your-plugin-id>/` path.
- **Background Tasks:** Implement custom server-side logic, data processing, or scheduled jobs.
- **Third-Party Integrations:** Connect SSM to external services or tools.

## Use Cases for Plugins

SSM plugins can address a wide range of specific needs:

<ComponentInfoGrid>
  <ComponentInfoCard
    headerTitle="Enhanced Monitoring"
    purpose="Extend SSM's monitoring capabilities to gain deeper insights and integrate with existing monitoring solutions."
    subText="Capabilities:"
    :storesItems="[
      'Collect and visualize custom metrics',
      'Integrate with third-party monitoring tools',
      'Create specialized dashboards for different server roles'
    ]"
  />
  <ComponentInfoCard
    headerTitle="Infrastructure Automation"
    purpose="Develop plugins to automate specific infrastructure management tasks and streamline operations."
    subText="Capabilities:"
    :storesItems="[
      'Custom deployment workflows',
      'Environment-specific provisioning',
      'Scheduled maintenance tasks'
    ]"
  />
  <ComponentInfoCard
    headerTitle="Custom Visualizations"
    purpose="Create plugins with specialized visualizations for various data types and metrics, enhancing data comprehension."
    subText="Capabilities:"
    :storesItems="[
      'Network topology',
      'Resource utilization',
      'Performance metrics',
      'Log analysis'
    ]"
  />
  <ComponentInfoCard
    headerTitle="Integration with External Tools"
    purpose="Build plugins that connect SSM seamlessly with other essential tools in your development and operations ecosystem."
    subText="Capabilities:"
    :storesItems="[
      'CI/CD platforms',
      'Ticketing systems',
      'Incident management tools',
      'Documentation systems'
    ]"
  />
  <ComponentInfoCard
    headerTitle="Custom Authentication"
    purpose="Implement plugins to extend SSM\'s authentication mechanisms and integrate with enterprise identity providers."
    subText="Capabilities:"
    :storesItems="[
      'LDAP integration',
      'Single Sign-On (SSO)',
      'Multi-factor authentication (MFA)',
      'Custom authorization rules'
    ]"
  />
  <ComponentInfoCard
    headerTitle="Specialized Workflows"
    purpose="Design plugins to implement and enforce workflows specific to your organization\'s needs and internal processes."
    subText="Capabilities:"
    :storesItems="[
      'Approval processes',
      'Custom notification systems',
      'Compliance checks',
      'Auditing tools'
    ]"
  />
</ComponentInfoGrid>

## How Plugins are Packaged

To ensure easy distribution and installation, SSM plugins are packaged as simple TAR archives compressed with Gzip (`.tar.gz`).

A valid plugin archive contains:

- `manifest.json`: Core metadata describing the plugin
- `package.json`: Standard Node.js package information
- `dist/`: Compiled JavaScript code for server-side logic
- `public/`: Static assets, including bundled client-side code (if applicable)
- `node_modules/`: Production runtime dependencies

A checksum file (`.sha256`) can be provided alongside the archive for integrity verification during installation.

## Community Benefits

Creating and sharing plugins with the broader SSM community offers additional benefits:

- **Feedback and Improvements:** Get input from other users to enhance your plugin
- **Collaboration:** Work with other developers interested in similar functionality
- **Recognition:** Contribute valuable tools to the SSM ecosystem
- **Knowledge Sharing:** Learn from and teach others about specific infrastructure use cases

