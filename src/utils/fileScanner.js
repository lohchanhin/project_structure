const fs = require('fs');
const path = require('path');
const acorn = require('acorn');
const walk = require('acorn-walk');
const ts = require('typescript');
const vscode = require('vscode');

function parseJavaScript(content) {
    const ast = acorn.parse(content, { ecmaVersion: 2020, sourceType: 'module' });
    const functions = {};
    walk.simple(ast, {
        FunctionDeclaration(node) {
            if (node.id) {
                functions[node.id.name] = { name: node.id.name, calls: [] };
            }
        },
    });

    walk.ancestor(ast, {
        CallExpression(node, ancestors) {
            const calleeName = node.callee.name;
            if (calleeName) {
                let currentFunction = ancestors.reverse().find(ancestor => ancestor.type === 'FunctionDeclaration');
                if (currentFunction && currentFunction.id) {
                    const functionName = currentFunction.id.name;
                    if (functionName && functions[functionName]) {
                        functions[functionName].calls.push(calleeName);
                    }
                }
            }
        },
    });
    return functions;
}

function parseTypeScript(content) {
    const sourceFile = ts.createSourceFile('file.ts', content, ts.ScriptTarget.ES2015, true);
    const functions = {};
    function visit(node) {
        if (ts.isFunctionDeclaration(node) && node.name) {
            functions[node.name.text] = { name: node.name.text, calls: [] };
        }
        ts.forEachChild(node, visit);
    }
    visit(sourceFile);
    return functions;
}

function parseFunctions(content, fileName) {
    const extension = path.extname(fileName);
    if (extension === '.js') {
        return parseJavaScript(content);
    } else if (extension === '.ts') {
        return parseTypeScript(content);
    }
    return {};
}

function getDirectoryStructure(dirPath) {
    const excludedFolders = vscode.workspace.getConfiguration('projectStructure').get('excludedFolders', ['node_modules', '.git']);
    const structure = {};

    function readDir(currentPath, obj) {
        fs.readdirSync(currentPath, { withFileTypes: true }).forEach(dirent => {
            if (dirent.isDirectory()) {
                if (!excludedFolders.includes(dirent.name)) {
                    obj[dirent.name] = {};
                    readDir(path.join(currentPath, dirent.name), obj[dirent.name]);
                }
            } else if (dirent.name.endsWith('.js') || dirent.name.endsWith('.ts')) {
                const filePath = path.join(currentPath, dirent.name);
                const content = fs.readFileSync(filePath, 'utf-8');
                obj[dirent.name] = parseFunctions(content, dirent.name);
            } else {
                obj[dirent.name] = 'file';
            }
        });
    }

    readDir(dirPath, structure);
    return structure;
}

exports.getDirectoryStructure = getDirectoryStructure;
