# Remote Playbooks Repositories

Remote playbooks repositories are Git repositories that will be cloned to your filesystem as separate folders.

## Adding a new remote repository

![add-file](/playbooks/add-remote.gif)

To add a Git playbooks repository, you must provide the following information:
- The `name` of the repo that will be displayed in the Playbooks page
- The `Git email` associated with the access token
- The `Git username` associated with the access token
- The `branch` to checkout and push changes to (e.g., `master` or `main`)

![add-file](/playbooks/add-remote-options.png)

## Synchronization

- SSM **will not** listen to changes (addition/deletion) made outside its interface unless a manual synchronization is triggered.
- Any changes made **inside** SSM will be automatically synchronized.
  If you believe SSM is desynchronized from the actual file structure of the repository, click on `...` of the `Actions` button of the Repository modal, and click on `Sync to database`

![add-file](/playbooks/manual-sync.gif)

## Delete a remote repository

:::warning ⚠️ Destructive action
This action is permanent. Deleting a remote repository will effectively delete the underlying files and directories permanently. Proceed with caution!
:::

![add-file](/playbooks/delete-repo.png)
