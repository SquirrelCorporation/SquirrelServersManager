const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  checkLinks: true,
  checkFrontmatter: true,
  fix: false
};

// Process command line flags
args.forEach(arg => {
  if (arg === '--no-links') {
    options.checkLinks = false;
  } else if (arg === '--no-frontmatter') {
    options.checkFrontmatter = false;
  } else if (arg === '--fix') {
    options.fix = true;
  } else if (arg === '--help') {
    console.log(`
Usage: node check-doc-layouts.cjs [options]

Options:
  --no-links       Skip checking for dead links
  --no-frontmatter Skip checking frontmatter
  --fix            Attempt to fix certain issues automatically
  --help           Show this help message
    `);
    process.exit(0);
  }
});

const DOCS_DIR = path.join(__dirname, '../docs');
const SITE_DIR = path.join(__dirname, '..');
const ALLOWED_LAYOUTS = ['FeatureGuideLayout'];
const REQUIRED_FIELDS = ['layout', 'title', 'icon', 'time'];

// No more ignore paths - we want to detect all dead links
const IGNORE_PATHS = [];

function walk(dir, filelist = []) {
  fs.readdirSync(dir).forEach(file => {
    const filepath = path.join(dir, file);
    
    // Skip _obsolete directory
    if (filepath.includes('_obsolete')) {
      return;
    }
    
    if (fs.statSync(filepath).isDirectory()) {
      filelist = walk(filepath, filelist);
    } else if (file.endsWith('.md')) {
      filelist.push(filepath);
    }
  });
  return filelist;
}

function checkFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return { error: 'Missing frontmatter' };
  const frontmatter = match[1];
  const fields = {};
  frontmatter.split('\n').forEach(line => {
    const [key, ...rest] = line.split(':');
    if (key && rest.length) fields[key.trim()] = rest.join(':').trim();
  });
  return { fields };
}

function getLinks(content) {
  const links = [];
  let match;
  
  // Match markdown links and images
  const linkRegex = /\[([^\]]*)\]\(([^)]+)\)/g;
  while ((match = linkRegex.exec(content)) !== null) {
    if (!match[2].startsWith('http')) {
      links.push({
        text: match[1],
        path: match[2],
        isImage: match[0].startsWith('!')
      });
    }
  }
  
  // Match Vue component image paths (like MentalModelDiagram)
  const componentImageRegex = /imagePath="([^"]+)"/g;
  while ((match = componentImageRegex.exec(content)) !== null) {
    if (!match[1].startsWith('http')) {
      links.push({
        text: 'Component Image',
        path: match[1],
        isImage: true
      });
    }
  }
  
  // Match standard HTML img tags
  const imgTagRegex = /<img\s+[^>]*src="([^"]+)"[^>]*>/g;
  while ((match = imgTagRegex.exec(content)) !== null) {
    if (!match[1].startsWith('http')) {
      links.push({
        text: 'HTML Image',
        path: match[1],
        isImage: true
      });
    }
  }
  
  // Match frontmatter and YAML src paths that are likely images
  const srcPathRegex = /src:\s*([^\s,\n]+)/g;
  while ((match = srcPathRegex.exec(content)) !== null) {
    const path = match[1].trim();
    // Only treat as image if it has an image extension or is in an image directory
    if (!path.startsWith('http') && path.startsWith('/') && 
        (path.match(/\.(png|jpe?g|gif|svg|webp|ico)$/i) || 
         path.includes('/images/') || 
         path.includes('/public/') || 
         path.includes('/assets/'))) {
      links.push({
        text: 'YAML Image Path',
        path: path,
        isImage: true
      });
    }
  }
  
  // Match SVG icon references
  const svgIconRegex = /!\[(.*?)\]\((.*?\.svg)\)/g;
  while ((match = svgIconRegex.exec(content)) !== null) {
    if (!match[2].startsWith('http')) {
      links.push({
        text: match[1],
        path: match[2],
        isImage: true
      });
    }
  }
  
  // Match background image styles
  const backgroundImageRegex = /background-image:\s*url\(['"]?([^'"]+)['"]?\)/g;
  while ((match = backgroundImageRegex.exec(content)) !== null) {
    if (!match[1].startsWith('http')) {
      links.push({
        text: 'CSS Background Image',
        path: match[1],
        isImage: true
      });
    }
  }
  
  return links;
}

// Function to check if a path exists in the repository
function pathExists(resolvedPath) {
  // Try variations with and without .md, and with index.md
  const pathVariations = [
    resolvedPath,
    `${resolvedPath}.md`,
    path.join(resolvedPath, 'index.md')
  ];
  
  for (const pathToCheck of pathVariations) {
    if (fs.existsSync(pathToCheck)) {
      return { exists: true, foundAt: pathToCheck };
    }
  }
  
  return { exists: false };
}

