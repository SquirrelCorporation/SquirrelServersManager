---
layout: FeatureGuideLayout
title: "Creating Automations"
icon: ✨
time: 8 min read
signetColor: '#e67e22'
nextStep:
  icon: 🕒
  title: Managing Schedules
  description: Learn how to configure automation schedules
  link: /docs/user-guides/automations/schedules
credits: true
---

:::tip In a Nutshell (🌰)
- Create new automations through the Automations page
- Configure a unique name, trigger type, and action details
- Choose from playbook execution or Docker operations
- Monitor execution logs to verify automation success
:::

## Creating Your First Automation

Automations help you maintain your infrastructure by automatically performing routine tasks at scheduled intervals. This guide will walk you through creating your first automation in SSM.

## Step 1: Access the Automations Page

Navigate to the **Automations** section in the main menu. This page displays all your existing automations and provides options to create new ones.

## Step 2: Open the Creation Form

Click the blue **Add a new automation** button to open the automation creation drawer.

<div class="screenshot-container">
  <img src="/images/automations-add-automation.gif" alt="Add Automation Process" />
  <div class="screenshot-caption">Opening the automation creation form</div>
</div>

## Step 3: Name Your Automation

Enter a unique, descriptive name for your automation. Choose a name that clearly identifies what the automation does, such as:
- "Weekly Container Cleanup"
- "Database Backup"
- "Log Rotation"

## Step 4: Configure a Trigger

Select a trigger type to determine when your automation will run. Currently, SSM supports cron-based scheduling.

<div class="screenshot-container">
  <img src="/images/automations-setup-cron.gif" alt="Setting up Cron Trigger" />
  <div class="screenshot-caption">Configuring a cron schedule</div>
</div>

### Cron Trigger Configuration

When selecting a Cron trigger, you can:
1. Use the visual scheduler to select time intervals
2. Enter a custom cron expression directly
3. Use predefined templates (hourly, daily, weekly, monthly)

:::tip Cron Expression Examples
- `*/30 * * * *` - Every 30 minutes
- `0 4 * * *` - Every day at 4:00 AM
- `0 0 * * 0` - Every Sunday at midnight
- `0 0 1 * *` - First day of every month at midnight
:::

## Step 5: Choose an Action

Select the action you want the automation to perform. SSM offers several action types:

### Playbook Action

Execute an Ansible playbook:
1. Select the **Playbook** action type
2. Choose a playbook from the dropdown
3. Select target devices for playbook execution
4. Configure any required variables

### Docker Action

Perform Docker container operations:
1. Select the **Docker Action** type
2. Choose the operation (start, stop, restart)
3. Select the target device
4. Choose the specific container

### Docker Volume Action

Manage Docker volumes:
1. Select the **Docker Volume Action** type
2. Choose the operation (backup, prune)
3. Select the target device
4. Choose the specific volume (if applicable)

## Step 6: Submit the Automation

Once you've configured all settings, click the **Submit** button to create your automation. The new automation will appear in your automations list and will begin running according to your configured schedule.

## Viewing Automation Logs

To verify that your automation is running correctly, you can view the execution logs:

<div class="screenshot-container">
  <img src="/images/automations-automation-logs.gif" alt="Viewing Automation Logs" />
  <div class="screenshot-caption">Accessing automation execution logs</div>
</div>

1. Find your automation in the list
2. Click the downward-facing arrow to expand options
3. Select **Show execution logs**
4. Review the execution history and details

The logs will show:
- Execution start and end times
- Success or failure status
- Detailed output from the performed action
- Any errors or warnings that occurred

## Managing Existing Automations

### Editing an Automation

To modify an existing automation:
1. Find the automation in the list
2. Click the edit icon (pencil)
3. Make your changes in the form
4. Click **Update** to save

### Disabling an Automation

To temporarily disable an automation without deleting it:
1. Find the automation in the list
2. Toggle the status switch to OFF

### Deleting an Automation

To permanently remove an automation:
1. Find the automation in the list
2. Click the downward-facing arrow
3. Select **Delete**
4. Confirm the deletion

:::warning
Deleting an automation cannot be undone. If you're unsure, consider disabling it instead.
:::