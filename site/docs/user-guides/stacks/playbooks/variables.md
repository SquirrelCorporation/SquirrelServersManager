---
layout: FeatureGuideLayout
title: "Playbooks Variables"
icon: "🔄" # Refresh/variables icon
time: "5 min read"
signetColor: '#8e44ad'
nextStep:
  icon: "➡️"
  title: "Executing a playbook"
  description: "Continue to the next relevant section."
  link: "/docs/user-guides/stacks/playbooks/executing"
credits: true
---

:::info In a Nutshell (🌰)
- **CONTEXT Variables**: Auto-filled during playbook execution.
- **SHARED Variables**: Stored in the database, shared across playbooks, can be overridden.
- **MANUAL Variables**: Manually entered before execution.

- **Adding Variables**:
    - Use the configuration tab and `+` icon in the playbook.
    - Select the type, enter new or existing variable name, and provide values if needed.
:::

## Variable Types

SSM introduces three types of variables to include in your playbooks:

|  Variable   | Description                                                                                                                                                                                                                                                                           |
|:-----------:|:--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **CONTEXT** | A variable that is automatically filled by SSM during the run of the playbook.                                                                                                                                                                                                        |
| **SHARED**  | A variable stored in the database, available across playbooks and sharing the same value. It can be overridden for a process by entering a custom value. You can also change the saved value globally by clicking the `Overwrite` button in dedicated places. |
| **MANUAL**  | This variable is filled manually before each execution or can be defined when creating an automation.                                                                                                                                                                                        |

## Adding a Variable to a Playbook

You can add and share ExtraVars across playbooks. When a playbook is opened, click on the configuration tab above it, then click on the `+` icon on the top right side.
![playbooks-2.png](/images/playbooks-2.png)

Select a type, then enter a new name or select the name of an existing ExtraVar. Depending on the type of variable, you may need to enter a value.
![playbooks-3.png](/images/playbooks-3.png)

### Variable Options

|  Variable   |      Value       | Details                                                                        |
|:-----------:|:----------------:|:-------------------------------------------------------------------------------|
| **CONTEXT** |   :red_circle:   | Automatically filled by SSM at runtime                                         |
| **SHARED**  | :orange_circle:  | Not required if the variable already exists. Can be overridden for all playbooks |
| **MANUAL**  | :orange_circle:  | Will be entered before running a playbook                                      |

Setting a variable as `required` will make the variable mandatory before running a playbook. Ansible playbook execution will fail if a required variable is not defined, unless you set a default value:

```yaml
- name: Uninstall agent on targeted device
  vars:
    agent_log_path: "{{ _ssm_agentLogPath | default(omit) }}"
```

## CONTEXT Variables

|  Variable         | Description                           |
|:-----------------:|:--------------------------------------|
| `_ssm_deviceId`   | Internal SSM UUID of the device       |
| `_ssm_deviceIP`   | The device's last known IP address    |
| `_ssm_agentLogPath` | The path of the agent log directory  |

## 

To understand more about variables, see the [official Ansible documentation](https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_variables.html).
