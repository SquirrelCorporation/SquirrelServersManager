---
layout: home

title: 'Squirrel Servers Manager'
   
hero:
  name: 'Squirrel Servers Manager (SSM)'
  text: 'A user-friendly, UI/UX focused server & configuration management tool'
  tagline: 'Powered by Ansible & Docker'
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
      link: https://molecular-sibylla-squirrelserversmanager-1b05c91d.koyeb.app/
    - theme: alt
      text: Contribute
      link: /contribute/

features:
  - title: All your servers in one place
    details: Available for many different platforms
    icon:
      src: /flower-twirl.svg
  - title: Ansible & Docker Compatible
    details: Thanks to the power of Ansible and Docker, you can fully manage your servers, services, and configuration through SSM
    icon:
      src: /ansible.svg
  - title: Simple to use, yet powerful
    details: Although SSM focuses on ease of use, its flexibility enables you to create powerful and complex setups
    icon:
      src: /acorn.svg
  - title: Open Source
    details: SSM is open source. We pledge transparency, flexibility, and adaptability, allowing you to customize the software to your specific needs.
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

---

<div>
<iframe width="560" height="315" style="margin-left: auto; margin-right: auto" src="https://www.youtube.com/embed/zxWa21ypFCk?si=PXVOJZ31wwxLqUOv" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
</div>

## Experience the immense power encapsulated within these tools, now presented through a user-friendly interface.

🔌 We blend the automation powerhouse of Ansible with the portable setup of Docker in a clean and engaging interface.

🎭 Forget the days of command line complexities. Our simplified dashboard places the full potential of Ansible and Docker at your fingertips. Effortlessly navigate from deployment to monitoring via clicks, not code.

🎯 Born from a love for open-source, we've crafted this toolkit to be community-backed and user-focused. It's the ideal choice for developers and IT teams who crave simplicity without sacrificing power.

❤️ Rediscover Ansible and Docker as they unite under one intuitive, open-source interface. Welcome to simplicity and power in perfect harmony.

## Features

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

## Screenshots
### Dashboard
![dashboard](/home/dashboard.png)
### Devices
![devices](/home/devices.png)
### Services
![services](/home/services.png)
### Deploy
![store](/home/store.png)
### Playbook editor
![playbook](/home/playbook.png)
### Device Info
![deviceinfo](/home/device-info.png)
### Add a new device
![new-device](/home/new-device.png)


:::warning 🚧 Work in Progress
SSM is currently in active development and not yet ready for production. We encourage you to learn about [why we are building it](/about.md) and welcome community contributions. If you are interested in getting involved, check out the [Contribution Guide](/contribute/)!
:::