function checkLink(link, file) {
  // Handle anchor references and empty links
  if (!link.path || link.path.startsWith('#')) {
    return null;
  }
  
  // Handle external links
  if (link.path.startsWith('http')) {
    return null;
  }
  
  // Normalize path before checking
  let normalizedPath = link.path.split('#')[0]; // Remove fragment
  if (!normalizedPath) return null; // Skip empty links
  
  // Clean any trailing whitespace
  normalizedPath = normalizedPath.trim();
  
  // Handle image links and SVG references
  if (link.isImage || normalizedPath.match(/\.(png|jpe?g|gif|svg|webp|ico)$/i)) {
    // Verify if the image is in the proper location
    let imagePath;
    
    // Check in both the original location and in the centralized /images directory
    if (normalizedPath.startsWith('/')) {
      // Try original path
      imagePath = path.join(SITE_DIR, 'public', normalizedPath);
      
      // If it doesn't exist in original location, check if it was moved to /images
      if (!fs.existsSync(imagePath) && !normalizedPath.startsWith('/images/')) {
        // Extract the base name and try to find it in /images
        const baseName = path.basename(normalizedPath);
        const pathParts = normalizedPath.split('/').filter(p => p);
        const prefixedName = pathParts.length > 1 
          ? `${pathParts[0]}-${baseName}` 
          : baseName;
        
        const centralizedPath = path.join(SITE_DIR, 'public', 'images', prefixedName);
        
        if (!fs.existsSync(centralizedPath)) {
          // Check if it exists in obsolete directory
          const obsoletePath = path.join(SITE_DIR, 'public', '_obsolete', normalizedPath);
          if (fs.existsSync(obsoletePath)) {
            return `Image link: [${link.text}](${link.path}) in ${file} - Image exists in _obsolete directory but not in /images`;
          }
          return `Image link: [${link.text}](${link.path}) in ${file} - Image file does not exist`;
        } else {
          // Image exists in centralized location, but reference is using old path
          return `Image link: [${link.text}](${link.path}) in ${file} - Image should be referenced as /images/${prefixedName}`;
        }
      }
    } else {
      // Relative path
      imagePath = path.join(path.dirname(file), normalizedPath);
      
      if (!fs.existsSync(imagePath)) {
        return `Image link: [${link.text}](${link.path}) in ${file} - Image file does not exist`;
      }
    }
    
    return null;
  }
  
  // Handle document links
  const resolvedPath = normalizedPath.startsWith('/')
    ? path.join(SITE_DIR, normalizedPath)
    : path.join(path.dirname(file), normalizedPath);
  
  // Check the existence of the path
  const { exists } = pathExists(resolvedPath);
  
  if (!exists) {
    return `Dead link: [${link.text}](${link.path}) in ${file} - Target page does not exist`;
  }
  
  return null;
}

