'use babel';

import TocViewerView from './toc-viewer-view'
import { CompositeDisposable } from 'atom'
import config from './config'

export default {

  config,

  tocViewerView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.tocViewerView = new TocViewerView(state.tocViewerViewState)

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable()

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'toc-viewer:toggle': () => this.tocViewerView.toggle()
    }))
  },

  deactivate() {
    // this.modalPanel.destroy();
    this.subscriptions.dispose()
    // this.tocViewerView.destroy();
  },

  serialize() {
    return {
      tocViewerViewState: this.tocViewerView.serialize()
    }
  }

}
