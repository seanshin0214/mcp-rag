/**
 * Document Indexer - PDF를 ChromaDB에 인덱싱
 */

import fs from 'fs';
import path from 'path';
import pdf from 'pdf-parse';
import { encoding_for_model } from 'tiktoken';

const CHUNK_SIZE = 500;
const CHUNK_OVERLAP = 50;

/**
 * 텍스트를 청크로 분할
 */
export function splitTextIntoChunks(text, chunkSize = CHUNK_SIZE, overlap = CHUNK_OVERLAP) {
  const encoding = encoding_for_model('gpt-4');
  const tokens = encoding.encode(text);
  const chunks = [];

  let start = 0;
  while (start < tokens.length) {
    const end = Math.min(start + chunkSize, tokens.length);
    const chunkTokens = tokens.slice(start, end);
    const chunkText = new TextDecoder().decode(encoding.decode(chunkTokens));

    chunks.push({
      text: chunkText,
      startToken: start,
      endToken: end
    });

    start = end - overlap;
    if (start >= tokens.length - overlap) break;
  }

  encoding.free();
  return chunks;
}

/**
 * PDF에서 텍스트 추출
 */
export async function extractTextFromPDF(pdfPath) {
  const dataBuffer = fs.readFileSync(pdfPath);
  const data = await pdf(dataBuffer);

  return {
    text: data.text,
    numPages: data.numpages,
    info: data.info
  };
}

/**
 * 텍스트 파일에서 텍스트 추출
 */
export async function extractTextFromTxt(txtPath) {
  const text = fs.readFileSync(txtPath, 'utf-8');

  return {
    text: text,
    numPages: 1,
    info: { Title: path.basename(txtPath) }
  };
}

/**
 * 파일 형식에 따라 텍스트 추출
 */
export async function extractText(filePath) {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === '.pdf') {
    return await extractTextFromPDF(filePath);
  } else if (ext === '.txt' || ext === '.md') {
    return await extractTextFromTxt(filePath);
  } else {
    throw new Error(`지원하지 않는 파일 형식: ${ext} (지원: .pdf, .txt, .md)`);
  }
}

/**
 * 문서를 ChromaDB에 인덱싱
 */
export async function indexDocument(chromaClient, collectionName, filePath, metadata = {}) {
  // 1. 텍스트 추출
  const docData = await extractText(filePath);

  // 2. 청크로 분할
  const chunks = splitTextIntoChunks(docData.text);

  // 3. 컬렉션 가져오기 또는 생성
  let collection;
  try {
    collection = await chromaClient.getCollection({ name: collectionName });
  } catch (error) {
    collection = await chromaClient.createCollection({
      name: collectionName,
      metadata: {
        description: metadata.description || 'Document collection',
        created_at: new Date().toISOString()
      }
    });
  }

  // 4. 기존 문서 삭제 (같은 파일명)
  const fileName = path.basename(filePath);
  try {
    const existing = await collection.get({
      where: { source: fileName }
    });

    if (existing.ids.length > 0) {
      await collection.delete({
        where: { source: fileName }
      });
    }
  } catch (error) {
    // 무시
  }

  // 5. 청크 저장
  const ids = [];
  const documents = [];
  const metadatas = [];

  const timestamp = Date.now();

  for (let i = 0; i < chunks.length; i++) {
    ids.push(`${collectionName}_${fileName}_${timestamp}_${i}`);
    documents.push(chunks[i].text);
    metadatas.push({
      chunk_index: i,
      total_chunks: chunks.length,
      start_token: chunks[i].startToken,
      end_token: chunks[i].endToken,
      source: fileName,
      file_path: filePath,
      collection: collectionName,
      indexed_at: new Date().toISOString(),
      ...metadata
    });
  }

  await collection.add({
    ids: ids,
    documents: documents,
    metadatas: metadatas
  });

  return {
    collectionName,
    fileName,
    numChunks: chunks.length,
    numPages: docData.numPages
  };
}
