---
layout: FeatureGuideLayout
title: "First Steps"
icon: "👣" # Footprints icon
time: "5 min read"
signetColor: '#f1c40f'
nextStep:
  icon: "📱"
  title: "Add Your First Device"
  description: "Connect a server or device to SSM to start managing it"
  link: "/docs/user-guides/devices/adding-devices"
credits: true
---

<script setup>
import NextStepCard from '/components/NextStepCard.vue';
import SectionHeader from '/components/SectionHeader.vue';
import AdvantagesSection from '/components/AdvantagesSection.vue';
import FeedbackSupportSection from '/components/FeedbackSupportSection.vue';

const dashboardElements = [
  {
    icon: "📊",
    title: "Statistics Overview",
    description: "Key metrics about your devices and containers",
  },
  {
    icon: "🖥️",
    title: "Device Status",
    description: "Health and status of all connected devices",
  },
  {
    icon: "🐳",
    title: "Container Summary",
    description: "Running containers and resource usage",
  },
  {
    icon: "⚠️",
    title: "Alerts & Notifications",
    description: "Important system messages and updates",
  },
];
</script>


:::tip In a Nutshell (🌰)
- Create your administrator account
- Log in to the SSM dashboard
- Get familiar with the interface
- Set up your first device
:::


## First Login Experience

After [installing SSM](/docs/getting-started/installation), you'll be guided through a simple setup process to get your system up and running.

### Welcome Screen

The first time you access SSM, you'll see a welcome screen that introduces you to the application.

<MentalModelDiagram 
  imagePath="/images/first-time-1.png" 
  altText="SSM Feature Highlights" 
  caption="Welcome screen for first-time users" 
/>

### Creating Your Administrator Account

After going through the welcome screens, you'll be prompted to create an administrator account.

#### 1. Complete the Registration Form
Fill in the required information:
- **Full Name**: Your name
- **Email Address**: A valid email (used for login)
- **Password**: A secure password

<MentalModelDiagram 
  imagePath="/images/first-time-2.png" 
  altText="Registration Form" 
  caption="Registration Form" 
/>

#### 2. Set a Strong Password
##### Password Requirements:
- Minimum of 8 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one number (0-9)
- At least one special character (@, #, $, etc.)

Click the "Submit" button when you've completed the form.

### Logging In

Once your administrator account is created, you'll be redirected to the login screen.

1. Enter your email address
2. Enter your password
3. Click the "Login" button

<MentalModelDiagram 
  imagePath="/images/first-time-3.png" 
  altText="Login Screen" 
  caption="Login Screen" 
/>

:::tip 💡 Remember Your Credentials
Store your administrator credentials in a secure password manager. There's no automated password reset process in self-hosted SSM installations.
:::

## Dashboard Overview

After logging in, you'll be taken to the SSM dashboard. This is your central hub for monitoring and managing all your devices and containers.

### Key Dashboard Elements

<AdvantagesSection :advantagesData="dashboardElements" />

### Initial Dashboard State

When you first log in, your dashboard will be empty because no devices have been added yet. You'll see options to add your first device.

## Troubleshooting

<details>
<summary>Can't log in after creating account</summary>

If you're unable to log in after creating your account:

1. **Check your email address** - Ensure you're using exactly the same email address you registered with
2. **Verify your password** - Make sure caps lock is off and you're entering your password correctly
3. **Clear browser cache** - Try clearing your browser cache or using a private/incognito window
4. **Check browser storage** - Ensure your browser allows local storage for cookies

If you still can't log in, you can reset your administrator password by accessing the MongoDB database directly:

```bash
# Connect to the MongoDB container
docker exec -it mongo-ssm mongosh

# Switch to the SSM database
use ssm

# Reset password (replace with your email)
db.users.updateOne(
  { email: "your.email@example.com" },
  { $set: { password: "$2b$10$CZt6MqBEVu8abVXel6mnn.A6AJuWlI8qKpPyTZ6TYWLm2jCr7HvdG" } }
)
```

This will reset the password to `Password123!`. Be sure to change it immediately after logging in.
</details>

<details>
<summary>Blank screen after login</summary>

If you see a blank screen after login:

1. **Check browser console** - Open your browser developer tools (F12) and look for errors
2. **Verify server is running** - Ensure all SSM containers are running properly:
   ```bash
   docker compose ps
   ```
3. **Check server logs** - Look for any errors in the server logs:
   ```bash
   docker compose logs server
   ```

Most blank screen issues are related to JavaScript errors or API connection problems.
</details>


