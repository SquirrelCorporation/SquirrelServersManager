# Playbooks

## 🌰 In a Nutshell

:::info Sum-up
- **Create Directory/Playbook**: Right-click parent directory title in the playbooks directory tree view.
- **Edit Playbooks**: Click on a playbook file to open the editor.
- **Save Changes**: Manually click the save button; no auto-save.
- **Sync Remote Repos**: Right-click root node for additional commit and sync options.
- **Playbooks Architecture**: Local (folder icon) and remote (git icon) repositories.
- **Default Playbooks**: Stored in `ssm-core` and `ssm-tools`. `_` prefixed playbooks in `ssm-core` cannot be deleted.
:::
![playbookspage](/playbooks/playbooks.png)

##
:::info Ansible playbooks
"Ansible Playbooks are lists of tasks that automatically execute for your specified inventory or groups of hosts. One or more Ansible tasks can be combined to make a play—an ordered grouping of tasks mapped to specific hosts—and tasks are executed in the order in which they are written."
[Reference](https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_intro.html)
:::

## Creating a directory or an empty playbook

- Directory: On the playbooks directory tree view, *right-click* on the **title** of the parent directory, and on the dropdown menu, click `Create a directory`
- Empty Playbook: On the playbooks directory tree view, *right-click* on the **title** of the parent directory, and on the dropdown menu, click `Create a playbook`

![add-file](/playbooks/add-file.gif)

:::warning Using your own repositories
While it is currently possible, we strongly advise creating your own repository for your custom playbooks instead of using `ssm-core` or `ssm-tools`. These custom repositories will be erased after each update of SSM.

It is better to create a [local](/docs/playbooks/local-playbooks) or [remote](/docs/playbooks/remote-playbooks) repository.
:::
## Editing playbooks

You can edit both the default playbooks as well as your own custom ones with the editor.

Just click on a playbook file and the editor will open.

![edit-file](/playbooks/edit-playbook.gif)

:::warning ⚠️ Playbooks are not saved automatically!
To prevent any unwanted modifications to a playbook's content, playbooks are not saved automatically.
You must click on the save button (bottom right floating menu)
:::

## Syncing playbooks (only for remote repositories)

When working with a [remote repository](/docs/playbooks/remote-playbooks), a *right-click* on the root node will offer you additional options, such as Commit & Syncing your changes, or force pulling from the repository

![edit-file](/playbooks/remote-dropdown.gif)

## Playbooks Architecture

The Playbooks page displays a list of `Playbooks Repositories`, that can be expanded to view a directory tree.

There are two types of `Playbooks Repository`:
**Local** and **Remote** repositories, symbolized respectively by the icons:
- ![localicon](/playbooks/local-storage-folder-solid.svg)
- ![localicon](/playbooks/git.svg)

## Default playbooks

SSM is shipped with several default playbooks to perform basic tasks such as installing the agent, updating the OS, rebooting, etc.
These playbooks are stored in two default repositories: `ssm-core` and `ssm-tools`
```yaml
- hosts: all
  tasks:
  - name: Unconditionally reboot the machine with all defaults
    ansible.builtin.reboot:
```
*Example of playbook for rebooting a device*

`ssm-core` playbooks start with '_' characters and cannot be deleted.

