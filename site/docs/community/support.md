---
layout: FeatureGuideLayout
title: "Getting Support"
icon: 🆘
time: 10 min read
signetColor: '#00bcd4'
nextStep:
  icon: 🤝
  title: Contributing Guide
  description: Learn how to contribute to the project
  link: /docs/community/contributing
credits: true
---

This guide explains how to get help when you encounter issues with Squirrel Servers Manager (SSM), including where to find information, how to ask for help, and how to report bugs effectively.

:::tip In a Nutshell (🌰)
- Follow the support process flowchart for fastest resolution
- Check documentation first for self-service solutions
- Ask the Discord community for real-time assistance
- File GitHub issues for bugs, feature requests, and documentation improvements
- Include detailed information when seeking help for faster resolution
:::

<script setup>
const supportDecisionTree = {
  type: 'question',
  question: 'Have a Question or Issue?',
  options: [
    {
      label: 'Check Documentation',
      next: {
        type: 'question',
        question: 'Found Answer?',
        options: [
          {
            label: 'Yes',
            next: {
              type: 'result',
              variant: 'success',
              title: 'Solution Found',
              description: 'Continue using SSM. Consider improving the docs.'
            }
          },
          {
            label: 'No',
            next: {
              type: 'question',
              question: 'Ask in Discord Community',
              options: [
                {
                  label: 'Resolved?',
                  next: {
                    type: 'result',
                    variant: 'success',
                    title: 'Solution Found',
                    description: 'Continue using SSM. Consider filing a documented issue.'
                  }
                },
                {
                  label: 'No',
                  next: {
                    type: 'question',
                    question: 'File GitHub Issue',
                    options: [
                      {
                        label: 'Resolved?',
                        next: {
                          type: 'result',
                          variant: 'success',
                          title: 'Issue Resolved',
                          description: 'Wait for next release. Consider contributing a fix.'
                        }
                      },
                      {
                        label: 'No',
                        next: {
                          type: 'result',
                          variant: 'warning',
                          title: 'No Solution Yet',
                          description: 'Please wait for maintainers or consider contributing.'
                        }
                      }
                    ]
                  }
                }
              ]
            }
          }
        ]
      }
    }
  ]
};
</script>

## Support Process Overview

When you need help with SSM, follow this recommended process to get the fastest and most effective support:

**Figure 1: The recommended support process for Squirrel Servers Manager**

<DecisionTree :tree="supportDecisionTree" />

## Self-Service Resources

Before reaching out for help, check these resources to see if your question has already been answered:

<FeatureGrid>
  <FeatureCard 
    title="Documentation" 
    description="Comprehensive guides covering installation, configuration, and usage" 
    icon="📚" 
    link="/docs/"
  />
  <FeatureCard 
    title="Troubleshooting Guide" 
    description="Solutions for common issues and problems" 
    icon="🔍" 
    link="/docs/troubleshoot/"
  />
  <FeatureCard 
    title="GitHub Discussions" 
    description="Previous community questions and answers" 
    icon="💬" 
  />
</FeatureGrid>

### Documentation

The [SSM documentation](/) covers most aspects of installation, configuration, and usage. Key sections include:

- [Getting Started](/docs/getting-started/) - Installation and initial setup
- [User Guides](/docs/user-guides/) - Feature-focused instructions
- [Reference](/docs/reference/) - Technical details and configurations 
- [Troubleshooting](/docs/troubleshoot/) - Solutions for common issues

### Searching for Solutions

To effectively search for answers in the documentation:

1. Use the search feature in the top navigation bar
2. Try different keywords related to your issue
3. Check the troubleshooting section specifically
4. Look for relevant error messages in code examples

## Community Support

If you can't find an answer in the documentation, our community support channels are available to help.

### Discord Community

The [SSM Discord server](https://discord.gg/cnQjsFCGKJ) is the fastest way to get help from the community.

<ProcessSteps :steps="[
  { number: 1, title: 'Join the Discord Server', description: 'Click the link above to join our Discord community' },
  { number: 2, title: 'Use the Right Channel', description: 'Post your question in the appropriate help channel' },
  { number: 3, title: 'Provide Details', description: 'Share relevant information about your issue (see below)' },
  { number: 4, title: 'Be Patient', description: 'Community members may be in different time zones' }
]" />

