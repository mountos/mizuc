import fs from 'fs';
import path from 'path';

const POSTS_DIR = '/Users/mountos/Downloads/webDev/Mountos Institute/mizuc/content/posts';

async function addHeroImageField() {
  const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md') || f.endsWith('.mdx'));
  let updatedCount = 0;

  files.forEach(file => {
    const filePath = path.join(POSTS_DIR, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Simple regex to check if it's already there
    if (!content.includes('heroImage:')) {
      // Find the position after tags: [...]
      // Tags usually looks like tags: ["..."]
      const lines = content.split('\n');
      const tagsIndex = lines.findIndex(line => line.trim().startsWith('tags:'));
      
      if (tagsIndex !== -1) {
        lines.splice(tagsIndex + 1, 0, 'heroImage: ""');
        const newContent = lines.join('\n');
        fs.writeFileSync(filePath, newContent);
        updatedCount++;
      } else {
        // Fallback: insert before the second ---
        const firstSeparator = content.indexOf('---');
        const secondSeparator = content.indexOf('---', firstSeparator + 3);
        if (secondSeparator !== -1) {
            const before = content.substring(0, secondSeparator);
            const after = content.substring(secondSeparator);
            fs.writeFileSync(filePath, before + 'heroImage: ""\n' + after);
            updatedCount++;
        }
      }
    }
  });

  console.log(`Updated ${updatedCount} files with heroImage field.`);
}

addHeroImageField();
