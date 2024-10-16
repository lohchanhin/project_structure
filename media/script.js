// script.js
window.addEventListener('DOMContentLoaded', (event) => {
    console.log('DOM fully loaded and parsed');

    // Add event listeners or other initialization logic here
    document.querySelectorAll('.folder').forEach(folder => {
        folder.addEventListener('click', function() {
            this.querySelector('ul').classList.toggle('visible');
        });
    });

    // Assuming there is a button to trigger updates from the extension
    document.getElementById('updateButton').addEventListener('click', () => {
        vscode.postMessage({
            command: 'update',
            content: 'Hello from webview!'
        });
    });
});

// Receive messages from the extension
window.addEventListener('message', event => {
    const message = event.data; // Parse the message as per the needs

    switch (message.command) {
        case 'refetch':
            // Handle the message, e.g., refetch data
            console.log('Refetching data as per extension\'s request.');
            break;
        default:
            console.log('Unknown command from extension:', message.command);
    }
});
