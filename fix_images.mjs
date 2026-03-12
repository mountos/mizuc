import fs from 'fs';
import path from 'path';

const blogDir = 'src/content/blog';
const files = fs.readdirSync(blogDir).filter(f => f.endsWith('.md'));

let fixedPathCount = 0;
let missingHeroCount = 0;
let missingInlineCount = 0;

files.forEach(file => {
  const filePath = path.join(blogDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;

  // 1. Fix relative paths: from `../../src/assets/images/` to `../../assets/images/`
  content = content.replace(/\.\.\/\.\.\/src\/assets\/images/g, '../../assets/images');
  if (content !== originalContent) fixedPathCount++;

  const contentAfterPathFix = content;

  // 2. Check markdown inline image syntax ![alt](path)
  const imgRegex = /!\[.*?\]\((.*?)\)/g;
  content = content.replace(imgRegex, (match, imgPath) => {
    let checkPath;
    if (imgPath.startsWith('../../assets/')) {
       checkPath = imgPath.replace('../../', 'src/');
    } else if (imgPath.startsWith('/')) {
       checkPath = path.join('public', imgPath);
    } else {
       if(imgPath.startsWith('http') || imgPath.startsWith('https')) return match;
       checkPath = path.join(blogDir, imgPath);
    }

    if (checkPath && !fs.existsSync(checkPath)) {
      console.log(`Flagging missing inline image in ${file}: ${imgPath}`);
      missingInlineCount++;
      // Wrap the entire markdown image syntax in an HTML comment with the TODO string
      return `<!-- TODO: MISSING IMAGE ${match} -->`; 
    }
    return match;
  });

  // 3. Check heroImage frontmatter
  const heroRegex = /^heroImage:\s*['"](.*?)['"]/gm;
  content = content.replace(heroRegex, (match, imgPath) => {
      // Ignore empty heroImage
      if (!imgPath || imgPath.trim() === '') return match;

      let checkPath;
      if (imgPath.startsWith('../../assets/')) {
         checkPath = imgPath.replace('../../', 'src/');
      } else if (imgPath.startsWith('/')) {
         checkPath = path.join('public', imgPath);
      } else {
         if(imgPath.startsWith('http') || imgPath.startsWith('https')) return match;
         checkPath = path.join(blogDir, imgPath);
      }
      
      if (checkPath && !fs.existsSync(checkPath)) {
        console.log(`Flagging missing heroImage in ${file}: ${imgPath}`);
        missingHeroCount++;
        // Replace the path with the TODO string
        return `heroImage: "TODO: MISSING IMAGE ${imgPath}"`; 
      }
      return match;
  });

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
  }
});

console.log(`Fixed paths in ${fixedPathCount} files.`);
console.log(`Flagged ${missingHeroCount} missing heroImages.`);
console.log(`Flagged ${missingInlineCount} missing inline images.`);
