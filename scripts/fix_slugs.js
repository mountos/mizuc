import fs from 'fs';
import path from 'path';

const POSTS_DIR = '/Users/mountos/Downloads/webDev/Mountos Institute/mizuc/content/posts';
const REDIRECTS_FILE = '/Users/mountos/Downloads/webDev/Mountos Institute/mizuc/public/_redirects';

const renameMap = {
  '%e4%bd%a0%e6%9c%80%e5%96%9c%e6%ad%a1%e8%a7%80%e7%9c%8b%e5%92%8c%e5%be%9e%e4%ba%8b%e7%9a%84%e9%81%8b%e5%8b%95%e6%98%af%e4%bb%80%e9%ba%bc.md': 'qa-favorite-sports-to-watch-and-play.md',
  '%e8%bb%8a%e7%ab%99%e5%89%8d%e6%97%85%e9%a4%a8.md': 'hotel-refusing-check-in-at-station.md'
};

function renameAndRedirect() {
  let redirects = fs.readFileSync(REDIRECTS_FILE, 'utf8');
  let count = 0;

  for (const [oldName, newName] of Object.entries(renameMap)) {
    const oldPath = path.join(POSTS_DIR, oldName);
    const newPath = path.join(POSTS_DIR, newName);

    if (fs.existsSync(oldPath)) {
      // Get the slug parts for redirect
      const oldSlug = oldName.replace('.md', '');
      const newSlug = newName.replace('.md', '');

      // Check if redirect already exists to avoid duplication
      if (!redirects.includes(`/${oldSlug}`)) {
        redirects += `/${oldSlug} /posts/${newSlug}/ 301\n`;
      }

      fs.renameSync(oldPath, newPath);
      console.log(`Renamed: ${oldName} -> ${newName}`);
      count++;
    }
  }

  fs.writeFileSync(REDIRECTS_FILE, redirects);
  console.log(`Successly renamed ${count} files and updated _redirects.`);
}

renameAndRedirect();
