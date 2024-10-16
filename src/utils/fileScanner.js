const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

function getDirectoryStructure(dirPath) {
    const excludedFolders = vscode.workspace.getConfiguration('projectStructure').get('excludedFolders');
    const structure = {};

    function readDir(currentPath, obj) {
        fs.readdirSync(currentPath, { withFileTypes: true }).forEach(dirent => {
            if (dirent.isDirectory()) {
                if (excludedFolders.includes(dirent.name)) {
                    // 忽略配置中指定的文件夾
                    return;
                }
                obj[dirent.name] = {};
                readDir(path.join(currentPath, dirent.name), obj[dirent.name]);
            } else {
                obj[dirent.name] = 'file';
            }
        });
    }

    readDir(dirPath, structure);
    return structure;
}

exports.getDirectoryStructure = getDirectoryStructure;
