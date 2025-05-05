# Contributing to SSM

<div class="quick-start-header">
  <div class="quick-start-icon">🤝</div>
  <div class="quick-start-time">⏱️ Reading time: 10 minutes</div>
</div>

:::tip 🌰 In a Nutshell
- Contributions welcome in code, documentation, testing, and design
- Start with good first issues or documentation improvements
- Follow project coding conventions and documentation style guide
- Submit pull requests with clear descriptions of changes
- Join the community discussions on Discord and GitHub
:::

## Ways to Contribute

There are many ways to contribute to Squirrel Servers Manager, regardless of your technical background:

<div class="contribute-ways">
  <div class="contribute-way">
    <div class="contribute-icon">💻</div>
    <div>
      <h3>Code Contributions</h3>
      <p>Help improve SSM by fixing bugs, adding features, and optimizing code.</p>
      <ul>
        <li>Bug fixes</li>
        <li>Feature implementations</li>
        <li>Performance optimizations</li>
        <li>Tests and test improvements</li>
      </ul>
    </div>
  </div>
  
  <div class="contribute-way">
    <div class="contribute-icon">📝</div>
    <div>
      <h3>Documentation</h3>
      <p>Help make SSM more accessible through better documentation.</p>
      <ul>
        <li>Fix errors or unclear information</li>
        <li>Add missing documentation</li>
        <li>Create tutorials and guides</li>
        <li>Improve existing content</li>
      </ul>
    </div>
  </div>
  
  <div class="contribute-way">
    <div class="contribute-icon">🧪</div>
    <div>
      <h3>Testing</h3>
      <p>Help ensure SSM works reliably across different environments.</p>
      <ul>
        <li>Manual testing</li>
        <li>Automated test development</li>
        <li>Reproducing and documenting bugs</li>
        <li>Testing on different platforms</li>
      </ul>
    </div>
  </div>
  
  <div class="contribute-way">
    <div class="contribute-icon">🎨</div>
    <div>
      <h3>Design</h3>
      <p>Improve the user experience and visual design of SSM.</p>
      <ul>
        <li>UI enhancements</li>
        <li>UX improvements</li>
        <li>Icon and graphic design</li>
        <li>Design system contributions</li>
      </ul>
    </div>
  </div>
</div>

## Getting Started

### 1. Setting Up Your Development Environment

To get started with SSM development:

1. **Fork the Repository**:
   - Visit [SSM on GitHub](https://github.com/SquirrelCorporation/SquirrelServersManager)
   - Click the "Fork" button to create your own copy

2. **Clone Your Fork**:
   ```bash
   git clone https://github.com/YOUR-USERNAME/SquirrelServersManager.git
   cd SquirrelServersManager
   ```

3. **Install Dependencies**:
   ```bash
   # Server dependencies
   cd server
   npm install
   
   # Client dependencies
   cd ../client
   npm install
   ```

4. **Run in Development Mode**:
   ```bash
   # Start the server
   cd server
   npm run dev
   
   # In a new terminal, start the client
   cd client
   npm run dev
   ```

### 2. Finding Issues to Work On

We recommend starting with these types of issues:

- Issues labeled [good first issue](https://github.com/SquirrelCorporation/SquirrelServersManager/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22)
- Documentation improvements
- Bug fixes with clear reproduction steps
- Features you personally need or would use

### 3. Creating a Branch

Create a branch for your contribution:

```bash
git checkout -b feature/my-contribution
```

Use descriptive branch names:
- `feature/` for new features
- `fix/` for bug fixes
- `docs/` for documentation changes
- `refactor/` for code refactoring

## Contribution Guidelines

### Code Contributions

When contributing code to SSM:

1. **Follow Code Style**:
   - We use ESLint and Prettier for code formatting
   - Run `npm run lint` before submitting to check for issues
   - Follow the existing code style in the codebase

2. **Write Tests**:
   - Add tests for new features
   - Fix or update tests when fixing bugs
   - Ensure all tests pass with `npm run test`

3. **Keep Changes Focused**:
   - Each PR should address a single concern
   - Break large features into smaller, manageable PRs
   - Avoid unrelated changes in a single PR

4. **Document Your Code**:
   - Add JSDoc comments for functions and classes
   - Update README or documentation files when needed
   - Comment complex logic to explain the reasoning

### Documentation Contributions

When improving documentation:

1. **Follow the Style Guide**:
   - Use the [documentation templates](/docs/developer/documentation-template)
   - Maintain consistent formatting and tone
   - Include "In a Nutshell" summaries for complex topics

2. **Focus on Clarity**:
   - Use simple, direct language
   - Break complex ideas into smaller sections
   - Include examples where helpful

3. **Use Visual Elements**:
   - Add screenshots for UI-related documentation
   - Include diagrams for architectural concepts
   - Use code examples for developer documentation

4. **Check Links and References**:
   - Ensure all links work correctly
   - Verify cross-references to other documentation
   - Update references when content changes

## Pull Request Process

1. **Create a Pull Request**:
   - Push your branch to your fork
   - Create a PR from your fork to the main repository
   - Use the PR template to provide necessary information

2. **Describe Your Changes**:
   - Clearly explain what your PR does
   - Reference any related issues (`Fixes #123` or `Relates to #456`)
   - Include before/after screenshots for UI changes

3. **Code Review Process**:
   - A maintainer will review your PR
   - Address any feedback or requested changes
   - Be responsive to questions and comments

4. **Continuous Integration**:
   - Automated tests will run on your PR
   - Fix any issues that arise from the CI process
   - Ensure all checks pass before merging

5. **Merge and Deployment**:
   - Maintainers will merge approved PRs
   - Your changes will be included in the next release
   - You'll be credited for your contribution

## Community Guidelines

When participating in the SSM community:

- **Be Respectful**: Treat all community members with respect and kindness
- **Be Constructive**: Provide constructive feedback and suggestions
- **Be Collaborative**: Work together to find the best solutions
- **Be Inclusive**: Welcome newcomers and help them get started
- **Be Patient**: Understand that maintainers and reviewers are volunteers

## Getting Help

If you need help with your contribution:

- **Discord**: Join our [Discord server](https://discord.gg/cnQjsFCGKJ) for real-time help
- **GitHub Discussions**: Use [GitHub Discussions](https://github.com/SquirrelCorporation/SquirrelServersManager/discussions) for longer topics
- **Issue Comments**: Ask questions in the relevant issue
- **Documentation**: Check the [developer documentation](/docs/developer/) for guides

## Next Steps

Ready to start contributing? Check out:

<a href="https://github.com/SquirrelCorporation/SquirrelServersManager/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22" class="next-step-card">
  <div class="next-step-icon">🏷️</div>
  <h2>Good First Issues</h2>
  <div class="next-step-separator"></div>
  <p>Find beginner-friendly issues to get started with</p>
</a>