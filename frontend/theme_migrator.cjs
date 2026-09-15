const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

const replacements = {
    'text-slate-900': 'text-white',
    'text-slate-800': 'text-slate-100',
    'text-slate-700': 'text-slate-200',
    'text-slate-600': 'text-slate-300',
    'text-slate-500': 'text-slate-400',
    'text-slate-400': 'text-slate-500', // invert for empty state borders/text
    'bg-white': 'bg-slate-900',
    'bg-slate-50': 'bg-slate-950',
    'bg-slate-100': 'bg-slate-800',
    'bg-slate-200': 'bg-slate-700',
    'border-slate-100': 'border-slate-800',
    'border-slate-200': 'border-slate-700',
    'border-slate-300': 'border-slate-600',
};

walkDir('./src', (filePath) => {
    if (filePath.endsWith('.jsx') || filePath.endsWith('.css')) {
        let content = fs.readFileSync(filePath, 'utf8');
        let original = content;
        
        // Specific fixes before global replace
        if(filePath.endsWith('index.css')) {
            content = content.replace('bg-slate-50 text-slate-900', 'bg-slate-950 text-white');
            content = content.replace('bg-white/70', 'bg-slate-900/70');
            content = content.replace('bg-white/80', 'bg-slate-900/80');
            content = content.replace('border-slate-200/50', 'border-slate-700/50');
            content = content.replace('hsla(252,86%,85%,1)', 'hsla(252,86%,15%,1)');
            content = content.replace('hsla(217,100%,88%,1)', 'hsla(217,100%,15%,1)');
            content = content.replace('hsla(289,100%,88%,1)', 'hsla(289,100%,15%,1)');
            content = content.replace('hsla(331,100%,87%,1)', 'hsla(331,100%,15%,1)');
            content = content.replace('background-color: #f8f9fe;', 'background-color: #020617;');
        }
        
        // Apply global replacements
        for (const [key, value] of Object.entries(replacements)) {
            const regex = new RegExp(`\\b${key}\\b`, 'g');
            // We shouldn't replace text-white with text-slate-900, so we just do one pass
            content = content.replace(regex, value);
        }
        
        // Re-fix some things that might get double replaced or need special handling
        content = content.replace(/bg-slate-900\/50/g, 'bg-slate-900/80'); // ensure glass cards are visible
        
        if (content !== original) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log('Updated:', filePath);
        }
    }
});
