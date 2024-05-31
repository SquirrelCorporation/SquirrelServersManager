---
layout: page
---
<script setup>
import {   VPTeamPage,
  VPTeamPageTitle,
  VPTeamMembers } from 'vitepress/theme'

const members = [
  {
    avatar: 'https://avatars.githubusercontent.com/u/161006161?v=4',
    name: 'Manu Costa',
    title: 'Creator',
    links: [
      { icon: 'github', link: 'https://github.com/SquirrelCorporation' },
      { icon: 'twitter', link: 'https://twitter.com/SquirrelSrvrsMg' },
      { icon: 'linkedin', link: 'https://www.linkedin.com/in/emmanuelcosta/'}
    ]
  }
]
</script>
<VPTeamPage>
  <VPTeamPageTitle>
    <template #title>
        Team
    </template>
    <template #lead>
        The Squirrel project was originally created by Emmanuel Costa.
    </template>
  </VPTeamPageTitle>
    <VPTeamMembers size="small" :members="members" />
</VPTeamPage>
