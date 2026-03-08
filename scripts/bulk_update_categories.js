import fs from 'fs';
import path from 'path';

const POSTS_DIR = '/Users/mountos/Downloads/webDev/Mountos Institute/mizuc/content/posts';

const mapping = {
  '旅行指南': 'guide',
  '行路趣聞': 'walk',
  '迷走故事': 'roam'
};

function bulkUpdateCategories() {
  const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md') || f.endsWith('.mdx'));
  let updatedCount = 0;

  files.forEach(file => {
    const filePath = path.join(POSTS_DIR, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let hasUpdate = false;

    // Use regex to catch the category: "..."
    for (const [chinese, english] of Object.entries(mapping)) {
      const regex = new RegExp(`category: "${chinese}"`, 'g');
      if (content.match(regex)) {
        content = content.replace(regex, `category: "${english}"`);
        hasUpdate = true;
      }
    }

    if (hasUpdate) {
      fs.writeFileSync(filePath, content);
      updatedCount++;
    }
  });

  console.log(`Updated ${updatedCount} files to use English category keys.`);
}

bulkUpdateCategories();