function fixFile(file, issues) {
  if (!options.fix) return false;
  
  let content = fs.readFileSync(file, 'utf8');
  let fixed = false;
  
  // Fix missing frontmatter
  if (issues.some(issue => issue.includes('Missing frontmatter'))) {
    const defaultFrontmatter = `---
layout: FeatureGuideLayout
title: ${path.basename(file, '.md')}
icon: info-circle
time: 5 min read
---

`;
    
    if (!content.startsWith('---')) {
      content = defaultFrontmatter + content;
      fixed = true;
      console.log(`Fixed missing frontmatter in ${file}`);
    }
  }
  
  // Fix missing frontmatter fields
  const missingFieldIssues = issues.filter(issue => issue.includes('Missing required frontmatter field'));
  if (missingFieldIssues.length > 0) {
    // Extract the frontmatter
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (frontmatterMatch) {
      const frontmatter = frontmatterMatch[1];
      let updatedFrontmatter = frontmatter;
      
      // Add missing fields
      for (const issue of missingFieldIssues) {
        const fieldMatch = issue.match(/Missing required frontmatter field '([^']+)'/);
        if (fieldMatch) {
          const missingField = fieldMatch[1];
          
          // Don't add if it already exists
          if (!updatedFrontmatter.includes(`${missingField}:`)) {
            let fieldValue = '';
            
            // Set default values based on field type
            switch (missingField) {
              case 'layout':
                fieldValue = 'FeatureGuideLayout';
                break;
              case 'title':
                fieldValue = path.basename(file, '.md');
                break;
              case 'icon':
                fieldValue = 'info-circle';
                break;
              case 'time':
                fieldValue = '5 min read';
                break;
              default:
                fieldValue = 'default value';
            }
            
            updatedFrontmatter += `\n${missingField}: ${fieldValue}`;
            fixed = true;
            console.log(`Added missing frontmatter field '${missingField}' to ${file}`);
          }
        }
      }
      
      // Replace frontmatter if changes were made
      if (updatedFrontmatter !== frontmatter) {
        content = content.replace(frontmatterMatch[1], updatedFrontmatter);
      }
    }
  }
  
  // Fix image paths that should point to the centralized /images directory
  const imageLinkIssues = issues.filter(issue => issue.includes('Image link:') && issue.includes('Image should be referenced as /images/'));
  if (imageLinkIssues.length > 0) {
    for (const issue of imageLinkIssues) {
      // Extract old path and new path
      const oldPathMatch = issue.match(/\[.*?\]\((.*?)\)/);
      const newPathMatch = issue.match(/Image should be referenced as (\/images\/.*?)$/);
      
      if (oldPathMatch && newPathMatch) {
        const oldPath = oldPathMatch[1];
        const newPath = newPathMatch[1];
        
        // Replace in different contexts
        
        // 1. Markdown image syntax
        content = content.replace(
          new RegExp(`!\\[([^\\]]*)\\]\\(${escapeRegExp(oldPath)}\\)`, 'g'), 
          `![$1](${newPath})`
        );
        
        // 2. HTML img tag
        content = content.replace(
          new RegExp(`<img([^>]*)src=["']${escapeRegExp(oldPath)}["']([^>]*)>`, 'g'),
          `<img$1src="${newPath}"$2>`
        );
        
        // 3. Component imagePath prop
        content = content.replace(
          new RegExp(`imagePath=["']${escapeRegExp(oldPath)}["']`, 'g'),
          `imagePath="${newPath}"`
        );
        
        // 4. YAML src attribute
        content = content.replace(
          new RegExp(`src:\\s*${escapeRegExp(oldPath)}`, 'g'),
          `src: ${newPath}`
        );
        
        fixed = true;
        console.log(`Updated image path from ${oldPath} to ${newPath} in ${file}`);
      }
    }
  }
  
  // Attempt to fix dead links based on a fuzzy match
  const deadLinkIssues = issues.filter(issue => issue.includes('Dead link:'));
  if (deadLinkIssues.length > 0) {
    for (const issue of deadLinkIssues) {
      const linkMatch = issue.match(/\[([^\]]*)\]\(([^)]+)\)/);
      if (linkMatch) {
        const linkText = linkMatch[1];
        const linkPath = linkMatch[2];
        
        // Try some common replacements
        const possibleReplacements = [];
        
        // Try replacing paths that might have moved
        if (linkPath.includes('/docs/')) {
          // Try new locations for common paths
          if (linkPath.includes('/settings/')) {
            possibleReplacements.push(linkPath.replace('/settings/', '/user-guides/settings/'));
          }
          if (linkPath.includes('/technical-guide/')) {
            possibleReplacements.push(linkPath.replace('/technical-guide/', '/reference/technical-guide/'));
          }
          if (linkPath.includes('/devices/')) {
            possibleReplacements.push(linkPath.replace('/devices/', '/user-guides/devices/'));
          }
          if (linkPath.includes('/containers/')) {
            possibleReplacements.push(linkPath.replace('/containers/', '/user-guides/containers/'));
          }
          if (linkPath.includes('/contribute/')) {
            possibleReplacements.push(linkPath.replace('/contribute/', '/docs/community/'));
          }
        }
        
        // Check if any replacement works
        let replacement = null;
        for (const candidatePath of possibleReplacements) {
          const resolvedPath = candidatePath.startsWith('/')
            ? path.join(SITE_DIR, candidatePath)
            : path.join(path.dirname(file), candidatePath);
          
          const { exists } = pathExists(resolvedPath);
          if (exists) {
            replacement = candidatePath;
            break;
          }
        }
        
        // Apply the replacement if found
        if (replacement) {
          content = content.replace(
            new RegExp(`\\[${escapeRegExp(linkText)}\\]\\(${escapeRegExp(linkPath)}\\)`, 'g'),
            `[${linkText}](${replacement})`
          );
          fixed = true;
          console.log(`Fixed dead link: [${linkText}](${linkPath}) → [${linkText}](${replacement}) in ${file}`);
        }
      }
    }
  }
  
  if (fixed) {
    fs.writeFileSync(file, content, 'utf8');
    return true;
  }
  
  return false;
}

// Helper function to escape special characters in regex
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

