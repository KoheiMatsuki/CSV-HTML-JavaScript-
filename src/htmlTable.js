// csvRowsToHtmlTable: parseCsv() で得られた「行 × セル」の二重配列(rows)と、
//   markdown-itのインスタンス(md)を受け取り、HTMLの <table> タグの文字列を組み立てて返す関数。
// md を受け取っているのは、markdown-itが持っているHTMLエスケープ関数(md.utils.escapeHtml)を
//   そのまま再利用して、セルの値に "<" や "&" などが含まれていても安全にHTML化するため。
export function csvRowsToHtmlTable(rows, md) {
  const esc = md.utils.escapeHtml;

  // 分割代入（destructuring）という書き方。
  // rows の 0番目の要素を headerRow に、残り全部を bodyRows という配列に取り出している。
  //   例: rows = [["", "A", "B"], ["x", "1", "2"], ["y", "3", "4"]]
  //       headerRow = ["", "A", "B"]
  //       bodyRows  = [["x", "1", "2"], ["y", "3", "4"]]
  const [headerRow, ...bodyRows] = rows;

  // ヘッダー行のHTMLを組み立てる。
  // headerRow.map(...) で各セルの文字列を "<th>セル内容</th>" に変換し、
  // .join('') で配列の要素を全部つなげて1つの文字列にする。
  // `<tr>${...}</tr>` はテンプレートリテラル。バッククォート(`)で囲むと、
  //   ${式} の部分に式の結果を埋め込める（文字列の "+" 連結の代わりに使える便利な書き方）。
  const theadHtml = `<tr>${headerRow.map((c) => `<th>${esc(c)}</th>`).join('')}</tr>`;

  // 本体行のHTMLを組み立てる。
  const tbodyHtml = bodyRows
    .map(([label, ...cells]) => {
      // ここでも分割代入を使っている。各行の0番目(イベント名など)を label に、
      // 残りのセル(遷移先の値)を cells という配列に取り出している。

      const tds = cells
        .map((c) => {
          // 値が "-" だけなら「遷移なし」とみなし、CSSクラスを変えて薄く表示する。
          const empty = c.trim() === '-';
          return `<td class="${empty ? 'cell-empty' : 'cell-value'}">${esc(c)}</td>`;
        })
        .join('');

      // th[scope="row"] は「この行の見出しセル」という意味のHTML属性（アクセシビリティ対応）。
      return `<tr><th scope="row">${esc(label)}</th>${tds}</tr>`;
    })
    .join('');

  // thead（見出し行）と tbody（本体行）を組み合わせた <table> 全体のHTML文字列を返す。
  return `<table class="csv-table">\n<thead>${theadHtml}</thead>\n<tbody>${tbodyHtml}</tbody>\n</table>`;
}
