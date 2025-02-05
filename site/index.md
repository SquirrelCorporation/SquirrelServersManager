---
layout: home

title: 'Squirrel Servers Manager'
   
hero:
  name: 'Squirrel Servers Manager (SSM)'
  text: 'Powerful containers & servers management tool'
  tagline: 'Powered by Ansible, Docker & Prometheus'
  image:
    src: /logo.svg
    alt: SSM
    width: 360px
    height: 360px
  actions:
    - theme: brand
      text: Why SSM
      link: /about
    - theme: alt
      text: Demo
      link: https://demo.squirrelserversmanager.io
    - theme: alt
      text: Discord
      link: https://discord.gg/cnQjsFCGKJ

features:
  - title: Agentless
    details: Manage everything seamlessly over SSH — no agents required!
    icon:
      src: /flower-twirl.svg
  - title: Ansible & Docker Compatibility
    details: Harness the power of Ansible and Docker to manage servers, services, and configurations effortlessly through SSM.
    icon:
      src: /ansible.svg
  - title: Simple Yet Powerful
    details: Designed for ease of use, SSM provides the flexibility to create robust and complex setups, perfectly tailored to your needs.
    icon:
      src: /acorn.svg
  - title: Open Source
    details: SSM is fully open source, delivering transparency and adaptability. Customize the software to match your unique requirements.
    icon:
      src: /source-code.svg

---

