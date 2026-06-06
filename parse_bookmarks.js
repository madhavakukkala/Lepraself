const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, '..', 'DSA SHEET ARCHIT.html');
const outputPath = path.join(__dirname, 'src', 'app', 'data', 'roadmap.json');

// Ensure data folder exists
fs.mkdirSync(path.dirname(outputPath), { recursive: true });

const htmlContent = fs.readFileSync(htmlPath, 'utf-8');

function decodeHtmlEntities(str) {
  if (!str) return '';
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}

// Basic parser for Netscape Bookmarks
// We can parse line by line or build a simple stack based parser
function parseBookmarks(html) {
  const lines = html.split('\n');
  const root = { name: 'Root', type: 'folder', children: [] };
  const stack = [root];
  
  // Regexes
  const h3Regex = /<H3[^>]*>([^<]+)<\/H3>/i;
  const aRegex = /<A\s+HREF="([^"]+)"[^>]*>([^<]+)<\/A>/i;
  const dlOpenRegex = /<DL>/i;
  const dlCloseRegex = /<\/DL>/i;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const h3Match = line.match(h3Regex);
    const aMatch = line.match(aRegex);

    if (h3Match) {
      const name = decodeHtmlEntities(h3Match[1].trim());
      const folder = { name, type: 'folder', children: [] };
      const current = stack[stack.length - 1];
      current.children.push(folder);
      
      // Look ahead to see if there is a <DL> on the next few lines to push to stack
      // In Netscape format, H3 is followed by <DL>
      let foundDl = false;
      for (let j = 1; j <= 3; j++) {
        if (lines[i + j] && lines[i + j].toLowerCase().includes('<dl>')) {
          foundDl = true;
          break;
        }
      }
      if (foundDl) {
        stack.push(folder);
      }
    } else if (aMatch) {
      const url = aMatch[1].trim();
      const title = decodeHtmlEntities(aMatch[2].trim());
      const link = { name: title, url, type: 'link' };
      const current = stack[stack.length - 1];
      current.children.push(link);
    } else if (line.toLowerCase().includes('</dl>')) {
      if (stack.length > 1) {
        stack.pop();
      }
    }
  }

  return root;
}

const parsed = parseBookmarks(htmlContent);

// Let's structure the roadmap:
// Categories -> Subcategories -> Topics -> Problems & Resources
// The HTML has:
// Bookmarks Bar -> DSA Sheet -> Core Subjects, Getting Started, Arrays & Strings, etc.
// Let's extract children of "DSA Sheet" as Categories.

const dsaSheetNode = findNode(parsed, 'DSA Sheet');
if (!dsaSheetNode) {
  console.error("Could not find 'DSA Sheet' node!");
  process.exit(1);
}

function findNode(node, name) {
  if (node.name === name) return node;
  if (node.children) {
    for (const child of node.children) {
      const found = findNode(child, name);
      if (found) return found;
    }
  }
  return null;
}

// Now let's classify and flatten the tree into a clean structured format:
// Categories -> Subcategories (optional) -> Topics -> Problems & Resources
// To do this, let's write a function that maps the children of DSA Sheet.
function classifyLink(item) {
  const url = item.url.toLowerCase();
  const name = item.name.toLowerCase();
  
  let isProblem = false;
  let platform = 'Other';
  let difficulty = 'Medium'; // Default to medium, can assign based on name or index
  
  if (url.includes('leetcode.com/problems/')) {
    isProblem = true;
    platform = 'LeetCode';
  } else if (url.includes('geeksforgeeks.org/problems/') || url.includes('practice.geeksforgeeks.org/problems/')) {
    isProblem = true;
    platform = 'GeeksforGeeks';
  } else if (url.includes('codingninjas.com/codestudio/problems/') || url.includes('codingninjas.com/studio/problems/')) {
    isProblem = true;
    platform = 'CodingNinjas';
  } else if (url.includes('hackerrank.com/challenges/') || url.includes('hackerrank.com/contests/')) {
    isProblem = true;
    platform = 'HackerRank';
  } else if (url.includes('spoj.com/problems/')) {
    isProblem = true;
    platform = 'SPOJ';
  } else if (url.includes('codechef.com/problems/')) {
    isProblem = true;
    platform = 'CodeChef';
  } else if (url.includes('lintcode.com/problem/')) {
    isProblem = true;
    platform = 'LintCode';
  } else if (url.includes('interviewbit.com/problems/')) {
    isProblem = true;
    platform = 'InterviewBit';
  } else if (url.includes('pepcoding.com/') && (url.includes('ojquestion') || url.includes('question'))) {
    isProblem = true;
    platform = 'Pepcoding';
  }

  // Deduce difficulty if possible from title (e.g. contains "easy", "medium", "hard" or based on problem name index)
  if (name.includes('easy') || name.includes('- i') || name.includes('basics')) {
    difficulty = 'Easy';
  } else if (name.includes('hard') || name.includes('- iii') || name.includes('advanced')) {
    difficulty = 'Hard';
  } else if (name.includes('medium') || name.includes('- ii')) {
    difficulty = 'Medium';
  } else {
    // Randomly distribute for visual variety if not specified, or default
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    difficulty = hash % 3 === 0 ? 'Easy' : (hash % 3 === 1 ? 'Medium' : 'Hard');
  }

  // Deduce programming language relevance
  let language = 'Agnostic';
  if (url.includes('java') || name.includes('java')) {
    language = 'Java';
  } else if (url.includes('cpp') || name.includes('c++') || name.includes('stl')) {
    language = 'C++';
  } else if (url.includes('python') || name.includes('python')) {
    language = 'Python';
  } else if (url.includes('javascript') || name.includes('javascript') || url.includes('/js/')) {
    language = 'JavaScript';
  }

  return {
    id: `${platform.toLowerCase()}-${name.replace(/[^a-z0-9]/g, '-')}`,
    name: item.name,
    url: item.url,
    isProblem,
    platform,
    difficulty,
    language
  };
}

