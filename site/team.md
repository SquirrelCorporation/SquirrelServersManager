<script setup>
import { VPTeamMembers } from 'vitepress/theme'

const members = [
  {
    avatar: 'https://avatars.githubusercontent.com/u/161006161?v=4',
    name: 'Manu Costa',
    links: [
      { icon: 'github', link: 'https://github.com/SquirrelCorporation' },
      { icon: 'twitter', link: 'https://twitter.com/SquirrelSrvrsMg' }
    ]
  }
]
</script>

# Team

The Squirrel project was originally created by [Emmanuel Costa](https://github.com/SquirrelCorporation).

<VPTeamMembers size="small" :members="members" />
