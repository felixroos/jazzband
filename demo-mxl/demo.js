import * as opensheetmusicdisplay from 'opensheetmusicdisplay';
import { MusicJSON } from '../src/mxl/MusicJSON';

window.onload = function() {
  let sheet = require('./demoSheet.json');
  renderStaff(sheet);
  const editor = ace.edit('ace');
  const xmleditor = ace.edit('xml-output');
  xmleditor.setTheme('ace/theme/monokai');
  xmleditor.session.setMode('ace/mode/xml');
  editor.setTheme('ace/theme/monokai');
  editor.session.setMode('ace/mode/json');
  /* editor.getSession().setMode('ace/mode/javascript'); */
  // editor.setOptions({ fontSize: '11pt' });
  editor.setValue(JSON.stringify(sheet, null, '\t'), -1);
  editor.getSession().on('change', () => {
    try {
      const parsed = JSON.parse(editor.getValue());
      sheet = parsed;
      console.log('valid json');
      renderStaff(sheet);
    } catch (e) {
      console.warn('invalid json');
    }
  });
  document.getElementById('download-xml').addEventListener('click', () => {
    const filename = 'hack.musicxml';
    var element = document.createElement('a');
    element.setAttribute(
      'href',
      'data:text/plain;charset=utf-8,' + encodeURIComponent(xmleditor.getValue())
    );
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  });
  document.getElementById('render-xml').addEventListener('click', () => {
    const xml = xmleditor.getValue();
    renderXML(xml);
  });

  /* document.getElementById('staff').addEventListener('click', () => {
    sheet = JSON.parse(editor.getValue());
    renderStaff(sheet);
  }); */

  function renderStaff(sheet) {
    const rendered = MusicJSON.renderXML(sheet);
    setTimeout(() => {
      if (xmleditor) {
        xmleditor.setValue(rendered, -1);
      }
      renderXML(rendered);
    }, 200);
  }

  function renderXML(xml) {
    document.getElementById('osmd').innerHTML = '';
    const osmd = new opensheetmusicdisplay.OpenSheetMusicDisplay('osmd', {
      autoResize: true
    });
    osmd.load(xml);
    osmd.render();
  }
};
