---
layout: FeatureGuideLayout
title: "Automations Overview"
icon: 🤖
time: 5 min read
signetColor: '#e67e22'
nextStep:
  icon: ✨
  title: Creating Automations
  description: Learn how to create and manage automations
  link: /docs/user-guides/automations/creating
credits: true
---

:::tip In a Nutshell (🌰)
- Automations allow you to schedule tasks to run automatically
- Currently supports cron-based triggers for time scheduling
- Available actions include playbook execution and Docker operations
- Easy-to-use interface for managing and monitoring automation runs
:::

## What Are Automations?

Automations in Squirrel Servers Manager (SSM) allow you to schedule routine tasks to run automatically at specified intervals. This helps you maintain your infrastructure with minimal manual intervention.

Automations consist of two core elements:
- A **trigger** that determines when the automation will run
- An **action** that specifies what task will be performed

## Trigger Types

The trigger is the "when" of your automation - it determines the schedule or event that will initiate the action.

| Trigger Type | Description |
|--------------|-------------|
| **Cron** | Time-based scheduling using standard cron expression format |

:::info Future Enhancements
In future releases, SSM plans to add more trigger types including event-based triggers and webhooks.
:::

### Cron Expressions

Cron triggers use standard cron expressions to define schedules. A cron expression consists of five fields that represent:

```
┌───────────── minute (0 - 59)
│ ┌───────────── hour (0 - 23)
│ │ ┌───────────── day of the month (1 - 31)
│ │ │ ┌───────────── month (1 - 12)
│ │ │ │ ┌───────────── day of the week (0 - 6) (Sunday to Saturday)
│ │ │ │ │
│ │ │ │ │
* * * * *
```

Common examples:
- `*/5 * * * *` - Every 5 minutes
- `0 * * * *` - At the start of every hour
- `0 0 * * *` - At midnight every day
- `0 0 * * 0` - At midnight every Sunday

## Action Types

The action is the "what" of your automation - it determines the task that will be executed when the trigger activates.

| Action Type | Description |
|-------------|-------------|
| **Playbook** | Execute an Ansible playbook registered in SSM |
| **Docker Action** | Perform operations on Docker containers (start, stop, restart) |
| **Docker Volume Action** | Manage Docker volumes (backup, prune) |

Each action type has specific configuration options that allow you to customize its behavior.

## Managing Automations

You can manage your automations from the Automations page in SSM. From here, you can:

- View all configured automations
- Create new automations
- Monitor automation execution history
- View logs from previous automation runs
- Enable/disable individual automations
- Delete automations