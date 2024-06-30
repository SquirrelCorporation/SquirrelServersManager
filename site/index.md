---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: 'Squirrel Servers Manager (SSM)'
  text: 'A user friendly, UI/UX focus server & configuration management tool'
  tagline: 'Powered By Ansible & Docker'
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
      text: Contribute
      link: /contribute/

features:
  - title: All your servers in one place
    details: Available for a lot of different platforms
    icon:
      src: /flower-twirl.svg
  - title: Ansible & Docker Compatible
    details: Thanks to the power of Ansible and Docker, you can totally manage your servers, services and configuration from SSM
    icon:
      src: /playbooks.svg
  - title: Simple to use, yet powerful 
    details: Even is SSM is focused on easiness of use, it flexibility enables you to make powerful and complex setups
    icon:
      src: /acorn.svg
  - title: Open Source
    details: SSM is open source, we pledge for transparency, flexibility, and adaptability, allowing you to customize the software to your specific needs.
    icon:
      src: /source-code.svg
---

:::warning 🚧 Work in Progress
SSM is currently in active development and not usable for production yet. We encourage you to learn about [why we are building it](/about.md) and welcome community contributions. If you are interested in getting involved, check out the [Contribution Guide](/contribute/) !
:::

<div>
<iframe width="560" height="315" style="margin-left: auto; margin-right: auto" src="https://www.youtube.com/embed/8w_9QKz47uc?si=n1ySaHKivEmvz6wx" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
</div>

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

🎭 Forget the days of command line complexities. Our simplified dashboard places the full potential of Ansible and Docker at your fingertips. Effortlessly navigate deployment to monitoring via clicks, not code.

🎯 Born from a love for open-source, we've crafted this toolkit to be community-backed and user-focused. It's the ideal pick for developers and IT teams who crave simplicity without sacrificing power.

❤️ Rediscover Ansible and Docker as they unite under one intuitive, open-source interface. Welcome to simplicity and power in perfect harmony.


### Dashboard
![dashboard](/dashboard.png)
### Devices
![devices](/devices.png)
### Playbook editor
![playbook](/playbook.png)
### Device Info
![deviceinfo](/device-info.png)
