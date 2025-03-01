// Configuration
const config = {
    manifestPath: 'md/manifest.yaml',
    markdownPath: 'md/'
};

// State
let journalEntries = [];

// DOM Elements
const journalLinksContainer = document.getElementById('journal-links');

// Event Listeners
window.addEventListener('DOMContentLoaded', async () => {
    await loadManifest();
    generateJournalLinks();
});

// Load the manifest (YAML) containing journal entry metadata
async function loadManifest() {
    try {
        const response = await fetch(config.manifestPath);
        if (!response.ok) throw new Error('Failed to load manifest');
        const yamlText = await response.text();
        const data = jsyaml.load(yamlText);
        
        journalEntries = data.entries.map(entry => ({
            ...entry,
            file: `${config.markdownPath}${entry.file}`
        }));
        
    } catch (error) {
        console.error('Error loading manifest:', error);
        showError('Failed to load journal entries. Please try again later.');
    }
}

// Load Markdown content for a specific journal entry
async function loadMarkdown(postId) {
    try {
        const entry = journalEntries.find(e => e.id === postId);
        if (!entry) throw new Error('Entry not found');
        
        const response = await fetch(entry.file);
        if (!response.ok) throw new Error('Journal entry not found');
        
        const markdownText = await response.text();
        const htmlContent = marked.parse(markdownText);
        renderBlogPost(entry, htmlContent);
        
    } catch (error) {
        console.error('Error loading markdown:', error);
        showError('Failed to load journal entry. Please try again later.');
    }
}

// Render the content of the selected journal entry
function renderBlogPost(entry, content) {
    const blogPost = document.createElement('div');
    blogPost.className = 'journal-post-container';
    blogPost.innerHTML = `
        <div class="journal-post">
            <h2>${entry.title}</h2>
            <div class="content">${content}</div>
            <a href="#" class="back-button">Back to Journal</a>
        </div>
    `;

    blogPost.querySelector('.back-button').addEventListener('click', (e) => {
        e.preventDefault();
        showJournal();
    });

    document.body.innerHTML = ''; // Clear the page
    document.body.appendChild(blogPost); // Show the selected journal entry
}

// Generate links to each journal entry on the homepage
function generateJournalLinks() {
    journalLinksContainer.innerHTML = '';
    
    journalEntries.forEach(entry => {
        const link = document.createElement('a');
        link.href = `#${entry.id}`;
        link.className = 'journal-link';
        link.textContent = entry.title;
        link.addEventListener('click', (e) => {
            e.preventDefault();
            loadMarkdown(entry.id);
        });
        journalLinksContainer.appendChild(link);
    });
}

// Show error messages
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error';
    errorDiv.textContent = message;
    journalLinksContainer.innerHTML = '';
    journalLinksContainer.appendChild(errorDiv);
}

// Back to the list of journal entries
function showJournal() {
    document.body.innerHTML = ''; // Clear the page
    document.body.appendChild(document.querySelector('main')); // Re-show the homepage with links
}
