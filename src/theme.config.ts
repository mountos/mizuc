import { defineThemeConfig } from './types'

export default defineThemeConfig({
  site: 'https://mizuc.com',
  title: '迷走客',
  description: '去探險，去感受，這個真實而獨特的世界。',
  author: '迷走客',
  navbarItems: [
    { label: 'Blog', href: '/posts/' },
    { label: 'Categories', href: '/categories/' },
    { label: 'Projects', href: '/projects/' },
    { label: 'Tags', href: '/tags/' },
    { label: 'About', href: '/about/' },
    {
      label: 'Other pages',
      children: [
        { label: 'Landing page', href: '/' },
        { label: '404 page', href: '/404' },
        { label: 'Author: Mizuc', href: '/authors/Mizuc/' },
        { label: 'Tag: documentation', href: '/tags/documentation/' }
      ]
    }
  ],
  footerItems: [
    {
      icon: 'tabler--brand-github',
      href: 'https://github.com/mountos/mizuc',
      label: 'Github'
    },
    {
      icon: 'tabler--rss',
      href: '/feed.xml',
      label: 'RSS feed'
    }
  ],

  // optional settings
  locale: 'zh-TW',
  mode: 'white',
  modeToggle: true,
  colorScheme: 'scheme-mono',
  openGraphImage: undefined,
  postsPerPage: 4,
  postsView: 'list',
  projectsPerPage: 3,
  projectsView: 'list',
  scrollProgress: false,
  scrollToTop: true,
  tagIcons: {
    tailwindcss: 'tabler--brand-tailwind',
    astro: 'tabler--brand-astro',
    documentation: 'tabler--book'
  },
  categoryMapping: {
    guide: '路引',
    walk: '行路',
    roam: '漫遊'
  },
  expressiveCodeThemes: ['vitesse-light', 'vitesse-black']
})
