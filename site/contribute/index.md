# Contribution Guide

Contributions are always welcome, no matter how large or small! Here we summarize some general guidelines on how you can get involved in the SSM project.

## Submitting Issues And Writing Tests

We need your help! If you found a bug, it's best to [create an issue](https://github.com/SquirrelCorporation/SquirrelServersManager/issues) and follow the template we've created for you. Afterwards, create a [Pull Request](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request) that replicates the issue using a test.

## Developing SSM Server

In `server`, we use vitest unit tests for test coverage (in `./server/src/tests`).
[Reference](https://vitest.dev/)

# Submitting Contributions

Your contributions are highly appreciated. Here are some guidelines:

## Setting Up a Branch

Firstly, start by creating your own 'fork' of our repository.

```sh
# Clone the repository
git clone https://github.com/SquirrelCorporation/SquirrelServersManager.git

# Go to your local repository
cd SquirrelCorporation

# Ensure you are in the 'master' branch
playbooks-repository checkout master

# Pull the latest updates
playbooks-repository pull

# Create a new branch for your changes
playbooks-repository checkout -b <YOUR-BRANCH-NAME>
```

## Making Changes

As you implement your changes, keep in mind to:

- Follow the existing code style.
- Write clear, concise commit messages.

Run all tests before submitting to ensure they pass.

## Committing Your Changes

After your changes, commit and push them to your GitHub repository.

```sh
# Add changes
playbooks-repository add .

# Commit the changes
playbooks-repository commit -m "<COMMIT-MESSAGE>"

# Push your changes to your repository
playbooks-repository push origin <YOUR-BRANCH-NAME>
```

## Submitting a Pull Request

After pushing your changes, you can create a "pull request":

1. Go to the original repository you created your fork from.
2. Click on "Pull request".

On the "Pull request" page:

- Ensure the "base fork" is the original repository.
- Confirm the "base" is the branch where you want your changes – often 'master'.
- Assign "head fork" to your forked repository.
- Set "compare" to the branch with your changes.

Write a description of your changes and create the pull request.

## Review Process

Maintainers will review your submission and may provide feedback. If there are no issues, your changes will be merged.

The clearer your pull request description, the faster and smoother the review process.
