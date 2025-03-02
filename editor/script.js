// Initialize CodeMirror
const editor = CodeMirror.fromTextArea(document.getElementById('editor'), {
    mode: 'markdown',
    theme: 'dracula',
    lineNumbers: true,
    lineWrapping: true,
    autofocus: true,
    tabSize: 2,
    indentWithTabs: false,
    viewportMargin: Infinity
});

// Default content
const defaultMarkdownContent = `

### Login


user: 'Root' 

Authenication: Accepted

### System Log

    
   &gt;&gt;Preferences set
    
   &gt;&gt;Loading files: Sorting oldest to newest
    
   &gt;&gt;Decrypting oldest file
    
   &gt;&gt;Decryption complete

### Temporal Data
&gt;&gt;stardate: "45/Sen/ERA-53::1791"

&gt;&gt;local_time: "" `;

const defaultYamlContent = `

### Login


user: 'Root' 

Authenication: Accepted

### System Log

    
   >>Preferences set
    
   >>Loading files: Sorting oldest to newest
    
   >>Decrypting oldest file
    
   >>Decryption complete

### Temporal Data
>>stardate: "45/Sen/ERA-53::1791"

>>local_time: "" `;

// Set default content based on mode
let editorMode = 'markdown';
editor.setValue(defaultMarkdownContent);

// Mode selector change event
document.getElementById('mode-selector').addEventListener('change', (e) => {
    editorMode = e.target.value;
    if (editorMode === 'markdown') {
        editor.setOption('mode', 'markdown');
        editor.setValue(defaultMarkdownContent);
    } else {
        editor.setOption('mode', 'yaml');
        editor.setValue(defaultYamlContent);
    }
    updatePreview();
});

// Preview function
function updatePreview() {
    const text = editor.getValue();
    const previewElement = document.getElementById('preview');

    if (editorMode === 'markdown') {
        previewElement.innerHTML = marked.parse(text);
    } else {
        previewElement.textContent = text;
    }

    updateWordCount();
}

// Word and character count
function updateWordCount() {
    const text = editor.getValue();
    const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
    const charCount = text.length;
    
    document.getElementById('word-count').textContent = `${wordCount} words`;
    document.getElementById('char-count').textContent = `${charCount} characters`;
}

// Initial preview update
updatePreview();

// Update preview on editor changes
editor.on('change', updatePreview);

// Toolbar functions
function insertText(before, after = '') {
    const selection = editor.getSelection();
    editor.replaceSelection(before + selection + after);
    
    // If nothing was selected, place cursor appropriately
    if (!selection) {
        const cursor = editor.getCursor();
        editor.setCursor({ line: cursor.line, ch: cursor.ch - after.length });
    }
    editor.focus();
}

// Fullscreen mode toggle
let isFullscreen = false;
let fullscreenSection = null;

function toggleFullscreen(section = null) {
    const body = document.body;
    
    if (!isFullscreen) {
        body.classList.add('fullscreen-mode');
        isFullscreen = true;
        fullscreenSection = section;
        
        // If a specific section is specified, hide the other one
        if (section === 'editor') {
            document.querySelector('.preview-section').style.display = 'none';
            document.querySelector('.editor-section').style.flex = '1';
        } else if (section === 'preview') {
            document.querySelector('.editor-section').style.display = 'none';
            document.querySelector('.preview-section').style.flex = '1';
        }
        
        document.getElementById('fullscreen').textContent = 'Exit Fullscreen';
        editor.refresh(); // Refresh CodeMirror to adjust to new size
    } else {
        body.classList.remove('fullscreen-mode');
        isFullscreen = false;
        
        // Restore both sections
        document.querySelector('.preview-section').style.display = 'flex';
        document.querySelector('.editor-section').style.display = 'flex';
        document.querySelector('.editor-section').style.flex = '1';
        document.querySelector('.preview-section').style.flex = '1';
        
        document.getElementById('fullscreen').textContent = 'Fullscreen Mode';
        editor.refresh(); // Refresh CodeMirror to adjust to new size
        fullscreenSection = null;
    }
}

// ESC key to exit fullscreen
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isFullscreen) {
        toggleFullscreen();
    }
});

