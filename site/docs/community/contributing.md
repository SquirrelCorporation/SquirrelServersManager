---
layout: FeatureGuideLayout
title: "Contributing to SSM"
icon: 🤝
time: 15 min read
signetColor: '#00bcd4'
nextStep:
  icon: 🏷️
  title: Good First Issues
  description: Find beginner-friendly issues to get started with
  link: https://github.com/SquirrelCorporation/SquirrelServersManager/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22
credits: true
---
Thank you for your interest in contributing to Squirrel Servers Manager (SSM)! This guide will help you understand how to contribute effectively to the project, whether you're fixing bugs, adding features, improving documentation, or helping with design.


:::tip In a Nutshell (🌰)
- Contributions welcome in code, documentation, testing, and design
- Follow the 9-step contribution workflow for smooth collaboration
- Use project-specific coding standards and documentation templates
- Join our Discord community for real-time help and discussions
:::

## Contribution Workflow Overview

<MentalModelDiagram 
  title="Contribution Workflow" 
  imagePath="/images/contribution-workflow.svg" 
  altText="SSM Contribution Workflow Diagram" 
  caption="Figure 1: The 9-step contribution workflow for Squirrel Servers Manager" 
/>

## Ways to Contribute

There are many ways to contribute to SSM, regardless of your technical background:

<FeatureGrid>
  <FeatureCard 
    title="Code Contributions" 
    description="Fix bugs, add features, optimize performance, and improve the codebase." 
    icon="💻" 
  />
  <FeatureCard 
    title="Documentation" 
    description="Improve guides, create tutorials, fix errors, and make SSM easier to use." 
    icon="📝" 
  />
  <FeatureCard 
    title="Testing" 
    description="Help test SSM on different platforms, report bugs, and write automated tests." 
    icon="🧪" 
  />
  <FeatureCard 
    title="Design" 
    description="Enhance the UI/UX, create visual assets, and improve the overall design." 
    icon="🎨" 
  />
</FeatureGrid>

## Setting Up Your Development Environment

<ProcessSteps :steps="[
  { number: 1, title: 'Fork the Repository', description: 'Visit the https://github.com/SquirrelCorporation/SquirrelServersManager SSM GitHub repository and click the \'Fork\' button in the top right corner.' },
  { number: 2, title: 'Clone Your Fork', description: 'Clone your forked repository to your local machine.' },
  { number: 3, title: 'Install Dependencies', description: 'Install the required dependencies for both the server and client.' },
  { number: 4, title: 'Run in Development Mode', description: 'Start the development server and client to verify your setup.' }
]" />

### Step 1: Fork the Repository

1. Visit [SSM on GitHub](https://github.com/SquirrelCorporation/SquirrelServersManager)
2. Click the "Fork" button in the top-right corner
3. Wait for GitHub to create your copy of the repository

### Step 2: Clone Your Fork

```bash
git clone https://github.com/YOUR-USERNAME/SquirrelServersManager.git
cd SquirrelServersManager
```

### Step 3: Install Dependencies

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install

# Install shared-lib dependencies (if needed)
cd ../shared-lib
npm install
```

### Step 4: Run in Development Mode

```bash
# Start the server
cd server
npm run dev

# In a new terminal, start the client
cd client
npm run dev
```

Visit `http://localhost:8000` to see the application running.

## Finding Issues to Work On

<RequirementsGrid :requirements="[
  { header: 'Good First Issues', items: ['Small scope', 'Clear requirements', 'Labeled in GitHub', 'Good for beginners'] },
  { header: 'Feature Requests', items: ['Add new capabilities', 'Enhancement requests', 'UI/UX improvements', 'Performance optimizations'] },
  { header: 'Bug Fixes', items: ['Fix reported issues', 'Improve stability', 'Address edge cases', 'Solve usability problems'] },
  { header: 'Documentation', items: ['Fix typos/errors', 'Add missing information', 'Create tutorials', 'Improve existing guides'] }
]" />

We recommend starting with these types of issues:

