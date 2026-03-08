import fs from 'fs';
import path from 'path';

const POSTS_DIR = '/Users/mountos/Downloads/webDev/Mountos Institute/mizuc/content/posts';

const fixes = [
  { old: '-scaled-1-scaled.jpeg', new: '-scaled-1.jpeg' },
  { old: '-scaled-1-scaled.jpg', new: '-scaled-1.jpg' }
];

function fixImageRefs() {
  const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md') || f.endsWith('.mdx'));
  let updatedCount = 0;

  files.forEach(file => {
    const filePath = path.join(POSTS_DIR, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let hasUpdate = false;

    fixes.forEach(fix => {
      if (content.includes(fix.old)) {
        content = content.replace(new RegExp(fix.old, 'g'), fix.new);
        hasUpdate = true;
      }
    });

    if (hasUpdate) {
      fs.writeFileSync(filePath, content);
      console.log(`Updated refs in ${file}`);
      updatedCount++;
    }
  });

  console.log(`Updated ${updatedCount} files with fixed image references.`);
}

fixImageRefs();
