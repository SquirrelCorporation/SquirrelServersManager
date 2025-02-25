# Remote Playbooks Repositories

## 🌰 In a Nutshell

:::info ℹ️ Sum-up
Remote playbooks repositories are Git repositories that will be cloned to your filesystem as separate folders.
:::

## Adding a new remote repository

![add-file](/playbooks/add-remote.gif)

To add a Git playbooks repository, you must provide the following information:
![add-file](/playbooks/add-remote-options.png)

| Field | Requires |Description |
|-------|:-------------:|-------------|
| Name | :red_circle:  |Repository name to be displayed in the Playbooks page |
| Git Service | :red_circle:  |Repository hosting service (GitHub, GitLab, Azure, Gitbucket) |
| Git Email | :red_circle:  |Email address associated with the access token |
| Git Username | :red_circle:  |Username associated with the access token |
| Branch | :red_circle:  |Branch to checkout and push changes to (e.g., master or main) |
| Access Token | :red_circle:  | Authentication token for repository access |
| IgnoreSSLErrors | :white_circle:  | Whether to ignore SSL errors when connecting to remote repository (e.g., for self-signed certificates) |
| Vaults | :white_circle: | Associated repository vaults. Define vault and password in Vault section first before linking here |
| Exclude Directories | :white_circle: | Paths to exclude from playbook execution list (useful for excluding roles, vars folders, etc.) |


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


---


:::info Volume path
By default, according to the docker-compose.yml, remote playbooks are stored on your filesystem thanks to a Docker volume `./.data.prod/playbooks:/playbooks`, meaning the files will be located locally on your system in `./.data.prod/playbooks/`
:::