---
layout: FeatureGuideLayout
title: "Remote Stack Repositories"
icon: "☁️"
signetColor: '#e67e22' # Orange for Stacks
time: 5 min read
---


Remote stacks repositories are Git repositories that will be cloned to your filesystem as separate folders.

## Adding a new remote repository

To add a Git playbooks repository, you must provide the following information:
- The `Name` of the repo that will be displayed in the Playbooks page
- The `Git Service` of the repo (e.g: `Github`, `Gitlab`, `Azure`, `Gitbucket`)
- The `Git email` associated with the access token
- The `Git username` associated with the access token
- The `Branch` to checkout and push changes to (e.g., `master` or `main`)
- The `Access Token` associated with the user
- `Match files`: SSM will only import files matching the given patterns


![compose-add-remote-options-2.png](/images/compose-add-remote-options-2.png)

## Synchronization

- SSM **will not** listen to changes (addition/deletion) made outside its interface unless a manual synchronization is triggered.
- Any changes made **inside** SSM will be automatically synchronized.
  If you believe SSM is desynchronized from the actual file structure of the repository, click on `...` of the `Actions` button of the Repository modal, and click on `Sync to database`

![playbooks-manual-sync.gif](/images/playbooks-manual-sync.gif)

## Delete a remote repository

:::warning ⚠️ Destructive action
This action is permanent. Deleting a remote repository will effectively delete the underlying files and directories permanently. Proceed with caution!
:::

![playbooks-delete-repo.png](/images/playbooks-delete-repo.png)