<PlatformNote platform="Discord Help Tips">
- Use code blocks (` ``` `) for sharing code or logs
- Share screenshots of any error messages
- Follow up if you find a solution to your own question
- Be respectful and patient with community helpers
</PlatformNote>

### GitHub Discussions

For longer form questions or discussions that aren't bugs, use [GitHub Discussions](https://github.com/SquirrelCorporation/SquirrelServersManager/discussions).

This is a good place for:
- Implementation questions
- Architectural discussions
- Use case scenarios
- Best practices

## Reporting Issues

For bugs, feature requests, or documentation improvements, create an issue on GitHub.

### When to Create an Issue

Create a GitHub issue when:

<RequirementsGrid :requirements="[
  { header: 'Bug Reports', items: ['You found a reproducible bug', 'A feature isn\'t working as documented', 'Security vulnerabilities (use private reporting for these)'] },
  { header: 'Feature Requests', items: ['Suggest a new feature', 'Propose improvements to existing features', 'Integration with other tools'] },
  { header: 'Documentation', items: ['Reporting inaccurate documentation', 'Suggesting documentation improvements', 'Missing documentation for features'] }
]" />

### Creating an Effective Issue

Follow these guidelines to create an effective GitHub issue:

1. **Use the correct template**:
   - [Bug Report](https://github.com/SquirrelCorporation/SquirrelServersManager/issues/new?assignees=&labels=bug&template=bug_report.md)
   - [Feature Request](https://github.com/SquirrelCorporation/SquirrelServersManager/issues/new?assignees=&labels=enhancement&template=feature_request.md)
   - [Documentation Improvement](https://github.com/SquirrelCorporation/SquirrelServersManager/issues/new?assignees=&labels=documentation&template=documentation_improvement.md)

2. **Provide detailed information**:
   - For bugs: Steps to reproduce, expected vs. actual behavior, environment details
   - For features: Clear description of the feature, use cases, potential implementation ideas
   - For documentation: Specific page/section, what's incorrect or missing, proposed improvements

3. **Include relevant details**:
   - SSM version
   - Operating system and version
   - Browser (for client issues)
   - Configuration details (when relevant)
   - Screenshots or screen recordings (if applicable)
   - Error messages or logs (formatted in code blocks)

<details>
<summary>Example of a Good Bug Report</summary>

```
### Description
When adding a new device with SSH key authentication, the connection test fails even though the key is valid and works with regular SSH clients.

### Steps to Reproduce
1. Go to Devices page
2. Click "Add Device" button
3. Enter device details (hostname, IP, etc.)
4. Select SSH Key authentication method
5. Upload or paste a valid private key
6. Click "Test Connection"

### Expected Behavior
Connection test should succeed with a green checkmark

### Actual Behavior
Connection test fails with error: "Authentication failed. Please check your credentials."

### Environment
- SSM Version: 1.2.3
- Operating System: Ubuntu 22.04
- Browser: Chrome 115
- Private key type: RSA 2048-bit

### Additional Information
The same private key works fine when using SSH directly from the command line:
```ssh -i /path/to/key user@host```

I've verified the key has the correct permissions (600) and the format is correct.
```
</details>

## Troubleshooting Tips

Before seeking support, try these general troubleshooting steps:

1. **Check logs**:
   - Client console logs (Browser DevTools)
   - Server logs (in the server container or service)
   - Device agent logs (if applicable)

2. **Verify configuration**:
   - Environment variables
   - Docker Compose configuration
   - Network settings and connectivity

3. **Try simple remedies**:
   - Restart the SSM services/containers
   - Clear browser cache and cookies
   - Try a different browser
   - Check for recent updates that might have introduced changes

## Support SLAs and Expectations

As an open-source project, SSM operates on community support. Here's what to expect:

- **GitHub Issues**: Typically reviewed within 1-7 days
- **Discord Questions**: Often get responses within hours, depending on who's online
- **Critical Security Issues**: Prioritized for rapid response
- **Feature Requests**: Reviewed periodically, but no guarantees for implementation

## Contributing to Support

If you become experienced with SSM, consider helping others in these ways:

- Answer questions on Discord
- Respond to GitHub discussions
- Improve documentation when you find gaps
- Share your knowledge through blog posts or tutorials
