// 生成するHTML全体で使う、表（状態遷移表）用のCSS。
// バッククォートで囲んだ複数行の文字列（テンプレートリテラル）なので、改行も含めてそのまま文字列になる。
const CSV_TABLE_CSS = `
table.csv-table { border-collapse: collapse; margin: 1em 0; font-family: monospace; }
table.csv-table th, table.csv-table td { border: 1px solid #ccc; padding: 4px 10px; text-align: center; }
table.csv-table thead th { background: #eef; }
table.csv-table th[scope="row"] { text-align: left; background: #fafafa; font-family: sans-serif; }
table.csv-table td.cell-empty { color: #bbb; }
table.csv-table td.cell-value { font-weight: 600; }
`;

// wrapHtmlDocument: markdown-itが生成した本文HTML(bodyHtml)とタイトル(title)を受け取り、
//   <html>や<head>を含む「それ単体で開けるHTMLファイル」の文字列を組み立てて返す。
// 引数が { title, bodyHtml } という波カッコの形になっているのは「分割代入」で、
//   呼び出し側で wrapHtmlDocument({ title: 'xxx', bodyHtml: 'yyy' }) のように
//   オブジェクトとして渡された値を、それぞれの名前の変数として直接受け取れるようにしている。
export function wrapHtmlDocument({ title, bodyHtml }) {
  return `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<title>${title}</title>
<style>${CSV_TABLE_CSS}</style>
</head>
<body>
${bodyHtml}
</body>
</html>
`;
}
