const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'frontend', 'src');

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf-8');
    let changed = false;

    // Case 1: single quotes 'http://127.0.0.1:8000/api...'
    const regexSingle = /'http:\/\/127\.0\.0\.1:8000([^']*)'/g;
    if (regexSingle.test(content)) {
        content = content.replace(regexSingle, "`http://${window.location.hostname}:8000$1`");
        changed = true;
    }

    // Case 2: backticks `http://127.0.0.1:8000/api...`
    const regexBacktick = /`http:\/\/127\.0\.0\.1:8000([^`]*)`/g;
    if (regexBacktick.test(content)) {
        content = content.replace(regexBacktick, "`http://${window.location.hostname}:8000$1`");
        changed = true;
    }

    // Case 3: double quotes "http://127.0.0.1:8000/api..."
    const regexDouble = /"http:\/\/127\.0\.0\.1:8000([^"]*)"/g;
    if (regexDouble.test(content)) {
        content = content.replace(regexDouble, "`http://${window.location.hostname}:8000$1`");
        changed = true;
    }

    if (changed) {
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log('Fixed:', filePath);
    }
}

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkDir(fullPath);
        } else if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
            processFile(fullPath);
        }
    }
}

walkDir(srcDir);
console.log('Done!');
