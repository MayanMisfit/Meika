const config = {
    manifestPath: 'md/manifest.yaml',
    markdownPath: 'md/'  // Ensure this matches your actual folder structure
};

let journalEntries = [];

// 1. Define the custom extensions
const nameExtension = {
  name: 'name',
  level: 'inline',
  start(src) {
    return src.indexOf('[[');
  },
  tokenizer(src, tokens) {
    const rule = /^\[\[(.*?)\]\]/;
    const match = rule.exec(src);
    if (match) {
      return {
        type: 'name',
        raw: match[0],
        text: match[1],
      };
    }
  },
  renderer(token) {
    return `<span class="name">${token.text}</span>`;
  },
};

const wikiLinkExtension = {
  name: 'wikiLink',
  level: 'inline',
  start(src) {
    return src.indexOf('{{');
  },
  tokenizer(src) {
    const match = /^{{([^|}]+)(?:\|([^}]+))?}}/.exec(src);
    if (match) {
      return {
        type: 'wikiLink',
        raw: match[0],
        page: match[1],
        label: match[2] || match[1],
      };
    }
  },
  renderer(token) {
    return `<a href="#" class="wiki-link" onclick="loadMarkdown('md/${encodeURIComponent(token.page.replace(/\s+/g, '_'))}.md', '${token.label}')">${token.label}</a>`;
  },
};

// 2. Register the extensions with Marked
marked.use({ extensions: [nameExtension, wikiLinkExtension] });

async function loadManifest() {
    try {
        console.log("Loading manifest...");
        const response = await fetch(config.manifestPath);
        if (!response.ok) throw new Error('Failed to load manifest');

        const yamlText = await response.text();
        console.log("Manifest loaded:", yamlText);

        const data = jsyaml.load(yamlText);

        journalEntries = data.entries.map(entry => ({
            ...entry,
            file: `${config.markdownPath}${entry.file}`
        }));

        console.log("Processed entries:", journalEntries);

        generateJournalLinks();
    } catch (error) {
        console.error('Error loading manifest:', error);
        alert('Failed to load journal entries. Please try again later.');
    }
}

function generateJournalLinks() {
    const journalLinksContainer = document.getElementById('journal-links-container');
    if (!journalLinksContainer) {
        console.error('Error: journal-links-container not found in DOM');
        return;
    }

    journalLinksContainer.innerHTML = '';

    journalEntries.forEach(entry => {
        console.log("Generating link for:", entry);
        const link = document.createElement('a');
        link.href = '#';
        link.className = 'journal-link';
        link.textContent = entry.title;
        link.addEventListener('click', (e) => {
            e.preventDefault();
            console.log("Clicked on:", entry.file);
            loadMarkdown(entry.file, entry.title);
        });
        journalLinksContainer.appendChild(link);
    });
}

async function loadMarkdown(filePath, title) {
    try {
        console.log("Fetching markdown file:", filePath);
        const response = await fetch(filePath);
        if (!response.ok) throw new Error(`Failed to load ${filePath}, HTTP status ${response.status}`);

        const markdownText = await response.text();
        console.log("Markdown content fetched:", markdownText.substring(0, 100) + "...");

        // 3. Parse the markdown content using Marked (with the custom extensions)
        const htmlContent = marked.parse(markdownText);

        renderBlogPost(title, htmlContent);
    } catch (error) {
        console.error('Error loading markdown:', error);
        alert('Failed to load journal entry. Please try again later.');
    }
}

function renderBlogPost(title, content) {
    const container = document.getElementById('journal-links-container');
    if (!container) {
        console.error('Error: journal-links-container not found in DOM');
        return;
    }

    container.innerHTML = `
        <div class="journal-entry">
            <h2>${title}</h2>
            <div class="content">${content}</div>
            <a href="#" class="back-button">Back to Archives</a>
            <a href="/index.html" class="journal-link">EXIT</a>
        </div>
    `;

    document.querySelector('.back-button').addEventListener('click', (e) => {
        e.preventDefault();
        generateJournalLinks();
    });
}

// Load manifest when the page loads
window.addEventListener('DOMContentLoaded', loadManifest);
