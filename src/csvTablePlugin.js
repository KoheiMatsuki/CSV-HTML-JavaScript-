import path from 'node:path';
import { csvFileToRows } from './csv.js';
import { csvRowsToHtmlTable } from './htmlTable.js';

// mdファイル中に書く「<!-- csv: ファイル名 -->」という行を検出するための正規表現。
// ^と$ で「行全体」にマッチさせ、csv: の後ろの (.+?) の部分をキャプチャ（後で取り出せるように）している。
const CSV_DIRECTIVE_RE = /^<!--\s*csv:\s*(.+?)\s*-->\s*$/;

// markdown-itの「プラグイン」は、(md, options) を受け取る関数として作るのがお約束の形。
// md.use(csvTablePlugin, { resolveBaseDir: ... }) のように呼び出すと、
//   このファイル全体がmarkdown-itの処理に組み込まれる。

export default function csvTablePlugin(md, { resolveBaseDir }) {
  // --- ステップ1: Markdownの構文解析結果（トークン）を書き換える ---
  // md.core.ruler.after('block', 名前, 関数) は、
  //   「block（見出しや段落などの構造）を解析した直後」に、自分の処理を追加する、という意味。
  md.core.ruler.after('block', 'csv_table_directive', (state) => {
    // state.tokens には、解析済みのMarkdownが「トークン」という小さな単位の配列で入っている。
    for (const token of state.tokens) {
      // コメント(<!-- -->)は markdown-it 内部では "html_block" というタイプのトークンになる。
      // それ以外のトークン（見出しや段落など）は無視する。
      if (token.type !== 'html_block') continue;

      // トークンの中身（コメントの文字列そのもの）が、CSVディレクティブの形式と一致するか確認する。
      const match = CSV_DIRECTIVE_RE.exec(token.content.trim());
      // 一致しなければ、普通のHTMLコメントとして扱い、そのまま何もしない（後でそのまま出力される）。
      if (!match) continue;

      // 一致した場合は、このトークンを「CSVテーブル用の特別なトークン」に書き換える。
      token.type = 'csv_table_block';
      // meta にはトークンに自由にデータを持たせられる。ここにCSVファイルのパスを記録しておく。
      token.meta = { csvPath: match[1] };
      token.content = '';
    }
  });

  // --- ステップ2: 書き換えたトークンを、実際にどんなHTMLとして出力するかを定義する ---
  // md.renderer.rules.<トークンのtype> に関数を登録すると、
  //   そのtypeのトークンが出てきたときに、この関数の戻り値がHTML文字列として出力される。
  md.renderer.rules.csv_table_block = (tokens, idx) => {
    // tokens[idx] が、今まさに出力しようとしているトークン。そこからCSVパスを取り出す。
    const { csvPath } = tokens[idx].meta;

    // path.resolve(基準ディレクトリ, 相対パス) で、CSVファイルの絶対パスを組み立てる。
    // resolveBaseDir には、build.js から「mdファイルが置かれているディレクトリ」が渡される。
    const absPath = path.resolve(resolveBaseDir, csvPath);

    // CSVファイルを読み込んで配列にし(csvFileToRows)、HTMLの<table>文字列に変換する(csvRowsToHtmlTable)。
    const rows = csvFileToRows(absPath);
    return csvRowsToHtmlTable(rows, md);
  };
}
