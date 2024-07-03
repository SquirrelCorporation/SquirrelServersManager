# Playbooks

:::info Ansible playbooks
"Ansible Playbooks are lists of tasks that automatically execute for your specified inventory or groups of hosts. One or more Ansible tasks can be combined to make a play—an ordered grouping of tasks mapped to specific hosts—and tasks are executed in the order in which they are written."
[Reference](https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_intro.html)
:::

![playbookspage](/playbooks/playbooks.png)


## Creating a directory or an empty playbook

- Directory: On the playbooks directory tree view, *right-click* on the **title** of the parent directory, and on the dropdown menu, click `Create a directory`
- Empty Playbook: On the playbooks directory tree view, *right-click* on the **title** of the parent directory, and on the dropdown menu, click `Create a playbook`

![add-file](/playbooks/add-file.gif)

:::warning Using your own repositories
Even if, for the moment, it is possible, we really advice to create your own repository for your custom playbooks instead of using `ssm-core` or `ssm-tools`. Those default repositories will be erased after each update of SSM.

It is better to create a [local](/docs/playbooks/local-playbooks) or [remote](/docs/playbooks/remote-playbooks) repository.
:::
## Editing playbooks

You can edit the default playbooks as well as your own custom ones with the editor

Just click on a playbook file and the editor will open.

![playbooks1](/playbooks-1.png)

:::warning ⚠️ Playbooks are not saved automatically!
To prevent any unwanted modifications on playbooks content, playbooks are not saved automatically.
You must click on the save button (bottom right floating menu)
::: 


## Playbooks Architecture

The Playbooks page displays a list of `Playbooks Repositories`, that can be expanded to view a directory tree.

There are two type of `Playbooks Repository` :
**Local** and **Remote** repositories, symbolized respectively by the icons:
- ![localicon](/playbooks/local-storage-folder-solid.svg) 
- ![localicon](/playbooks/git.svg)


## Default playbooks

SSM is shipped with several default playbooks to operate basics tasks such as installing the agent, updating the OS, rebooting, etc...
Those playbooks are stored in two defaults repositories: `ssm-core` and `ssm-tools`
```yaml
- hosts: all
  tasks:
  - name: Unconditionally reboot the machine with all defaults
    ansible.builtin.reboot:
```
*Example of playbook for rebooting a device*

`ssm-core` playbooks are starting with '_' chars and cannot be deleted.


## Configuration of playbooks: ExtraVar

You can add and share ExtraVars across playbooks.
When a playbook is opened, click on the configuration tab above it, then click on the (+) icon on the top right side.
![playbooks2](/playbooks-2.png)

Enter a new name or select the name of an existing Extra var. Your custom var value is saved globally and can be re-used in others playbooks
![playbooks3](/playbooks-3.png)

To understand more about variables, see the [official Ansible documentation](https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_variables.html)
