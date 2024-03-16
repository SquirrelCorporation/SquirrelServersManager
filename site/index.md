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
      link: /contrib-guide/

features:
  - title: All your servers in one place
    details: Available for a lot of different platforms
    icon:
      src: /flower-twirl.svg
  - title: Ansible & Docker Compatible
    details: Thanks to the power of Ansible and Docker, you can totally manage your servers, services and configuration from SSM
    icon:
      src: /ansible.svg
  - title: Simple to use, yet powerful 
    details: Even is SSM is focused on easiness of use, it flexibility enables you to make powerful and complex setups
    icon:
      src: /acorn.svg
---

:::warning Work in Progress
SSM is currently in active development and not usable for production yet. We encourage you to learn about [why we are building it](/about.md) and welcome community contributions. If you are interested in getting involved, check out the [Contribution Guide](/contrib-guide/) !
:::

<style>
:root {
  --vp-home-hero-name-color: transparent;
  --vp-home-hero-name-background: -webkit-linear-gradient(90deg, #FF5D13, #F0DB4F);
}
</style>

### Stay informed
<form name="contact" netlify>
  <p>
    <label>Email <input type="email" name="email" /></label>
  </p>
  <p>
    <button type="submit">Send</button>
  </p>
</form>

### Dashboard
![dashboard](/dashboard.png)
### Devices
![devices](/devices.png)
### Playbook editor
![playbook](/playbook.png)
### Device Info
![deviceinfo](/device-info.png)
