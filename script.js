const config = {
    manifestPath: 'md/manifest.yaml',
    markdownPath: 'md/'  // Ensure this matches your actual folder structure
};

let journalEntries = [];

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
        console.log("Markdown content fetched:", markdownText.substring(0, 100) + "..."); // Show first 100 chars

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
        </div>
    `;

    document.querySelector('.back-button').addEventListener('click', (e) => {
        e.preventDefault();
        generateJournalLinks();
    });
}

// Load manifest when the page loads
window.addEventListener('DOMContentLoaded', loadManifest);
