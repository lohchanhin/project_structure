function generateHtml(structure) {
    let nodeId = 0; // Node ID counter to ensure unique nodes

    function createMermaidChart(obj, parentId) {
        let mermaid = '';
        for (const key in obj) {
            const currentId = `node${nodeId++}`; // Generate a unique ID for the current node
            if (parentId) {
                mermaid += `${parentId} --> ${currentId}\n`; // Connect parent node to current node
            }
            if (typeof obj[key] === 'object' && Object.keys(obj[key]).length > 0) {
                mermaid += `${currentId}[${key}]\n`;
                mermaid += createMermaidChart(obj[key], currentId);
            } else {
                mermaid += `${currentId}("${key}")\n`;
            }
        }
        return mermaid;
    }

    const chartContent = createMermaidChart(structure);
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Project Structure</title>
    <link href="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.css" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f4f4f4;
            color: #333;
            padding: 20px;
            overflow: auto;
        }
        .mermaid {
            background-color: white;
            border: 1px solid #ccc;
            padding: 10px;
            overflow: scroll;
            width: 100%;
            height: auto;
        }
    </style>
</head>
<body>
    <div class="mermaid">
        graph TD;
        ${chartContent}
    </div>
    <script>
        mermaid.initialize({
            startOnLoad: true,
            securityLevel: 'loose', // Allow HTML in node descriptions
            flowchart: {
                useMaxWidth: false, // Allows the diagram to take full width
                htmlLabels: true, // Allows HTML in labels
            },
            zoom: {
                enabled: true, // Enable zooming
            }
        });
    </script>
</body>
</html>
    `;
}

exports.generateHtml = generateHtml;
