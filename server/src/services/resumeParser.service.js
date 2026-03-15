const fs = require('fs');
const path = require('path');

async function parseResumeFile(filePath, mimeType) {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === '.pdf') {
    return parsePDF(filePath);
  } else if (ext === '.docx' || ext === '.doc') {
    return parseDOCX(filePath);
  } else {
    throw new Error('Unsupported file type. Please upload PDF or DOCX.');
  }
}

async function parsePDF(filePath) {
  try {
    const pdfParse = require('pdf-parse');
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text;
  } catch (err) {
    throw new Error('Failed to parse PDF: ' + err.message);
  }
}

async function parseDOCX(filePath) {
  try {
    const mammoth = require('mammoth');
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  } catch (err) {
    throw new Error('Failed to parse DOCX: ' + err.message);
  }
}

module.exports = { parseResumeFile };