1. Issues labeled [good first issue](https://github.com/SquirrelCorporation/SquirrelServersManager/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22)
2. Documentation improvements
3. Bug fixes with clear reproduction steps
4. Features you personally need or would use

## Making Changes

### Creating a Branch

Create a branch for your contribution with a descriptive name:

```bash
git checkout -b feature/my-contribution
```

Use these branch naming conventions:
- `feature/` for new features
- `bugfix/` for bug fixes
- `docs/` for documentation changes
- `refactor/` for code refactoring

### Code Style Guidelines

SSM follows specific code style guidelines to maintain code quality and consistency:

<details>
<summary>TypeScript/JavaScript Style Guide</summary>

- **Formatting**: 2-space indentation, LF line endings, single quotes
- **Naming Conventions**:
  - PascalCase for classes, interfaces, types, decorators
  - camelCase for variables, functions, methods
  - ALL_CAPS for constants
- **Code Structure**:
  - Limit function size (< 50 lines recommended)
  - Use meaningful variable names
  - Add comments for complex logic
- **Types**:
  - Use strict typing with interfaces and types
  - Avoid `any` type when possible
  - Define return types for functions
- **Testing**:
  - Write tests for new features
  - Cover edge cases
  - Aim for high code coverage
</details>

<details>
<summary>Server-Side Guidelines</summary>

- **NestJS Architecture**:
  - Follow the module pattern
  - Use dependency injection
  - Implement interfaces for services
  - Apply proper validation using DTOs
- **Module Encapsulation**:
  - Only export services, never repositories
  - Access functionality through service interfaces
  - Use tokens for injection (e.g., `DEVICES_SERVICE`)
- **Error Handling**:
  - Use standardized exception types
  - Include relevant context in errors
  - Follow the API error response format
</details>

<details>
<summary>Client-Side Guidelines</summary>

- **React Patterns**:
  - Use functional components with hooks
  - Implement proper state management
  - Follow Ant Design Pro patterns
  - Use composition over inheritance
- **UI/UX**:
  - Follow the existing design system
  - Ensure responsive design
  - Maintain accessibility standards
  - Consider performance impact
</details>

For more detailed guidelines, refer to:
- [Server CODE_GUIDELINES.md](https://github.com/SquirrelCorporation/SquirrelServersManager/blob/master/server/CODE_GUIDELINES.md)

### Testing Your Changes

Before submitting your changes, ensure they pass all tests:

```bash
# Run server tests
cd server
npm run test

# Run client tests
cd client
npm run test

# Run linting checks
npm run lint:check
```

Fix any issues that arise from these checks.

## Submitting Changes

### Creating a Pull Request

1. Ensure your code passes all tests and checks
2. Push your branch to your fork:
   ```bash
   git push origin feature/my-contribution
   ```
3. Visit your fork on GitHub and click the "Compare & pull request" button
4. Fill out the PR template with a clear description of your changes

### PR Description Best Practices

Write a descriptive pull request that:

- Clearly explains what your changes do
- References any related issues (`Fixes #123` or `Relates to #456`)
- Includes before/after screenshots for UI changes
- Lists any breaking changes or migrations required
- Mentions any testing you've done

### Code Review Process

After submitting your PR:

1. Automated CI/CD checks will run on your code
2. Maintainers will review your changes
3. Address any feedback or requested changes
4. Once approved, a maintainer will merge your PR

<PlatformNote platform="Pull Request Tips">
- Keep PRs focused on a single concern
- Break large features into smaller PRs
- Respond promptly to review comments
- Be open to feedback and suggestions
- Update your PR based on review feedback
</PlatformNote>

## Documentation Contributions

Documentation is crucial for SSM. When contributing documentation:

### Documentation Templates

All documentation **must** use one of the official templates:

1. [Feature Guide Template](/docs/templates/feature-guide-template.md)
2. [Concept Explanation Template](/docs/templates/concept-explanation-template.md)

### Documentation Best Practices

- Use clear, concise language
- Include screenshots for UI features
- Add diagrams for architecture concepts
- Follow the [Documentation Template Guide](/docs/developer/documentation-template)
- Ensure documentation is accessible to users of all skill levels

## Community Guidelines

When participating in the SSM community:

- **Be Respectful**: Treat all community members with respect
- **Be Constructive**: Provide helpful feedback and suggestions
- **Be Collaborative**: Work together to find solutions
- **Be Inclusive**: Welcome newcomers and help them get started
- **Be Patient**: Understand that maintainers are volunteers

## Getting Help

If you need assistance with your contribution:

- **Discord**: Join our [Discord server](https://discord.gg/cnQjsFCGKJ) for real-time help
- **GitHub Discussions**: Use [GitHub Discussions](https://github.com/SquirrelCorporation/SquirrelServersManager/discussions) for longer topics
- **Issue Comments**: Ask questions in the relevant issue
- **Documentation**: Check the [developer documentation](/docs/developer/) for guides

## Recognition

All contributors are valued members of the SSM community:

- Contributors are credited in release notes
- Significant contributions may receive special recognition
- Regular contributors may be invited to join the core team
