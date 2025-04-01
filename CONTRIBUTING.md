# ShipIt's Contributing guidelines

## Getting Started

For detailed setup instructions, please refer to the [README](./README.md).

## Development Workflow

1. Fork the repository
2. Create a new branch: `git checkout -b your-branch-name`
3. Make your changes
4. Run tests and linting: `bun run lint` and `bun run test`
5. Commit your changes following the commit message conventions
6. Push to your fork: `git push origin your-branch-name`
7. Create a pull request

## Pull Request Process

1. Ensure your code follows the style guidelines
2. Update documentation if necessary
3. Add tests for new features
4. Ensure all tests pass
5. Submit a pull request
6. Get approval from at least one maintainer
7. Your PR will be merged by a maintainer

## Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```shell
<type>: <description>

[optional body]

[optional footer(s)]
```

Types include:

- feat: A new feature
- fix: A bug fix
- docs: Documentation changes
- style: Code style changes (formatting, etc.)
- refactor: Code refactoring
- test: Adding or updating tests
- chore: Maintenance tasks

Example: `feat: add user profile page`

## Coding Standards

- Follow ESLint and Prettier configurations
- Use functional components with hooks
- Use TypeScript for type safety
- Include meaningful comments

## Testing

WIP

Happy contributing!