<style>
:root {
  --vp-home-hero-name-color: transparent;
  --vp-home-hero-name-background: -webkit-linear-gradient(90deg, #FF5D13, #F0DB4F);

  --vp-home-hero-image-background-image: linear-gradient(-45deg, #bd34fe 50%, #47caff 50%);
  --vp-home-hero-image-filter: blur(44px);
}

@media (min-width: 640px) {
  :root {
    --vp-home-hero-image-filter: blur(56px);
  }
}

@media (min-width: 960px) {
  :root {
    --vp-home-hero-image-filter: blur(68px);
  }
}
</style>

## Try it now!
⭐️ Docker
```shell
 curl -sL https://getssm.io | bash 
```
⭐️ Proxmox (Beta):
```shell
bash -c "$(wget -qLO - https://getssm.io/proxmox)"
```
--- 

:::tip Stay informed
<div style="text-align:center">
<form name="contact" netlify>
  <p>
    <label>Your email: <input type="email" name="email" style="background-color: white; border-radius: 0.3em; width: 300px"/></label>
    <button type="submit" style="margin-left: 20px; background-color: #3a5ccc; border-radius: 0.3em; width: 60px">Send</button>
  </p>
</form>
</div>

&nbsp;
:::

## Experience the immense power encapsulated within these tools, now presented through a user-friendly interface.

🔌 We blend the automation powerhouse of Ansible with the portable setup of Docker in a clean and engaging interface.

🎭 Forget the days of command line complexities. Our simplified dashboard places the full potential of Ansible and Docker at your fingertips. Effortlessly navigate from deployment to monitoring via clicks, not code.

🎯 Born from a love for open-source, we've crafted this toolkit to be community-backed and user-focused. It's the ideal choice for developers and IT teams who crave simplicity without sacrificing power.

❤️ Rediscover Ansible and Docker as they unite under one intuitive, open-source interface. Welcome to simplicity and power in perfect harmony.

## <span style="display: flex; align-items: center;"><img src="/home/overview.svg" alt="tldr" style="margin-right: 8px;" />Features</span>

|                                            | Features                               | Description                                                                                                                            |
|:------------------------------------------:|:---------------------------------------|:---------------------------------------------------------------------------------------------------------------------------------------|
| ![statistics](/home/statistics.svg)        | **Metrics & Statistics**               | :white_circle: Monitor the main metrics of your servers (CPU, RAM, etc.) and detect anomalies                                          |
| ![playbooks](/home/playback-speed-bold.svg)| **Playbooks management and execution** | :white_circle: Manage your playbooks, both locally and remotely, and run them on your devices                                          |
| ![container](/home/container.svg)          | **Container Management**               | :white_circle: View all running containers, monitor their statistics, and receive alerts when updates are available                    |
| ![automation](/home/ibm-event-automation.svg)| **Automations**                        | :white_circle: Run actions on triggers like playbook execution or container actions                                                    |
| ![security](/home/security.svg)            | **Security**                           | :white_circle: We do our best to ensure your secrets and authentication info are secure using Ansible Vault and Bcrypt                 |
| ![advancedsettings](/home/advanced-settings.svg)| **Advanced configuration**             | :white_circle: SSM is user-friendly and easy to use, but it allows you to set up advanced options to fit your specific needs           |
| ![integration](/home/integration-general.svg)| **Integrations** (Coming soon)         | :white_circle: Trigger automations from other tools and call other services                                                            |
| ![libraries](/home/library-filled.svg)     | **Collections**                        | :white_circle: Install open source services on your devices with one click                                                             |

## <span style="display: flex; align-items: center;"><img src="/about/square-star.svg" alt="tldr" style="margin-right: 8px;" />Showcase</span>

<div style="text-align: center; display: flex; align-items: center;">
  <hr style="flex: 1; border: none; height: 1px; background-color: black; margin: 0 10px;" />
  <span>Dashboard</span>
  <hr style="flex: 1; border: none; height: 1px; background-color: black; margin: 0 10px;" />
</div>

<img src="/home/dashboard.png" alt="dashboard" style="border-radius: 10px; border: 2px solid #000; margin-bottom: 35px; margin-top: 15px" />

<div style="text-align: center; display: flex; align-items: center;">
  <hr style="flex: 1; border: none; height: 1px; background-color: black; margin: 0 10px;" />
  <span>Stacks</span>
  <hr style="flex: 1; border: none; height: 1px; background-color: black; margin: 0 10px;" />
</div>

<img src="/home/stacks.png" alt="stacks" style="border-radius: 10px; border: 2px solid #000; margin-bottom: 35px; margin-top: 15px" />

<div style="text-align: center; display: flex; align-items: center;">
  <hr style="flex: 1; border: none; height: 1px; background-color: black; margin: 0 10px;" />
  <span>Devices</span>
  <hr style="flex: 1; border: none; height: 1px; background-color: black; margin: 0 10px;" />
</div>

<img src="/home/devices.png" alt="devices" style="border-radius: 10px; border: 2px solid #000; margin-bottom: 35px; margin-top: 15px" />

<div style="text-align: center; display: flex; align-items: center;">
  <hr style="flex: 1; border: none; height: 1px; background-color: black; margin: 0 10px;" />
  <span>Services</span>
  <hr style="flex: 1; border: none; height: 1px; background-color: black; margin: 0 10px;" />
</div>

<img src="/home/services.png" alt="services" style="border-radius: 10px; border: 2px solid #000; margin-bottom: 35px; margin-top: 15px" />

<div style="text-align: center; display: flex; align-items: center;">
  <hr style="flex: 1; border: none; height: 1px; background-color: black; margin: 0 10px;" />
  <span>Deploy</span>
  <hr style="flex: 1; border: none; height: 1px; background-color: black; margin: 0 10px;" />
</div>

<img src="/home/store.png" alt="store" style="border-radius: 10px; border: 2px solid #000; margin-bottom: 35px; margin-top: 15px" />

<div style="text-align: center; display: flex; align-items: center;">
  <hr style="flex: 1; border: none; height: 1px; background-color: black; margin: 0 10px;" />
  <span>Playbook editor</span>
  <hr style="flex: 1; border: none; height: 1px; background-color: black; margin: 0 10px;" />
</div>

<img src="/home/playbook.png" alt="playbook" style="border-radius: 10px; border: 2px solid #000; margin-bottom: 35px; margin-top: 15px" />

<div style="text-align: center; display: flex; align-items: center;">
  <hr style="flex: 1; border: none; height: 1px; background-color: black; margin: 0 10px;" />
  <span>Device Info</span>
  <hr style="flex: 1; border: none; height: 1px; background-color: black; margin: 0 10px;" />
</div>

<img src="/home/device-info.png" alt="device info" style="border-radius: 10px; border: 2px solid #000; margin-bottom: 35px; margin-top: 15px" />

<div style="text-align: center; display: flex; align-items: center;">
  <hr style="flex: 1; border: none; height: 1px; background-color: black; margin: 0 10px;" />
  <span>Add a new device</span>
  <hr style="flex: 1; border: none; height: 1px; background-color: black; margin: 0 10px;" />
</div>

<img src="/home/new-device.png" alt="new device" style="border-radius: 10px; border: 2px solid #000; margin-bottom: 35px; margin-top: 15px" />

:::warning 🚧 Work in Progress
SSM is currently in active development and not yet ready for production. We encourage you to learn about [why we are building it](/about.md) and welcome community contributions. If you are interested in getting involved, check out the [Contribution Guide](/contribute/)!
:::
