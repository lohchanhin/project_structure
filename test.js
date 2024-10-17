const { getDirectoryStructure } = require('./src/utils/fileScanner2');
const { generateHtml } = require('./src/utils/generateHtml');
const fs = require('fs');
const path = require('path');

// 指定目錄路徑，你可以使用測試資料夾或你的專案目錄
const dirPath = path.join(__dirname);  // 根據需要調整路徑

// 從 fileScanner 獲取目錄結構
const structure = getDirectoryStructure(dirPath);
console.log("結構",structure);

// 使用獲得的結構生成 HTML
const htmlContent = generateHtml(structure);

// 可選地，將 HTML 內容寫入檔案以在瀏覽器中查看
fs.writeFileSync('output.html', htmlContent, 'utf-8');

console.log('HTML 已生成並寫入到 output.html');
