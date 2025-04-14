#!/bin/bash

# Build script for Todo Tasks Manager plugin

echo "Building Todo Tasks Manager plugin..."

# Install dependencies
npm install

# Build TypeScript
npm run build

echo "Build completed successfully!" 