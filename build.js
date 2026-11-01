#!/usr/bin/env node
// 1行目(shebang)は「このファイルをnodeコマンドで実行してください」という目印。
// Windowsでは基本的に無視されるが、Mac/Linuxでスクリプトとして直接実行できるようにするお約束の記法。

// --- 必要な機能を読み込む(import) ---
import fs from 'node:fs';       // ファイルの読み書き
import path from 'node:path';   // ファイルパスの組み立て・解決
import MarkdownIt from 'markdown-it';           // Markdown→HTML変換の本体（npm installしたライブラリ）
import csvTablePlugin from './src/csvTablePlugin.js'; // 自作: CSVディレクティブをテーブルに変換するプラグイン
import { wrapHtmlDocument } from './src/htmlTemplate.js'; // 自作: 最終的なHTML全体を組み立てる関数

// --- コマンドライン引数を取得する ---
//   process.argv は ["node実行ファイルのパス", "build.jsのパス", "sample.md", "out.html"] になる。
const [, , inputArg, outputArg] = process.argv;

// 入力ファイルが指定されていなければ、使い方を表示して終了する。
if (!inputArg) {
  console.error('Usage: node build.js <input.md> [output.html]');
  process.exit(1);
}

// path.resolve: 相対パスを絶対パスに変換する。
const inputPath = path.resolve(inputArg);

const outputPath = outputArg
  ? path.resolve(outputArg)
  : inputPath.replace(/\.md$/i, '.html');

try {
  // mdファイルの中身を文字列として読み込む。
  const mdSource = fs.readFileSync(inputPath, 'utf-8');

  // markdown-itのインスタンス(実体)を作る。{ html: true } は「生のHTMLタグ・コメントを出力にそのまま通す」設定。
  const md = new MarkdownIt({ html: true });

  // 自作プラグインを組み込む。第2引数の resolveBaseDir には、
  //   「mdファイルが置かれているディレクトリ」を渡している（CSVパスの解決に使われる）。
  md.use(csvTablePlugin, { resolveBaseDir: path.dirname(inputPath) });

  // md.render(文字列) で、Markdown文字列をHTML文字列に変換する（ここでCSVテーブルも展開される）。
  const bodyHtml = md.render(mdSource);

  // path.basename(パス, '.md') で、ファイル名から拡張子を除いた部分だけを取り出す（HTMLのtitleに使う）。
  const title = path.basename(inputPath, '.md');

  // 本文HTMLを <html>...</html> 全体で包んで、ファイルに書き出す。
  fs.writeFileSync(outputPath, wrapHtmlDocument({ title, bodyHtml }), 'utf-8');
  console.log(`Wrote ${outputPath}`);
} catch (err) {
  // ファイルが見つからない・読み込めない等のエラーがtry内で起きると、ここに処理が移る。
  console.error(`Build failed: ${err.message}`);
  process.exit(1);
}
