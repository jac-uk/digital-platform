import initInitialisePanelExport from './initialisePanelExport.js';
import initProcessPanelExport from './processPanelExport.js';

export default (config, firebase, db) => {

  const { initialisePanelExport } = initInitialisePanelExport(config, firebase, db);
  const { processPanelExport } = initProcessPanelExport(config, firebase, db);

  return onUpdate;

  /**
   * Panels event handler for Update
   * - if status has changed to approved then initialise export
   * - if processingId has changed (and status is 'processing') then process corresponding Id
   */
  async function onUpdate(panelId, dataBefore, dataAfter) {
    if (dataBefore.status !== dataAfter.status && dataAfter.status === 'approved') {
      await initialisePanelExport(panelId);
    } else if ((dataBefore.status !== dataAfter.status && dataAfter.status === 'processing') || dataAfter.status === 'processing' && dataBefore.processing.current !== dataAfter.processing.current) {
      await processPanelExport(panelId);
    }
    return true;
  }

};