// We want to transform the tree so that every category contains topics.
// If a category has folders, those are subcategories. Each subcategory's folders are topics.
// If a folder has only links, we treat it as a Topic under the parent Category.
// Let's create a robust parser that normalizes this hierarchy into:
// Category -> Topic -> { resources: [], problems: [] }

const roadmap = [];

function processNode(node, currentCategory = null, currentTopic = null) {
  if (node.type === 'folder') {
    // If it's a child of DSA Sheet, it's a Category
    const isCategory = dsaSheetNode.children.includes(node);
    
    if (isCategory) {
      const cat = {
        id: node.name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase(),
        name: node.name,
        topics: []
      };
      roadmap.push(cat);
      for (const child of node.children) {
        processNode(child, cat, null);
      }
    } else {
      // It's a subfolder. If we don't have a topic yet, this folder is a Topic.
      // If we already have a topic (nested deeper), we can just append to the topic, or treat this as a subtopic.
      // Let's make it simple: if the folder contains subfolders, those are topics.
      // If it contains only links, it is a Topic itself.
      const hasSubfolders = node.children.some(c => c.type === 'folder');
      
      if (hasSubfolders) {
        // This is a subcategory. We don't create a separate node, but we'll prepend its name to children topics
        for (const child of node.children) {
          processNode(child, currentCategory, node.name);
        }
      } else {
        // This is a Topic
        const topicName = currentTopic ? `${currentTopic} - ${node.name}` : node.name;
        const topicId = topicName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
        
        const topic = {
          id: topicId,
          name: topicName,
          problems: [],
          resources: []
        };
        
        for (const child of node.children) {
          if (child.type === 'link') {
            const classified = classifyLink(child);
            if (classified.isProblem) {
              topic.problems.push(classified);
            } else {
              topic.resources.push(classified);
            }
          }
        }
        
        if (currentCategory) {
          currentCategory.topics.push(topic);
        } else {
          // If no category, create a default "General" category
          let general = roadmap.find(c => c.id === 'general');
          if (!general) {
            general = { id: 'general', name: 'General', topics: [] };
            roadmap.push(general);
          }
          general.topics.push(topic);
        }
      }
    }
  } else if (node.type === 'link') {
    // A link directly in a category (no topic) -> Create a default topic for it
    if (currentCategory) {
      let defaultTopic = currentCategory.topics.find(t => t.id === `${currentCategory.id}-misc`);
      if (!defaultTopic) {
        defaultTopic = {
          id: `${currentCategory.id}-misc`,
          name: 'Core Resources',
          problems: [],
          resources: []
        };
        currentCategory.topics.unshift(defaultTopic); // Add to beginning
      }
      const classified = classifyLink(node);
      if (classified.isProblem) {
        defaultTopic.problems.push(classified);
      } else {
        defaultTopic.resources.push(classified);
      }
    }
  }
}

// Process children of DSA Sheet
for (const child of dsaSheetNode.children) {
  processNode(child);
}

// Clean up: filter out empty categories or topics
const cleanedRoadmap = roadmap.filter(cat => {
  cat.topics = cat.topics.filter(topic => topic.problems.length > 0 || topic.resources.length > 0);
  return cat.topics.length > 0;
});

fs.writeFileSync(outputPath, JSON.stringify(cleanedRoadmap, null, 2), 'utf-8');
console.log(`Successfully parsed roadmap! Saved ${cleanedRoadmap.length} categories to ${outputPath}`);
