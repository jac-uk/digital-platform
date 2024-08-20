/**
 * @jest-environment jsdom
 */

import htmlWriter from '../../functions/shared/htmlWriter.js';

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
    expect(writer.pageHeader()).toContain(writer.defaultStylesheet());
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
    expect(writer.html).toBe('<h2 id="title" style="text-align: left">BIG TITLE</h2>');
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
    expect(writer.html).toBe('<table><tr class="sectionStart"><th>table label</th><td>table value</td></tr><tr><th>table label 2</th><td>table value 2</td></tr></table>');
  });

  it('addParagraph() ...', async () => {
    writer.addParagraph('example paragraph');
    expect(writer.html).toContain('<p style="text-align: left; font-size: inherit; ">example paragraph</p>');
  });

});
