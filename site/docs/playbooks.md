# Playbook

:::info Ansible playbooks
"Ansible Playbooks are lists of tasks that automatically execute for your specified inventory or groups of hosts. One or more Ansible tasks can be combined to make a play—an ordered grouping of tasks mapped to specific hosts—and tasks are executed in the order in which they are written."
[Reference](https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_intro.html)
:::

## Default playbooks

SSM is shipped with several default playbooks to operate basics tasks such as installing the agent, updating the OS, rebooting, etc...
```yaml
- hosts: all
  tasks:
  - name: Unconditionally reboot the machine with all defaults
    ansible.builtin.reboot:
```
*Example of playbook for rebooting a device*

Default playbooks are starting with '_' chars and cannot be deleted.
You can find the list of default playbooks [here](https://github.com/SquirrelCorporation/SquirrelServersManager/tree/master/server/src/ansible)

## Editing and creating playbooks

You can edit the default playbooks as well as creating your own custom ones with the editor

Go to the **"Playbooks"** section on the left menu, and click on a existing playbook or create a custom one

![playbooks1](/playbooks-1.png)

:::warning ⚠️ Playbooks are not saved automatically!
To prevent any unwanted modifications on playbooks content, playbooks are not saved automatically.
You must click on the save button (bottom right floating menu)
:::

## Configuration of playbooks: ExtraVar

You can add and share ExtraVars across playbooks.
When a playbook is opened, click on the configuration tab above it, then click on the (+) icon on the top right side.
![playbooks2](/playbooks-2.png)

Enter a new name or select the name of an existing Extra var. Your custom var value is saved globally and can be re-used in others playbooks
![playbooks3](/playbooks-3.png)

To understand more about variables, see the [official Ansible documentation](https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_variables.html)
