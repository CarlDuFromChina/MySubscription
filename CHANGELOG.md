# Changelog

All notable changes to the Subscription Manager project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial project setup with Electron + Vue.js frontend
- Backend API with Node.js + Express + PostgreSQL
- User authentication and registration system
- Subscription management with CRUD operations
- Local and cloud data synchronization
- Docker containerization for backend services
- GitHub Actions CI/CD pipelines for automated builds and deployments
- Comprehensive documentation and setup guides

### Backend Features
- RESTful API for subscription management
- JWT-based authentication
- PostgreSQL database integration
- Docker support with development and production configurations
- Health check endpoints
- Environment-based configuration

### Frontend Features
- Electron desktop application
- Vue.js with Element UI components
- Responsive table with native filtering
- Account registration and login interface
- Sync status indicator
- Local/cloud mode switching
- Real-time data synchronization

### DevOps & Automation
- Docker Compose for local development
- Multi-stage Docker builds for production
- GitHub Actions workflows for:
  - Automated testing and code quality checks
  - Docker image building and publishing to GitHub Container Registry
  - Cross-platform Electron app building (Windows, macOS, Linux)
  - Automated deployments to development, staging, and production environments
  - Security vulnerability scanning with Trivy
  - SBOM (Software Bill of Materials) generation
- Release management automation with version bumping and changelog generation

### Documentation
- Comprehensive setup and deployment guides
- User manual with screenshots and step-by-step instructions
- Docker deployment documentation
- API documentation
- Synchronization and authentication flow documentation

### Security
- JWT token-based authentication
- Password hashing with bcrypt
- Environment variable security
- Container security scanning
- HTTPS configuration support

## [0.0.1] - 2024-01-01

### Added
- Initial project structure
- Basic Electron application setup
- Vue.js frontend framework integration

---

## Release Process

To create a new release:

1. **Patch Release** (bug fixes): `npm run release:patch`
2. **Minor Release** (new features): `npm run release:minor`
3. **Major Release** (breaking changes): `npm run release:major`

### Automatic Deployments

- **Development**: Triggered on push to `develop` branch
- **Staging**: Triggered on push to `release/*` branches
- **Production**: Triggered on push to `main` branch or release tags

### Docker Images

Backend API images are automatically built and published to:
- `ghcr.io/your-org/subscription-manager:latest` (main branch)
- `ghcr.io/your-org/subscription-manager:develop` (develop branch)
- `ghcr.io/your-org/subscription-manager:v1.x.x` (release tags)

### Electron Releases

Desktop application releases are created for:
- Windows (.exe installer)
- macOS (.dmg installer)
- Linux (.AppImage)

Download the latest releases from the [GitHub Releases](https://github.com/your-org/subscription-manager/releases) page.
