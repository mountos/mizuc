import fs from 'fs';
import path from 'path';
import xml2js from 'xml2js';
import TurndownService from 'turndown';
import he from 'he';

const XML_PATH = '/Users/mountos/Downloads/webDev/Mountos Institute/mizuc/import/wp-xml/WordPress.2026-03-07.xml';
const OUTPUT_DIR = '/Users/mountos/Downloads/webDev/Mountos Institute/mizuc/content/posts';
const WP_UPLOADS_PATH = '/Users/mountos/Downloads/webDev/Mountos Institute/mizuc/import/wp-content/uploads';
const ASSETS_DIR = '/Users/mountos/Downloads/webDev/Mountos Institute/mizuc/src/assets/images';

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
if (!fs.existsSync(ASSETS_DIR)) fs.mkdirSync(ASSETS_DIR, { recursive: true });

const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced'
});

// Map of original relative path (e.g. 2024/05/img.jpg) to flattened name
const imageMap = new Map();

function preprocessImages(dir, relativeParts = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      preprocessImages(fullPath, [...relativeParts, file]);
    } else if (file !== '.DS_Store') {
      const relPath = [...relativeParts, file].join('/');
      const flattenedName = [...relativeParts, file].join('-');
      const targetPath = path.join(ASSETS_DIR, flattenedName);
      
      if (!fs.existsSync(targetPath)) {
        fs.copyFileSync(fullPath, targetPath);
      }
      imageMap.set(relPath, flattenedName);
    }
  }
}

async function migrate_wp() {
  console.log('Preprocessing and copying all images...');
  preprocessImages(WP_UPLOADS_PATH);
  console.log(`Finished copying images. Total unique files found: ${imageMap.size}`);

  const xmlContent = fs.readFileSync(XML_PATH, 'utf8');
  const parser = new xml2js.Parser({ explicitArray: false });

  try {
    const result = await parser.parseStringPromise(xmlContent);
    const items = Array.isArray(result.rss.channel.item) ? result.rss.channel.item : [result.rss.channel.item];

    const mediaMap = {}; // id -> url
    const postMetaMap = {}; // post_id -> featured_media_id

    items.forEach(item => {
      const id = String(item['wp:post_id']);
      
      if (item['wp:post_type'] === 'attachment') {
        const urlRaw = item['wp:attachment_url'] || item['guid'];
        const url = typeof urlRaw === 'string' ? urlRaw : (urlRaw ? urlRaw._ : '');
        mediaMap[id] = url;
      }
      
      if (item['wp:post_meta']) {
        const metas = Array.isArray(item['wp:post_meta']) ? item['wp:post_meta'] : [item['wp:post_meta']];
        metas.forEach(meta => {
          const key = meta['wp:meta_key'];
          const keyStr = typeof key === 'string' ? key : (key ? key._ : '');
          if (keyStr === '_thumbnail_id') {
            const val = meta['wp:meta_value'];
            const valStr = typeof val === 'string' ? val : (val ? val._ : '');
            if (valStr) {
               postMetaMap[id] = valStr;
            }
          }
        });
      }
    });

    console.log(`Analyzing ${items.length} items from XML...`);
    let count = 0;

    items.forEach((item) => {
      if (item['wp:post_type'] !== 'post' || item['wp:status'] !== 'publish') return;

      const title = item.title || '';
      const post_id = String(item['wp:post_id']);
      const post_name = item['wp:post_name'] || `post-${post_id}`;
      const publishedDate = new Date(item['wp:post_date'] || Date.now());
      const contentHtml = item['content:encoded'] || '';
      const excerpt = item['excerpt:excerpt'] || '';
      const description = excerpt || title;

      let tags = [];
      let category = '';
      if (item.category) {
        const cats = Array.isArray(item.category) ? item.category : [item.category];
        tags = cats.filter(c => c.$.domain === 'post_tag').map(c => typeof c === 'string' ? c : c._);
        const catObj = cats.find(c => c.$.domain === 'category');
        if (catObj) {
          const catName = typeof catObj === 'string' ? catObj : catObj._;
          const map = {
            '旅行指南': 'guide',
            '行路趣聞': 'walk',
            '迷走故事': 'roam'
          };
          category = map[catName] || catName;
        }
      }

      function resolveImage(url) {
        if (!url) return null;
        const match = url.match(/uploads\/(\d{4}\/\d{2}\/.*)$/);
        if (!match) return null;
        const relPath = match[1];
        return imageMap.get(relPath) || null;
      }

      let markdown = turndownService.turndown(contentHtml);
      markdown = he.decode(markdown);

      // Hero Image Resolution
      let heroImageValue = '';
      const featuredIdStr = postMetaMap[post_id] ? String(postMetaMap[post_id]) : '';
      if (featuredIdStr && mediaMap[featuredIdStr]) {
        const localName = resolveImage(mediaMap[featuredIdStr]);
        if (localName) {
          heroImageValue = `@/assets/images/${localName}`;
        }
      }

      const frontmatter = [
        '---',
        `title: "${title.replace(/"/g, '\\"')}"`,
        `author: "迷走客"`,
        `description: "${String(description).replace(/\n|"/g, ' ').substring(0, 160)}"`,
        `publishedDate: ${publishedDate.toISOString().split('T')[0]}`,
        `tags: ${JSON.stringify(tags)}`,
        category ? `category: "${category}"` : '',
        `heroImage: "${heroImageValue}"`,
        'draft: false',
        'showToC: true',
        '---',
        '',
        // Replace all upload URLs with local references
        markdown.replace(/https?:\/\/mizuc\.com\/wp-content\/uploads\/(\d{4}\/\d{2}\/[^"'\s\)]+)/g, (match, pathPart) => {
          // pathPart corresponds to \d{4}/\d{2}/...
          const localName = imageMap.get(pathPart);
          return localName ? `../../src/assets/images/${localName}` : match;
        })
      ].filter(line => line !== '').join('\n');

      fs.writeFileSync(path.join(OUTPUT_DIR, `${post_name}.md`), frontmatter);
      count++;
    });

    console.log(`Migration complete. Total posts: ${count}`);
  } catch (err) {
    console.error('Migration failed:', err);
    console.error(err.stack);
  }
}

migrate_wp();
