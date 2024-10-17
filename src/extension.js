const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const { getDirectoryStructure } = require('./utils/fileScanner2');
const { generateHtml } = require('./utils/generateHtml');

function activate(context) {
    let disposable = vscode.commands.registerCommand('extension.showProjectStructure', function () {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showInformationMessage('No project open to display the structure.');
            return;
        }

        const projectPath = vscode.workspace.workspaceFolders
            ? vscode.workspace.workspaceFolders[0].uri.fsPath
            : null;
        if (!projectPath) {
            vscode.window.showErrorMessage('No workspace folder opened.');
            return;
        }

        // Retrieve the directory structure
        const structure = getDirectoryStructure(projectPath);
        // Convert the structure to HTML format for display in a webview
        const htmlContent = generateHtml(structure);

        // Create and display a new webview
        const panel = vscode.window.createWebviewPanel(
            'projectStructure', // Identifier for the webview used
            'Project Structure', // Title of the panel displayed to the user
            vscode.ViewColumn.One, // In which editor column to show the new webview panel.
            {
                enableScripts: true // Enable JavaScript in the webview
            }
        );

        // Set the HTML content of the webview
        panel.webview.html = htmlContent;

        // Save HTML content to the local filesystem and provide an option to open it
        const htmlFilePath = path.join(projectPath, 'project_structure.html');
        fs.writeFileSync(htmlFilePath, htmlContent, 'utf-8');

        vscode.window.showInformationMessage('HTML file generated. Would you like to open it now?', 'Yes', 'No')
            .then(selection => {
                if (selection === 'Yes') {
                    vscode.commands.executeCommand('vscode.open', vscode.Uri.file(htmlFilePath));
                }
            });
    });

    context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
