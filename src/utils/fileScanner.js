const fs = require('fs');
const path = require('path');
const acorn = require('acorn');
const walk = require('acorn-walk');  // 引入 acorn-walk
const vscode = require('vscode');

function parseFunctions(content) {
    try {
        const ast = acorn.parse(content, { ecmaVersion: 2020, sourceType: 'module' });
        const functions = {};
        const dependencies = [];

        acornWalk.simple(ast, {
            ImportDeclaration(node) {
                let dependencyPath = path.basename(node.source.value);
                dependencies.push(dependencyPath);
            },
            CallExpression(node) {
                if (node.callee.name === 'require') {
                    let dependencyPath = path.basename(node.arguments[0].value);
                    dependencies.push(dependencyPath);
                }
            },
            FunctionDeclaration(node) {
                if (node.id && node.id.name) {
                    functions[node.id.name] = { name: node.id.name, calls: [] };
                }
            }
        });

        acornWalk.ancestor(ast, {
            CallExpression(node, ancestors) {
                const funcName = node.callee.name;
                if (funcName) {
                    let currentFunction = ancestors.reverse().find(ancestor => ancestor.type === 'FunctionDeclaration');
                    if (currentFunction && currentFunction.id) {
                        let functionName = currentFunction.id.name;
                        if (functionName && functions[functionName]) {
                            functions[functionName].calls.push(funcName);
                        }
                    }
                }
            }
        });

        console.log(`Parsed ${filePath}:`, { functions, dependencies });
        return { functions, dependencies };
    } catch (error) {
        console.error(`Error parsing ${filePath}:`, error);
        return { functions: {}, dependencies: [] };
    }
}


function getDirectoryStructure(dirPath) {
    const excludedFolders = vscode.workspace.getConfiguration('projectStructure').get('excludedFolders', []);
    const structure = {};

    function readDir(currentPath, obj) {
        fs.readdirSync(currentPath, { withFileTypes: true }).forEach(dirent => {
            if (dirent.isDirectory()) {
                if (excludedFolders.includes(dirent.name)) {
                    return;
                }
                obj[dirent.name] = {};
                readDir(path.join(currentPath, dirent.name), obj[dirent.name]);
            } else {
                if (dirent.name.endsWith('.js') || dirent.name.endsWith('.ts')) {
                    const content = fs.readFileSync(path.join(currentPath, dirent.name), 'utf-8');
                    obj[dirent.name] = parseFunctions(content);
                } else {
                    obj[dirent.name] = 'file';
                }
            }
        });
    }

    readDir(dirPath, structure);
    return structure;
}

exports.getDirectoryStructure = getDirectoryStructure;