let errors = [];
let fixedFiles = [];

// Process all markdown files
walk(DOCS_DIR).forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  let fileIssues = [];
  
  // Check frontmatter
  if (options.checkFrontmatter) {
    const { fields, error } = checkFrontmatter(content);
    if (error) {
      fileIssues.push(`${file}: ${error}`);
    } else {
      // Check required fields
      REQUIRED_FIELDS.forEach(field => {
        if (!fields[field]) {
          fileIssues.push(`${file}: Missing required frontmatter field '${field}'`);
        }
      });
      
      // Check allowed layout
      if (fields.layout && !ALLOWED_LAYOUTS.includes(fields.layout)) {
        fileIssues.push(`${file}: Invalid layout '${fields.layout}' (allowed: ${ALLOWED_LAYOUTS.join(', ')})`);
      }
    }
  }
  
  // Check links
  if (options.checkLinks) {
    const links = getLinks(content);
    links.forEach(link => {
      const linkError = checkLink(link, file);
      if (linkError) {
        fileIssues.push(linkError);
      }
    });
  }
  
  // Try to fix issues
  if (fileIssues.length > 0 && options.fix) {
    const fixed = fixFile(file, fileIssues);
    if (fixed) {
      fixedFiles.push(file);
      
      // Recheck the file after fixing
      const newContent = fs.readFileSync(file, 'utf8');
      
      // Recheck frontmatter if needed
      if (options.checkFrontmatter) {
        const { fields, error } = checkFrontmatter(newContent);
        
        // Remove fixed frontmatter issues
        fileIssues = fileIssues.filter(issue => {
          if (issue.includes('Missing frontmatter')) {
            return error !== undefined;
          }
          if (issue.includes('Missing required frontmatter field')) {
            const fieldMatch = issue.match(/Missing required frontmatter field '([^']+)'/);
            if (fieldMatch && fields && fields[fieldMatch[1]]) {
              return false;
            }
          }
          return true;
        });
      }
      
      // Recheck links if needed
      if (options.checkLinks) {
        const newLinks = getLinks(newContent);
        const newLinkErrors = [];
        
        newLinks.forEach(link => {
          const linkError = checkLink(link, file);
          if (linkError) {
            newLinkErrors.push(linkError);
          }
        });
        
        // Replace existing link errors with new link errors
        fileIssues = fileIssues.filter(issue => !(issue.includes('Dead link:') || issue.includes('Image link:')))
          .concat(newLinkErrors);
      }
    }
  }
  
  // Add remaining issues to the errors list
  errors = errors.concat(fileIssues);
});

// Print results
if (fixedFiles.length > 0) {
  console.log(`\nFixed ${fixedFiles.length} files:`);
  fixedFiles.forEach(file => console.log(`  - ${file}`));
}

if (errors.length) {
  console.error(`\nDocumentation check failed: ${errors.length} issues found`);
  
  // Group errors by type
  const frontmatterErrors = errors.filter(e => e.includes('Missing frontmatter') || e.includes('Missing required frontmatter field'));
  const layoutErrors = errors.filter(e => e.includes('Invalid layout'));
  const deadLinkErrors = errors.filter(e => e.includes('Dead link:'));
  const imageLinkErrors = errors.filter(e => e.includes('Image link:'));
  
  // Print summary
  console.error(`\nSUMMARY:`);
  console.error(`- Frontmatter issues: ${frontmatterErrors.length}`);
  console.error(`- Layout issues: ${layoutErrors.length}`);
  console.error(`- Dead links: ${deadLinkErrors.length}`);
  console.error(`- Missing images: ${imageLinkErrors.length}`);
  
  // Print detailed errors
  if (frontmatterErrors.length) {
    console.error('\nFRONTMATTER ISSUES:');
    frontmatterErrors.forEach(e => console.error('  -', e));
  }
  
  if (layoutErrors.length) {
    console.error('\nLAYOUT ISSUES:');
    layoutErrors.forEach(e => console.error('  -', e));
  }
  
  if (deadLinkErrors.length) {
    console.error('\nDEAD LINKS:');
    deadLinkErrors.forEach(e => console.error('  -', e));
  }
  
  if (imageLinkErrors.length) {
    console.error('\nMISSING IMAGES:');
    imageLinkErrors.forEach(e => console.error('  -', e));
  }
  
  console.error('\nRun with --fix to attempt automatic fixes for some issues.');
  console.error('Run with --no-links to check only frontmatter issues.');
  console.error('Run with --help for all options.');
  
  process.exit(1);
} else {
  console.log('\nSUCCESS: All documentation files use the correct layout, required frontmatter, and have valid internal links.');
}