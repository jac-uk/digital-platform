const DEFAULT_STYLESHEET = `
  <style>
    body {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 11pt;
    }
    th {
      color: #0B0C14;
      width: 50%;
      text-align: left;
      border-bottom: solid 1px #0B0C14;
      padding: 4px 8px;
      vertical-align: top;
    }
    td {
      color: #0B0C14;
      border-bottom: solid 1px #0B0C14;
      padding: 4px 8px;
      vertical-align:top;
    }
    table {
      border-spacing: 0;
      padding-bottom: 20px;
      width: 800px;
    }
    .sectionStart th, .sectionStart td {
      padding: 30px 8px 8px 8px;
    }
    h2 {
      padding-top: 10px;
    }
    h4 {
      padding-top: 30px;
    }
    .red {
      color:red;
    }
    .gray {
      color:gray;
    }
    p, ul {
      margin-bottom: 15px;
    }
    .vertical-text {
      transform: rotate(-90deg);
      /* Legacy vendor prefixes that you probably don't need... */
      /* Safari */
      -webkit-transform: rotate(-90deg);
      /* Firefox */
      -moz-transform: rotate(-90deg);
      /* IE */
      -ms-transform: rotate(-90deg);
      /* Opera */
      -o-transform: rotate(-90deg);
      /* Internet Explorer */
      filter: progid:DXImageTransform.Microsoft.BasicImage(rotation=3);
    }
  </style>
`;

class htmlWriter {
  constructor() {
    this.html = '';
    this.stylesheet = '';
  }
  defaultStylesheet() {
    return DEFAULT_STYLESHEET;
  }
  toString() {
    if (this.html !== '') {
      return this.pageHeader() + this.html + this.pageFooter();
    }
    return this.html;
  }
  pageHeader() {
    if (this.stylesheet === '') {
      return `<html><head>${DEFAULT_STYLESHEET}</head><body>`;
    } else {
      return `<html><head>${this.stylesheet}</head><body>`;
    }
  }
  pageFooter() {
    return '</body></html>';
  }
  setStylesheet(data) {
    this.stylesheet = data;
  }
  addTitle(data, textAlign = 'left') {
    this.html += `<h2 id="title" style="text-align: ${textAlign}">${data}</h2>`;
  }
  addHeading(data, textAlign = 'left', fontSize = 'inherit', extraStyle = '') {
    // data = data.match(/[A-Z][a-z]+|[0-9]+/g).join(' ');
    let style = `style="text-align: ${textAlign}; font-size: ${fontSize}; ${extraStyle}"`;
    this.html += `<h4 id="${data.split(' ').join('_')}_heading" ${style}>${data}</h4>`;
  }
  addHeadingRaw(html, textAlign = 'left', fontSize = 'inherit', extraStyle = '') {
    let style = `style="text-align: ${textAlign}; font-size: ${fontSize}; ${extraStyle}"`;
    this.html += `<h4 ${style}>${html}</h4>`;
  }
  addTable(data) {
    const tableStart = '<table>';
    const tableEnd = '</table>';
    const rowStartSectionStart = '<tr class="sectionStart">';
    const rowStart = '<tr>';
    const rowEnd = '</tr>';
    const headingStart = '<th>';
    const headingEnd = '</th>';
    const dataStart = '<td>';
    const dataEnd = '</td>';

    const rowHtml = [];
    data.forEach(each => {
      const heading = each.label;
      let value = each.value;
      let html = each.lineBreak ? rowStartSectionStart : rowStart;
      if (each.dataOnSeparateRow) { // Put heading and value in separate rows
        html += headingStart + heading + headingEnd  + rowEnd + rowStart + dataStart + value + dataEnd + rowEnd;
      }
      else { // Put heading and value in same row
        html += headingStart + heading + headingEnd + dataStart + value + dataEnd + rowEnd;
      }
      rowHtml.push(html);
    });
    rowHtml.unshift(tableStart);
    rowHtml.push(tableEnd);
    this.html += rowHtml.join('');
  }
  addParagraph(data, textAlign = 'left', fontSize = 'inherit', extraStyle = '') {
    let style = `style="text-align: ${textAlign}; font-size: ${fontSize}; ${extraStyle}`;
    this.html += `<p ${style}">${data}</p>`;
  }
  addRaw(s) {
    this.html += s;
  }
  addPageBreak() {
    this.html += '<hr class="pb">'; /* Google Docs interprets this is a page break (don't know why) */
  }
}

export default htmlWriter;
