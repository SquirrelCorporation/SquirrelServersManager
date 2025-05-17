# Contributing to Squirrel Servers Manager (SSM) 🐿️

Thank you for your interest in contributing! SSM is a community-driven project, and we welcome contributions in code, documentation, testing, and design.

## 🚦 Quick Start

1. **Fork the repository** on GitHub.
2. **Clone your fork** to your local machine.
3. **Install dependencies** for each package (`server`, `client`, `shared-lib`).
4. **Create a branch** for your changes (`feature/`, `bugfix/`, `docs/`, `refactor/`).
5. **Make your changes** following our code and documentation guidelines.
6. **Test your changes** and run lint checks.
7. **Submit a Pull Request** with a clear description.

## 🛠️ Code Style & Standards

- **TypeScript/JavaScript**: 2-space indent, single quotes, LF line endings.
- **Naming**:
  - PascalCase for classes, interfaces, types, enums.
  - camelCase for variables, functions, methods.
  - ALL_CAPS for constants.
- **Architecture**: Follow clean architecture (domain, application, infrastructure, presentation).
- **Interfaces**: Prefix with `I` (e.g., `IContainerService`), use DI tokens.
- **DTOs**: PascalCase, singular entity names, in `dtos/` directories.
- **Error Handling**: Use standardized exceptions and error response format.
- **Testing**: Write/maintain tests for new features and bug fixes.

See [`server/CODE_GUIDELINES.md`](server/CODE_GUIDELINES.md) for full details.

## 📝 Documentation

- Use the official templates:
  - [Feature Guide Template](/docs/templates/feature-guide-template.md)
  - [Concept Explanation Template](/docs/templates/concept-explanation-template.md)
- Write clear, concise docs with screenshots/diagrams where helpful.
- Follow the [Documentation Template Guide](/docs/developer/documentation-template).

## 🧪 Testing

- Run all tests before submitting:
  ```bash
  cd server && npm run test
  cd client && npm run test
  ```
- Fix any issues before opening a PR.

## 💡 Pull Request Tips

- Keep PRs focused and small.
- Reference related issues (e.g., `Fixes #123`).
- Add before/after screenshots for UI changes.
- List any breaking changes or migrations.
- Respond promptly to review feedback.

## 🤝 Community & Help

- Be respectful, constructive, and inclusive.
- Join our [Discord](https://discord.gg/cnQjsFCGKJ) for real-time help.
- Use [GitHub Discussions](https://github.com/SquirrelCorporation/SquirrelServersManager/discussions) for longer topics.

## 🏆 Recognition

- All contributors are credited in release notes.
- Significant contributions may receive special recognition.

---

Thank you for helping make SSM better! 