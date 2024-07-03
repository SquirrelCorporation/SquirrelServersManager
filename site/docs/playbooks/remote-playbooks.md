# Remote Playbooks Repositories

Remote playbooks repositories are Git repositories that will be clone to your filesystem as a separate folder.

## Adding a new remote repository

![add-file](/playbooks/add-remote.gif)

To add a git playbooks repository, you must must filled the following information:
- The `name` of the repo that will be displayed in the Playbooks page
- The `Git email` associated with the access token
- The `Git username` associated with the access token
- The `branch` to checkout and push changes to (e.g `master` or `main`)

![add-file](/playbooks/add-remote-options.png)

## Synchronisation

- SSM **will not** listen to changes (addition/deletion) made outside it's interface unless a manual synchronization is triggered.
- Any changes made **inside** SSM will be automatically synchronized
  If you believe SSM is desynchronized from the actual files structure of the repository, click on `...` of the `Actions` button of the Repository modal, and click on `Sync to database`

![add-file](/playbooks/manual-sync.gif)

## Delete a local repository

:::warning ⚠️ Destructive action
This action is permanent. Deleting a local repository will effectively delete the underlying files and directories permanently. Proceed with caution!
:::

![add-file](/playbooks/delete-repo.png)
