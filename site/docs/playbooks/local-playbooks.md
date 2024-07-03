# Local Playbooks Repositories

:::info Volume path
By default, according to the docker-compose.yml, local playbooks are stored on your filesystem thanks to a docker volume  `./.data.prod/playbooks:/playbooks`, meaning the file will be located locally on your system in `./.data.prod/playbooks/` 
:::

## Creating a new local repository

In Settings > Playbooks tab, in the Local Repository panel, click on the blue button `Add a local repository`.
In the modal, enter a name and click `OK`. 
The playbook repository will be saved on your filesystem.

## Synchronisation 

- SSM **will not** listen to changes (addition/deletion) made outside it's interface unless a manual synchronization is triggered.
- Any changes made **inside** SSM will be automatically synchronized
If you believe SSM is desynchronized from the actual files structure of the repository, click 

## Delete a local repository

:::warning ⚠️ Destructive action
This action is permanent. Deleting a local repository will effectively delete the underlying files and directories permanently. Proceed with caution! 
:::

Click on the local repository to open the the modal, click on the `Delete` button.

