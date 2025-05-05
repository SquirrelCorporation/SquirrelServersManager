<script setup>
import NextStepCard from '/components/NextStepCard.vue';
import SectionHeader from '/components/SectionHeader.vue';
import PageHeader from '/components/PageHeader.vue';
</script>

<PageHeader 
  title="First Time Setup" 
  icon="🏁" 
  time="Estimated time: 5 minutes" 
/>

:::tip 🌰 In a Nutshell
- Create your administrator account
- Log in to the SSM dashboard
- Get familiar with the interface
- Set up your first device
:::


## First Login Experience

After [installing SSM](/docs/getting-started/installation), you'll be guided through a simple setup process to get your system up and running.

### Welcome Screen

The first time you access SSM, you'll see a welcome screen that introduces you to the application.

<div class="screenshot-container">
  <img src="/first-time-1.png" alt="SSM Welcome Screen" class="screenshot" />
  <div class="screenshot-caption">Welcome screen for first-time users</div>
</div>


### Creating Your Administrator Account

After going through the welcome screens, you'll be prompted to create an administrator account.

<div class="steps-container">
  <div class="step">
    <div class="step-number">1</div>
    <div class="step-content">
      <h4>Complete the Registration Form</h4>
      <p>Fill in the required information:</p>
      <ul>
        <li><strong>Full Name</strong>: Your name</li>
        <li><strong>Email Address</strong>: A valid email (used for login)</li>
        <li><strong>Password</strong>: A secure password</li>
      </ul>
      <div class="screenshot-container">
        <img src="/first-time-2.png" alt="Registration Form" class="screenshot" />
      </div>
    </div>
  </div>
  
  <div class="step">
    <div class="step-number">2</div>
    <div class="step-content">
      <h4>Set a Strong Password</h4>
      <div class="password-requirements">
        <h5>Password Requirements:</h5>
        <ul>
          <li>Minimum of 8 characters</li>
          <li>At least one uppercase letter (A-Z)</li>
          <li>At least one lowercase letter (a-z)</li>
          <li>At least one number (0-9)</li>
          <li>At least one special character (@, #, $, etc.)</li>
        </ul>
      </div>
      <p>Click the "Submit" button when you've completed the form.</p>
    </div>
  </div>
</div>

### Logging In

Once your administrator account is created, you'll be redirected to the login screen.

1. Enter your email address
2. Enter your password
3. Click the "Login" button

<div class="screenshot-container">
  <img src="/first-time-3.png" alt="Login Screen" class="screenshot" />
</div>

:::tip 💡 Remember Your Credentials
Store your administrator credentials in a secure password manager. There's no automated password reset process in self-hosted SSM installations.
:::

## Dashboard Overview

After logging in, you'll be taken to the SSM dashboard. This is your central hub for monitoring and managing all your devices and containers.

### Key Dashboard Elements

<div class="dashboard-elements">
  <div class="dashboard-element">
    <h4>📊 Statistics Overview</h4>
    <p>Key metrics about your devices and containers</p>
  </div>
  
  <div class="dashboard-element">
    <h4>🖥️ Device Status</h4>
    <p>Health and status of all connected devices</p>
  </div>
  
  <div class="dashboard-element">
    <h4>🐳 Container Summary</h4>
    <p>Running containers and resource usage</p>
  </div>
  
  <div class="dashboard-element">
    <h4>⚠️ Alerts & Notifications</h4>
    <p>Important system messages and updates</p>
  </div>
</div>


### Initial Dashboard State

When you first log in, your dashboard will be empty because no devices have been added yet. You'll see options to add your first device.

## Next Steps

Now that you're logged in, the next step is to add your first device to SSM.

<NextStepCard 
  icon="📱" 
  title="Add Your First Device" 
  description="Connect a server or device to SSM to start managing it" 
  link="/docs/user-guides/devices/adding-devices" 
/>

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

## Feedback & Support

<div class="feedback-section">
  <div class="feedback-header">Need Help?</div>
  <div class="feedback-content">
    <p>If you encounter any issues during your first-time setup, reach out for support:</p>
    <div class="feedback-links">
      <a href="https://github.com/SquirrelCorporation/SquirrelServersManager/issues" class="feedback-link">
        <span>🐛</span> Report an Issue
      </a>
      <a href="https://discord.gg/cnQjsFCGKJ" class="feedback-link">
        <span>💬</span> Ask on Discord
      </a>
    </div>
  </div>
</div>
