---
layout: FeatureGuideLayout
title: "Local Playbooks"
icon: "✨"
time: "5 min read"
signetColor: '#8e44ad'
nextStep:
  icon: "➡️"
  title: "Remote Playbooks Repositories"
  description: "Continue to the next relevant section."
  link: "/docs/user-guides/repositories/remote-playbooks"
credits: true
---

:::info In a Nutshell (🌰)
Local Playbooks repositories are spaces to organize, create and edit your custom Ansible playbooks.
:::

## Creating a new local repository

![playbooks-add-local.gif](/images/playbooks-add-local.gif)

In Settings > Playbooks tab, in the Local Repository panel, click on the blue button `Add a new local repository`.
In the modal, enter a name and click `OK`.
The playbook repository will be saved on your filesystem.

## Synchronization

- SSM **will not** listen to changes (addition/deletion) made outside its interface unless a manual synchronization is triggered.
- Any changes made **inside** SSM will be automatically synchronized.
If you believe SSM is desynchronized from the actual file structure of the repository, click on `...` of the `Actions` button of the Repository modal, and click on `Sync to database`

![playbooks-manual-sync.gif](/images/playbooks-manual-sync.gif)

## Delete a local repository

:::warning ⚠️ Destructive action
This action is permanent. Deleting a local repository will effectively delete the underlying files and directories permanently. Proceed with caution!
:::

Click on the local repository to open the modal, then click on the `Delete` button.

![playbooks-delete-repo.png](/images/playbooks-delete-repo.png)

---

:::info Volume path
By default, according to the docker-compose.yml, local playbooks are stored on your filesystem thanks to a Docker volume `./.data.prod/playbooks:/playbooks`, meaning the files will be located locally on your system in `./.data.prod/playbooks/`
:::