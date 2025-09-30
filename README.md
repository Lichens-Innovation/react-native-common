- [React Native Common Module](#react-native-common-module)
  - [Reusable Components](#reusable-components)
  - [Services, Utilities and Hooks](#services-utilities-and-hooks)
  - [Consume in a project](#consume-in-a-project)
    - [Installation](#installation)
    - [Basic Usage Example](#basic-usage-example)
  - [Contributions](#contributions)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation-1)
    - [Scripts](#scripts)
  - [Peer Dependencies](#peer-dependencies)
    - [Why Peer Dependencies?](#why-peer-dependencies)
    - [Our Implementation Strategy](#our-implementation-strategy)
    - [Why devDependencies + peerDependencies?](#why-devdependencies--peerdependencies)
  - [WinRT integration](#winrt-integration)
  - [Project coding guidelines](#project-coding-guidelines)
  - [License](#license)

# React Native Common Module

This repository contains common components, utilities, and services used across React Native Expo applications.

## Reusable Components

- Safe area containers, centered layouts, tab bar components
- ErrorBoundary, Snackbar notifications, loading spinners, progress indicators
- various interactive components (dropdowns, bottom sheets, etc.)
- global theme and light/dark modes support

## Services, Utilities and Hooks

- `@tanstack/react-query` hooks
- `MMKV`-based efficient data persistence (native storage solution)
- HTTP `Axios` configuration, Digest authentication support
- File operations, image processing, filename management
- Device detection (`Bonjour` service) environment config
- WiFi and available networks detection
- hooks for Expo updates detection, image picking, animations...
- `WebView` integration hooks and utilities
- I18N internationalization (`i18next` setup and files)
- `logging` service (`Sentry`, file-base, console, in-memory)
- various helper functions (strings, dates, base64...)
- types, interfaces, constants

## Consume in a project

### Installation

```bash
yarn add @Lichens-Innovation/react-native-common
```

### Basic Usage Example

Here's how to import and use the `DialogOkCancel` component:

```tsx
import { DialogOkCancel } from '@Lichens-Innovation/react-native-common';
import React, { useState } from 'react';
import { Button } from 'react-native-paper';

export const MyComponent = () => {
  const [showDialog, setShowDialog] = useState(false);

  const handleOk = () => {
    console.log('User confirmed');
    setShowDialog(false);
  };

  const handleCancel = () => {
    console.log('User cancelled');
    setShowDialog(false);
  };

  return (
    <>
      <Button 
        title="Show Dialog" 
        onPress={() => setShowDialog(true)} 
      />
      
      <DialogOkCancel
        isVisible={showDialog}
        title="Confirm Action"
        description="Are you sure you want to proceed with this action?"
        onOk={handleOk}
        onCancel={handleCancel}
      />
    </>
  );
};
```

## Contributions

Contributions to the project are made by simply improving the current codebase and then creating a Pull Request. If the version field in `package.json` is incremented, the build will be automatically triggered when the PR is merged into the `main` branch, and the new version will be published to our enterprise Git repository.

### Prerequisites

- Node.js (v16 or higher)
- Yarn
- React Native development environment set up (see [React Native documentation](https://reactnative.dev/docs/environment-setup))

### Installation

```bash
git clone https://github.com/Lichens-Innovation/react-native-common.git
cd react-native-common
yarn install
```

### Scripts

| Command           | Description                                         |
|-------------------|-----------------------------------------------------|
| `yarn build`      | Cleans the dist folder and compiles TypeScript      |
| `yarn clean:node` | Removes node_modules directories and yarn.lock file |
| `yarn clean:dist` | Removes the dist directory                          |
| `yarn test`       | Runs tests using Vitest                             |
| `yarn typecheck` | Checks TypeScript types without emitting files       |


## Peer Dependencies

This package uses a **peer dependencies** approach for all React Native, Expo, and shared ecosystem libraries. Here's why and how it works:

### Why Peer Dependencies?

- **Avoid duplicate packages**: Prevents bundling the same libraries multiple times in the final app
- **Version control**: The consuming app controls the exact versions of critical dependencies like React Native and Expo
- **Bundle size optimization**: Reduces the final app bundle size by sharing common dependencies
- **Consistency**: Ensures all parts of the app use the same version of core libraries

### Our Implementation Strategy

We keep dependencies in three categories:

1. **`dependencies`**: Pure utility libraries specific to this package (date-fns, immer, handlebars, etc.)
2. **`devDependencies`**: All React Native, Expo, and ecosystem packages needed for compilation and type checking
3. **`peerDependencies`**: Same packages as devDependencies, indicating what the consuming app must provide

### Why devDependencies + peerDependencies?

This dual approach solves the compilation problem while maintaining clean dependency resolution:

- **`devDependencies`** provide the necessary packages and types for TypeScript compilation
- **`peerDependencies`** inform the consuming app about required dependencies and versions
- The final app bundle only includes one copy of each shared dependency

## WinRT integration

Interfaces and types are generated by the `react-native-winrt` package at build time of the desktop application. To ensure compatibility and avoid conflicts, the generated types should be placed in the `src/types/winrt` folder of current project. Here's how to do it. Copy all generated types from:

  - `rinno-manufacture-app-desktop\node_modules\react-native-winrt\windows\WinRTTurboModule\Generated Files\types\`
  - to `src\types\winrt\`

## Project coding guidelines

Adhering to established coding guidelines is essential for developing efficient, maintainable, and scalable software. These guidelines promote consistency across codebases, making it easier for teams to collaborate and for new developers to understand existing code. By following standardized patterns, such as those outlined in the [Coding guidelines](https://github.com/amwebexpert/chrome-extensions-collection/blob/master/packages/coding-guide-helper/public/markdowns/table-of-content.md), developers can reduce errors and enhance code readability.

* [Coding guidelines](https://github.com/amwebexpert/chrome-extensions-collection/blob/master/packages/coding-guide-helper/public/markdowns/table-of-content.md)


## License

This project is proprietary and confidential. Unauthorized copying, transferring, or reproduction of the contents, via any medium, is strictly prohibited.
