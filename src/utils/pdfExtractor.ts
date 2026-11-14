import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

export interface PdfExtractionResult {
  text: string;
  pageCount: number;
  fileName: string;
}

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export async function extractTextFromPdf(file: File): Promise<PdfExtractionResult> {
  const isPdfExtension = file.name.toLowerCase().endsWith('.pdf');
  const isPdfMime = file.type === 'application/pdf' || file.type === '';

  if (!isPdfExtension && !isPdfMime) {
    throw new Error('Please upload a valid PDF file (.pdf).');
  }

  if (file.size === 0) {
    throw new Error('The selected PDF file appears to be empty.');
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error('PDF file exceeds the 10 MB limit. Please upload a smaller file or paste your resume text.');
  }

  let arrayBuffer: ArrayBuffer;
  try {
    arrayBuffer = await file.arrayBuffer();
  } catch {
    throw new Error('Could not read the selected file from disk. Please try selecting it again.');
  }

  let pdfDocument: pdfjsLib.PDFDocumentProxy;
  try {
    const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
    pdfDocument = await loadingTask.promise;
  } catch (err) {
    const msg = err instanceof Error ? err.message.toLowerCase() : '';
    if (msg.includes('password')) {
      throw new Error('This PDF is password-protected. Please unlock it or paste your resume text instead.');
    }
    throw new Error('Unable to parse this PDF. The file may be corrupted or use an unsupported format.');
  }

  const pageCount = pdfDocument.numPages;
  if (pageCount === 0) {
    throw new Error('This PDF contains zero pages.');
  }

  const pageTexts: string[] = [];

  for (let pageNumber = 1; pageNumber <= pageCount; pageNumber++) {
    const page = await pdfDocument.getPage(pageNumber);
    const textContent = await page.getTextContent();

    const lines: string[] = [];
    let currentLine = '';
    let lastY: number | null = null;

    for (const item of textContent.items) {
      if (!('str' in item)) continue;
      const textItem = item as { str: string; transform?: number[] };
      const y = Array.isArray(textItem.transform) ? textItem.transform[5] : null;

      if (lastY !== null && y !== null && Math.abs(y - lastY) > 4) {
        if (currentLine.trim()) {
          lines.push(currentLine.trim());
        }
        currentLine = textItem.str;
      } else {
        currentLine += (currentLine && textItem.str && !currentLine.endsWith(' ') && !textItem.str.startsWith(' ') ? ' ' : '') + textItem.str;
      }

      if (y !== null) {
        lastY = y;
      }
    }

    if (currentLine.trim()) {
      lines.push(currentLine.trim());
    }

    pageTexts.push(lines.join('\n'));
  }

  const combinedText = pageTexts
    .join('\n\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  if (combinedText.length < 40) {
    throw new Error(
      'No selectable text was found in this PDF (it may be a scanned image). Please export a text-based PDF or paste your resume text directly.'
    );
  }

  return {
    text: combinedText,
    pageCount,
    fileName: file.name,
  };
}
