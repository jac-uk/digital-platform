/**
 * @jest-environment jsdom
 */

const htmlWriter = require('../../functions/shared/htmlWriter');
const DEFAULT_STYLESHEET = `
  <style>
    body {
      font-family: Khula, HelveticaNeue, Arial, Helvetica, sans-serif;
      font-size: 1.1875rem;
    }
    th {
      color: #0B0C14;
      width: 50%;
      text-align: left;
      border-bottom: solid 1px #0B0C14;
      padding: 8px;
      vertical-align: top;
    }
    td {
      color: #0B0C14;
      border-bottom: solid 1px #0B0C14;
      padding: 8px;
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
  </style>
`;

describe('htmlWriter', () => {

  let writer;
  
  beforeEach(()=>{
    writer = new htmlWriter();
  });

  it('writer has html', () => {
    expect(writer).toHaveProperty('html');
  });
  
  it('writer has StyleSheet', () => {
    expect(writer).toHaveProperty('stylesheet');
  });

  it('writer StyleSheet empty by default', () => {
    expect(writer.stylesheet).toBe('');
  });
  
  it('pageHeader() contains default stylesheet', () => {
    expect(writer.pageHeader()).toContain(DEFAULT_STYLESHEET);
  });

  it('pageFooter() returns body and html closing tags', () => {
    expect(writer.pageFooter()).toBe('</body></html>');
  });

  it('setStylesheet() ...', () => {
    writer.setStylesheet('example');
    expect(writer.stylesheet).toBe('example');
  });

  it('toString() ...', () => {
    expect(writer.toString()).toBe('');
  });

  it('pageFooter() ...', () => {
    expect(writer.pageFooter()).toBe('</body></html>');
  });

  it('addTitle() ...', () => {
    writer.addTitle('BIG TITLE');
    expect(writer.html).toBe('<h2 id="title">BIG TITLE</h2>');
  });

  it('addHeading() ...', async () => {
    writer.addHeading('heading');
    expect(writer.html).toContain('heading');
  });

  it('addTable() ...', async () => {
    writer.addTable([
      {
        label: 'table label',
        value: 'table value',
        lineBreak: true,
      },
      {
        label: 'table label 2',
        value: 'table value 2',
        lineBreak: false,
      },
    ]);
    expect(writer.html).toBe('<table><tr class=\"sectionStart\"><th>table label</th><td>table value</td></tr><tr><th>table label 2</th><td>table value 2</td></tr></table>');
  });

  it('addParagraph() ...', async () => {
    writer.addParagraph('example paragraph');
    expect(writer.html).toContain('<p>example paragraph</p>');
  });

});
