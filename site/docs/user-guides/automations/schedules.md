---
layout: FeatureGuideLayout
title: "Managing Automation Schedules"
icon: 🕒
time: 5 min read
signetColor: '#e67e22'
nextStep:
  icon: 🖥️
  title: Device Management
  description: Return to managing your devices
  link: /docs/user-guides/devices/
credits: true
---

:::tip In a Nutshell (🌰)
- Optimize automation schedules for server performance
- Master cron expressions for precise timing control
- Avoid scheduling conflicts between related automations
- Monitor execution patterns to ensure reliability
:::

## Understanding Automation Scheduling

Effective scheduling is critical to getting the most from SSM's automation capabilities. Well-planned schedules ensure your tasks run at optimal times while minimizing resource usage and avoiding conflicts.

## Cron Expression Mastery

Cron expressions provide precise control over when your automations run. Here's how to use them effectively:

### Cron Expression Format

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

### Special Characters

- `*` - Any value (wildcard)
- `,` - Value list separator (e.g., `1,3,5`)
- `-` - Range of values (e.g., `1-5`)
- `/` - Step values (e.g., `*/5` means every 5 units)

### Common Schedule Patterns

| Schedule | Cron Expression | Description |
|----------|-----------------|-------------|
| Hourly | `0 * * * *` | At minute 0 of every hour |
| Every 15 minutes | `*/15 * * * *` | Every 15 minutes |
| Daily at midnight | `0 0 * * *` | At 00:00 every day |
| Weekdays at 8 AM | `0 8 * * 1-5` | At 8:00 AM, Monday through Friday |
| First day of month | `0 0 1 * *` | At midnight on the first of every month |
| Every Sunday at 2 AM | `0 2 * * 0` | At 2:00 AM every Sunday |

## Scheduling Best Practices

### Resource Optimization

To prevent overloading your systems, follow these guidelines:

1. **Stagger Heavy Tasks**: Avoid scheduling resource-intensive operations simultaneously
2. **Off-Peak Timing**: Schedule resource-intensive tasks during off-peak hours
3. **Consider Dependencies**: Schedule tasks that depend on others in the correct sequence

### Timezone Considerations

SSM schedules run in the server's local timezone. Keep this in mind when:
- Setting up schedules for systems in different timezones
- Planning for daylight saving time changes
- Coordinating automations across global infrastructure

:::warning
If you change the timezone on the server running SSM, remember to adjust your automation schedules accordingly.
:::

### Avoiding Scheduling Conflicts

To prevent automations from interfering with each other:

1. **Group Related Tasks**: Schedule related operations close together but not simultaneously
2. **Create Execution Windows**: Allocate specific time windows for different types of automations
3. **Consider Task Duration**: Allow enough time between tasks that might affect each other

### Schedule Examples for Common Scenarios

| Scenario | Recommended Schedule | Cron Expression |
|----------|----------------------|-----------------|
| Database backup | Daily, during off-hours | `0 2 * * *` |
| Log rotation | Weekly, on weekends | `0 4 * * 0` |
| Container updates | Weekly, with monitoring | `0 3 * * 6` |
| Monitoring checks | Frequent, but not excessive | `*/10 * * * *` |
| System updates | Monthly, with preparation | `0 1 1 * *` |

## Monitoring Schedule Performance

Regularly review your automation execution logs to:

1. **Verify Timing**: Ensure automations run at expected times
2. **Check Duration**: Identify tasks that take longer than expected
3. **Identify Patterns**: Look for trends in failures or performance issues
4. **Optimize Resources**: Adjust schedules to better distribute system load

<div class="screenshot-container">
  <img src="/images/automations-automation-logs.gif" alt="Monitoring Automation Logs" />
  <div class="screenshot-caption">Viewing automation logs to monitor performance</div>
</div>

## Advanced Scheduling Techniques

### Chaining Automations

For complex workflows that require sequential steps:

1. Create separate automations for each step
2. Schedule them with appropriate time buffers between steps
3. Use the logs to verify each step completes before the next begins

### Seasonal Adjustments

Consider adjusting your automation schedules based on:
- Business cycles (month-end processing, quarterly updates)
- Seasonal load patterns
- Maintenance windows

## Troubleshooting Schedule Issues

If your automations aren't running as expected:

| Step | Action |
|---|---|
| **Verify Cron Syntax** | Double-check your cron expressions for accuracy |
| **Check Server Time** | Ensure the server's time and timezone settings are correct |
| **Review Execution Logs** | Look for errors or irregular patterns |
| **Check Resource Usage** | High system load may delay automation execution |
| **Verify Dependencies** | Ensure prerequisites for your automations are available |