// Export functions
function downloadFile(content, filename, contentType) {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Toolbar event listeners
document.getElementById('bold').addEventListener('click', () => {
    insertText('**', '**');
});

document.getElementById('italic').addEventListener('click', () => {
    insertText('*', '*');
});

document.getElementById('heading').addEventListener('click', () => {
    insertText('## ');
});

document.getElementById('link').addEventListener('click', () => {
    insertText('[', '](https://example.com)');
});

document.getElementById('image').addEventListener('click', () => {
    insertText('![Alt text](', ')');
});

document.getElementById('list').addEventListener('click', () => {
    insertText('- Item 1\n- Item 2\n- Item 3\n');
});

document.getElementById('code').addEventListener('click', () => {
    insertText('```\n', '\n```');
});

document.getElementById('quote').addEventListener('click', () => {
    insertText('> ');
});

// Updated clear button to reset to default content
document.getElementById('clear').addEventListener('click', () => {
    if (confirm('Are you sure you want to reset to default content?')) {
        if (editorMode === 'markdown') {
            editor.setValue(defaultMarkdownContent);
        } else {
            editor.setValue(defaultYamlContent);
        }
    }
});

document.getElementById('fullscreen').addEventListener('click', () => {
    toggleFullscreen();
});

// Export event listeners
document.getElementById('export-md').addEventListener('click', () => {
    const text = editor.getValue();
    const extension = editorMode === 'markdown' ? 'md' : 'yaml';
    const mimeType = editorMode === 'markdown' ? 'text/markdown' : 'application/x-yaml';
    downloadFile(text, `vampire-document.${extension}`, mimeType);
});

document.getElementById('export-html').addEventListener('click', () => {
    const markdown = editor.getValue();
    const html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Exported Document</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            padding: 20px;
            max-width: 800px;
            margin: 0 auto;
        }
        pre {
            background-color: #f5f5f5;
            padding: 16px;
            border-radius: 4px;
            overflow-x: auto;
        }
        code {
            background-color: #f5f5f5;
            padding: 2px 4px;
            border-radius: 3px;
        }
        blockquote {
            border-left: 4px solid #ddd;
            padding-left: 16px;
            margin-left: 0;
            color: #666;
        }
    </style>
</head>
<body>
    ${marked.parse(markdown)}
</body>
</html>`;
    downloadFile(html, 'vampire-document.html', 'text/html');
});

document.getElementById('export-pdf').addEventListener('click', () => {
    const markdown = editor.getValue();
    const printContent = document.getElementById('print-content');
    printContent.innerHTML = marked.parse(markdown);
    
    const options = {
        margin: 1,
        filename: 'vampire-document.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'cm', format: 'a4', orientation: 'portrait' }
    };
    
    html2pdf().set(options).from(printContent).save();
});

document.getElementById('export-print').addEventListener('click', () => {
    window.print();
});

document.getElementById('export-copy').addEventListener('click', () => {
    const markdown = editor.getValue();
    navigator.clipboard.writeText(markdown).then(() => {
        alert('Content copied to clipboard!');
    }).catch(err => {
        console.error('Could not copy text: ', err);
        alert('Failed to copy to clipboard. Your browser may not support this feature.');
    });
});

// Section header fullscreen buttons
document.querySelectorAll('.toggle-fullscreen').forEach(button => {
    button.addEventListener('click', (e) => {
        const section = e.target.closest('.editor-section') ? 'editor' : 'preview';
        toggleFullscreen(section);
    });
});

// Add keyboard shortcuts
editor.setOption('extraKeys', {
    'Ctrl-B': () => insertText('**', '**'),
    'Ctrl-I': () => insertText('*', '*'),
    'Ctrl-H': () => insertText('## '),
    'Ctrl-K': () => insertText('[', '](url)'),
    'Ctrl-L': () => insertText('- '),
    'F11': () => toggleFullscreen()
});

// Refresh editor on window resize to fix layout
window.addEventListener('resize', () => {
    editor.refresh();
});

// Load from localStorage if available
window.addEventListener('load', () => {
    const savedContent = localStorage.getItem('vampireMarkdownContent');
    if (savedContent) {
        editor.setValue(savedContent);
    }
    // Force a refresh after load to ensure proper sizing
    setTimeout(() => editor.refresh(), 100);
});

// Save to localStorage on changes
editor.on('change', () => {
    localStorage.setItem('vampireMarkdownContent', editor.getValue());
});