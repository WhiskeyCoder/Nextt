# Contributing to Nextt

Thank you for your interest in contributing to Nextt! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Git
- A Plex Media Server (for testing)
- TMDB API account (free)
- Overseerr instance (optional)

### Development Setup

1. **Fork the repository**
   ```bash
   git clone https://github.com/WhiskeyCoder/nextt.git
   cd nextt
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

## 🎯 How to Contribute

### Reporting Bugs
- Use the GitHub issue tracker
- Include detailed steps to reproduce the bug
- Provide your environment details (OS, Node.js version, etc.)
- Include error messages and screenshots if applicable

### Suggesting Features
- Use the GitHub issue tracker with the "enhancement" label
- Describe the feature and its benefits
- Consider the impact on existing functionality

### Code Contributions

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow the existing code style
   - Add tests if applicable
   - Update documentation as needed

3. **Test your changes**
   ```bash
   npm run lint
   npm run build
   ```

4. **Commit your changes**
   ```bash
   git commit -m "feat: add your feature description"
   ```

5. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request**
   - Provide a clear description of your changes
   - Reference any related issues
   - Include screenshots for UI changes

## 📝 Code Style Guidelines

### TypeScript/JavaScript
- Use TypeScript for all new code
- Follow ESLint configuration
- Use meaningful variable and function names
- Add JSDoc comments for complex functions

### React Components
- Use functional components with hooks
- Follow the existing component structure
- Use TypeScript interfaces for props
- Keep components focused and reusable

### CSS/Styling
- Use Tailwind CSS classes
- Follow the existing design patterns
- Ensure responsive design
- Maintain accessibility standards

## 🧪 Testing

### Running Tests
```bash
npm run test
```

### Writing Tests
- Write tests for new features
- Ensure good test coverage
- Use descriptive test names
- Test both success and error cases

## 📚 Documentation

### Code Documentation
- Add JSDoc comments for functions and classes
- Include examples for complex APIs
- Keep README.md updated
- Document configuration options

### User Documentation
- Update user-facing documentation
- Include screenshots for UI changes
- Provide clear setup instructions
- Document any new features

## 🔧 Development Workflow

### Branch Naming
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions or updates

### Commit Messages
Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:
- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Test changes
- `chore:` - Build process or auxiliary tool changes

### Pull Request Process
1. Ensure your code follows the style guidelines
2. Run tests and ensure they pass
3. Update documentation as needed
4. Provide a clear description of changes
5. Request review from maintainers

## 🐛 Debugging

### Common Issues
- **Build errors**: Check Node.js version and dependencies
- **API issues**: Verify API keys and network connectivity
- **UI problems**: Check browser console for errors

### Getting Help
- Check existing issues and discussions
- Join the community Discord server
- Ask questions in GitHub Discussions

## 📄 License

By contributing to Nextt, you agree that your contributions will be licensed under the MIT License.

## 🙏 Recognition

Contributors will be recognized in:
- The project README
- Release notes
- GitHub contributors page

Thank you for contributing to Nextt! 🎉 