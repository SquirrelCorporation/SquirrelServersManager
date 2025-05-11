---
layout: FeatureGuideLayout
title: "Exec Playbook"
icon: "▶️" # Play button icon
time: "5 min read"
signetColor: '#8e44ad'
credits: true
---

As a core feature of SSM, executing a playbook can be done from multiple locations across the interface.

## In a Nutshell (🌰)

:::info Sum-up
- **Devices Panel**: Apply playbook to all devices with "Apply to All" or to individual devices via drop-down.
- **Inventory Panel**: Select one or multiple devices and execute playbooks with customizable options.
- **Playbook Modal**: Override variables before execution; choose `Apply`, `Check`, or `Check and Diff` modes to control modifications.
- **Execution Logs**: Monitor execution progress and logs in the terminal modal for real-time feedback.
::: 

## 1.A. Executing a playbook from the Devices panel

From the Devices panel, you can apply a playbook **to all your devices** using the "Apply to All" button in the top right corner.

![exec-playbook-1.png](/images/exec-playbook-1.png)

You can also apply a playbook to only one device by clicking on the drop-down arrow in the device line and selecting "Execute a playbook".

![exec-playbook-2.png](/images/exec-playbook-2.png)

![exec-playbook-3.png](/images/exec-playbook-3.png)

## 1.B. Executing a playbook from the Inventory panel

The Inventory panel provides a more customizable way of applying playbooks to your devices.
You can select one or more devices and choose a playbook to execute.

![exec-playbook-4.png](/images/exec-playbook-4.png)

## 2. Playbook selection modal

Before executing your playbook, you can choose to override the variables contained in the playbook.

[See  Variables](/docs/user-guides/stacks/playbooks/variables)

![exec-playbook-5.png](/images/exec-playbook-5.png)
Without clicking on "Overwrite", the value will be used only for this execution.

[See official documentation](https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_variables.html)

### Playbook execution mode

- <b>By default</b>, SSM will `Apply` the playbook, i.e. the modification will be written on the target. 
- Alternatively, you can use `Check` to see what changes would be made without applying them, 
  - or `Check and Diff` to both check for potential changes and see the diffs without applying the modifications.

## 3. Following your playbook execution

Once the playbook is launched, the terminal modal will open where you will see the logs and status of the current execution.

![exec-playbook-6.png](/images/exec-playbook-6.png)
