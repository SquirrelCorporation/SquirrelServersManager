# Project Release Process

This document provides steps on how to release our project. The process involves the creation of a new Git tag which automatically triggers a Docker build and publish workflow.

## Preparing for Release

Before initiating a new release, ensure you have pulled the latest changes from the master branch in your Git repository and all tests are passing.

```sh
# Pull the latest changes from the remote repository
git pull origin master

# Run your tests to ensure everything works as expected
npm  test
```

## Creating a Git Tag

Once your master branch is up to date and tests are passing, create a new Git tag for the release. This project follows semantic versioning.

```sh
# The format is v<MAJOR>.<MINOR>.<PATCH>
# For example:
git tag v1.0.0
```

After creating the new tag, it needs to be pushed to the GitHub repository.

```sh
git push origin v1.0.0
```
