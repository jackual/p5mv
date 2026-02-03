# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.0] - 2026-02-03

### Added

- **Integrated p5.js Editor** - Full p5.js web editor embedded in the app with URL persistence
- **Metadata Wizard** - Interactive tool to generate p5mv metadata tags for custom scenes
- **Scene Management System** - Complete overhaul of scene organization and workflow
  - Default Scenes - Built-in scenes included with p5mv
  - Project Scenes - Scenes bundled with your project
  - User Scenes - Personal scene library at `~/Videos/p5mv/Sketches/`
- **Scene Editing Interface** - Edit scene names and property labels directly in the UI
- **Scene Import/Export** - Import scenes from folders or zip files, export to user/project libraries
- **Drag and Drop** - Drag scenes between galleries to copy them
- **Conflict Resolution** - Smart dialogs when importing scenes with duplicate IDs
- **Loading States** - Visual feedback during scene import and conversion
- **Error Handling** - Improved error messages for scene import failures
- **Thumbnail Generation** - Automatic thumbnail creation for imported scenes
- **Property Editor** - Enhanced interface for editing scene input properties
- **Tooltips** - Comprehensive tooltips throughout the UI for better usability
- **Documentation** - Complete documentation overhaul with new Editor and Metadata Wizard guides
- **Code of Conduct** - Added contributing guidelines and code of conduct
- **CI-Friendly Tests** - Separated clean unit tests from file-system tests for CI/CD

### Changed

- Renamed "Preset Scenes" to "Default Scenes" for clarity
- Updated scene metadata system to use CDN-hosted p5mv.js and captureLib
- Improved scene conversion process to work with standard p5.js code
- Enhanced dialog styling and positioning
- Refactored scene page layout for better organization
- Updated renderer styles and progress indicators
- Modified render output path to `~/Movies/p5mv/Renders/`
- Improved ribbon controls and page navigation
- Updated project file handling with better IPC communication

### Fixed

- Fixed CommonJS import issues with `vulgar-fractions` module
- Fixed thumbnail generator with proper default inputs
- Fixed event listener cleanup to prevent memory leaks
- Fixed track tooltip positioning
- Fixed scene page height and scrolling issues
- Fixed dialog styling inconsistencies
- Fixed popup download timing issues
- Fixed scene input refresh bugs
- Fixed file type detection and handling
- Fixed capture library compatibility with standard p5.js sketches

### Developer

- Split scene methods into modular files
- Separated capture functions for better maintainability
- Added comprehensive test suite for scene conversion and properties
- Configured Vitest with separate configs for clean and all tests
- Improved .gitignore to exclude test artifacts
- Enhanced IPC handlers for better error handling

## [0.2.1] - 2025-12-XX

### Added

- Bundled FFmpeg for offline video encoding

### Fixed

- Various bug fixes and stability improvements

## [0.2.0] - 2025-12-XX

### Added

- Open and close project files with `.p5mvProject` format
- Project serialization system
- Comprehensive serialization tests

### Changed

- Improved project file handling

## [0.1.0] - 2025-XX-XX

### Added

- CI/CD workflow with GitHub Actions
- Unit tests for properties and keyframes
- Badge display in README

### Fixed

- Scene input handling with proper default values
- Fixed 0/NaN bug in scene inputs

## [0.0.3] - 2025-XX-XX

### Added

- Initial versioning system
- Basic project structure

## [0.0.2] - 2025-XX-XX

### Added

- GitHub Release workflow
- Version management

## [0.0.1] - 2025-XX-XX

### Added

- Initial release
- Basic timeline editor
- Scene rendering system
- Multi-track compositing

[0.3.0]: https://github.com/jackual/music-tl/compare/v0.2.1...v0.3.0
[0.2.1]: https://github.com/jackual/music-tl/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/jackual/music-tl/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/jackual/music-tl/compare/v0.0.3...v0.1.0
[0.0.3]: https://github.com/jackual/music-tl/compare/v0.0.2...v0.0.3
[0.0.2]: https://github.com/jackual/music-tl/compare/v0.0.1...v0.0.2
[0.0.1]: https://github.com/jackual/music-tl/releases/tag/v0.0.1
