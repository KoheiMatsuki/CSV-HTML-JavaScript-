// Node.jsの標準モジュール「fs」（file system = ファイル操作）を読み込む。
// 先頭に "node:" を付けると「Node.js組み込みモジュールですよ」という意味になる。
import fs from 'node:fs';

// 「export」を付けた関数は、他のファイルから import して使えるようになる。
// parseCsv: CSVファイルの中身（文字列）を受け取り、「行 × セル」の二重配列に変換する関数。
//   例: "a,b\nc,d" -> [["a", "b"], ["c", "d"]]
export function parseCsv(text) {
  return text
    // ファイル先頭にBOM（Excelなどが付けがちな目に見えない特殊文字）が付いている場合に取り除く。
    .replace(/^﻿/, '')
    // 改行コードで1行ずつに分割する。Windows(\r\n)・Mac旧式(\r)・Unix(\n)のどれでも対応できるようにしている。
    .split(/\r\n|\r|\n/)
    // 空行（最後の改行の後にできる空文字列など）を取り除く。
    .filter((line) => line.length > 0)
    // 残った各行を、カンマ区切りで配列に分割する。line.split(',') で "a,b" -> ["a", "b"] になる。
    .map((line) => line.split(','));
}

// csvFileToRows: CSVファイルのパス（絶対パス）を受け取り、ファイルを読み込んでから
//   上の parseCsv に渡す関数。「ファイルを読む処理」と「文字列をパースする処理」を分けている。
export function csvFileToRows(absPath) {
  // fs.readFileSync: 指定したパスのファイルを同期的（処理が終わるまで待つ）に読み込む。
  // 第2引数 'utf-8' は文字コードの指定（日本語が含まれるファイルを正しく読むため）。
  return parseCsv(fs.readFileSync(absPath, 'utf-8'));
}
