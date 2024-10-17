const fs = require('fs');
const path = require('path');

function generateHtml(structure) {    

    let globalNodeId = 0;  // Initialize a global node ID counter

    function createMermaidChart(obj, parentId, pathMap) {
        let mermaid = '';
    
        for (const key in obj) {
            const currentId = `node${globalNodeId++}`;
            pathMap[key] = currentId;  // Store current node ID with its key
            if (parentId) {
                mermaid += `${parentId} --> ${currentId}\n`;
            }
            
            if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
                if (key.endsWith('.js') && obj[key].functions) {
                    let functionList = Object.keys(obj[key].functions).join(', ');
                    mermaid += `${currentId}["${key} (${functionList})"]\n`;
                    for (const funcName in obj[key].functions) {
                        const funcDetails = obj[key].functions[funcName];
                        const funcId = `func_${globalNodeId++}_${funcName.replace(/[^a-zA-Z0-9_]/g, '')}`;
                        mermaid += `${currentId} --> ${funcId}\n`;
                        mermaid += `${funcId}["${funcName}"]\n`;
                        funcDetails.calls.forEach(calledFunc => {
                            const calledFuncId = pathMap[calledFunc] || `func_${globalNodeId++}_${calledFunc.replace(/[^a-zA-Z0-9_]/g, '')}`;
                            if (calledFunc !== funcName) {  // Ensure no self-calling links
                                mermaid += `${funcId} --> ${calledFuncId}\n`;
                            }
                        });
                    }
                } else {
                    mermaid += `${currentId}["${key}"]\n`;
                    mermaid += createMermaidChart(obj[key], currentId, pathMap);
                }
            } else {
                mermaid += `${currentId}("${key}")\n`;  // Handle non-JS files or other content
            }
        }
    
        return mermaid;
    }   
       
    
    let pathMap = {};
    let mermaidDiagram = createMermaidChart(structure, null, pathMap);
    
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
        .mermaid path {
            stroke-width: 2px;
            stroke: #333;
        }
        .mermaid path:hover {
            stroke-width: 3px;
            stroke: #ff4757; /* Red highlight color */
        }
    </style>
</head>
<body>
    <div class="mermaid">
        graph TD;
        ${mermaidDiagram}
    </div>
    <script>
        mermaid.initialize({
            startOnLoad: true,
            securityLevel: 'loose',
            flowchart: {
                useMaxWidth: false,
                htmlLabels: true,
            },
            zoom: {
                enabled: true,
            }
        });
    </script>
</body>
</html>
    `;
}

exports.generateHtml = generateHtml;
