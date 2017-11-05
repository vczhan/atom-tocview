'use babel';

import { Point } from 'atom'
import {$, View} from 'atom-space-pen-views'

export default class TocViewerView extends View {

  constructor () {
    super()
    this.panel = null
    this.config = atom.config.get('toc-viewer')
  }

  static content () {
    return this.div({
      class: 'toc-viewer'
    }, () => {
      this.tag('toc-viewer', {
        class: 'toc-viewer-contain'
      }, () => {
        this.tag('tv-head', 'Toc Viewer', {
          class: 'toc-viewer-head'
        })
        this.tag('tv-body', {
          class: 'toc-viewer-body'
        }, () => {
          this.ul({
            class: 'toc-viewer-list list-tree',
            outlet: 'list'
          })
        })
      })
    })
  }

  initialize () {
    let tooltip

    atom.config.observe('toc-viewer', () => {
      this.updateConfig()
    })

    atom.workspace.onDidChangeActivePaneItem(activeItem => {
      if (activeItem && activeItem.constructor.name === 'TextEditor') {
        if (this.panel && this.panel.visible) {
          this.show()
        }
      } else {
        this.hide()
      }
    })

    this.list.on('click', 'li', e => {
      const row = e.currentTarget.dataset.row
      this.selectToc(row)
    })

    this.list.on('click', 'i', e => {
      e.stopPropagation()
      const data = e.currentTarget.parentNode.dataset

      this.removeToc(data)
      $(e.currentTarget).parent().remove()
      tooltip.dispose()
    })

    this.list.on({
      mouseenter (e) {
        tooltip = atom.tooltips.add(e.currentTarget, {
          title: this.dataset.text,
          placement: 'left',
          html: false
        })
      },
      mouseleave () {
        tooltip.dispose()
      }
    }, 'li')


    const editor = this.getTextEditor()
    const delay = 3000

    const deboune = (function() {
      let sid = null
      return (callback, delay) => {
        clearTimeout(sid)
        sid = setTimeout(callback, delay)
      }
    })()

    editor.onDidStopChanging(() => {
      if (this.panel.visible) {
        deboune(this.updateData.bind(this), this.config.delay)
      }
    })
  }

  serialize () {
    return null
  }

  quit () {
    this.panel.hide()
  }

  show () {
    if (this.panel === null) {
      this.panel = atom.workspace.addRightPanel({
        item: this
      })
    }

    if (this.getTextEditor()) {
      this.updateData()
      this.panel.show()
    } else {
      this.panel.hide()
      this.panel.visible = false
    }
  }

  hide () {
    if (this.panel !== null) {
      this.panel.hide()
    }
  }

  toggle () {
    if (this.panel !== null ? this.panel.visible : !1) {
      this.hide()
    } else {
      this.show()
    }
  }

  updateConfig () {
    this.config = atom.config.get('toc-viewer')
  }

  updateData () {
    const htmlRegexp = new RegExp(this.config.html_regexp) // /<!--\s*#\s?(.+?)\s*-->/  // <!-- # match -->
    const cssRegexp = new RegExp(this.config.css_regexp) // /\/\**\s*#\s?(.+?)\s*\**\// // /** # match **/
    const jsRegexp = new RegExp(this.config.js_regexp) ///\/\/\s*#\s?(.+)\s*/ // # match

    const editor = this.getTextEditor()

    let htmlToc = '',
        cssToc = '',
        jsToc = '',
        row = 0

    for (let line of editor.buffer.lines) {

      switch (row++, true) {
        case htmlRegexp.test(line):
          htmlToc += this.viewForItem(row, line.match(htmlRegexp)[1], 'html')
          break
        case cssRegexp.test(line):
          cssToc += this.viewForItem(row, line.match(cssRegexp)[1], 'css')
          break
        case jsRegexp.test(line):
          jsToc += this.viewForItem(row, line.match(jsRegexp)[1], 'js')
          break
        default:
          break
      }

    }

    this.updateView(htmlToc, cssToc, jsToc)
  }

  updateView (htmlToc, cssToc, jsToc) {
    this.list.empty()

    if (htmlToc) {
      this.list.append('<div class="toc-type"><i class="icon icon-ta"></i> HTML</div>')
      this.list.append(htmlToc)
    }
    if (cssToc) {
      this.list.append('<div class="toc-type"><i class="icon icon-ta"></i> CSS</div>')
      this.list.append(cssToc)
    }
    if (jsToc) {
      this.list.append('<div class="toc-type"><i class="icon icon-ta"></i> JavaScript</div>')
      this.list.append(jsToc)
    }
  }

  viewForItem (row, text, type) {
    return `<li class="toc-viewer-item"
                data-row="${row}"
                data-text="${text}"
                data-type="${type}">
              <em class="row">${row}</em>
              <span class="text">${text}</span>
              <i class="btn-remove icon-remove-close"></i>
            </li>`
  }

  getTextEditor () {
    return atom.workspace.getActiveTextEditor()
  }

  selectToc (rowNumber) {
    const row = rowNumber - 1
    const editor = this.getTextEditor()
    const position = new Point(row, 0)

    editor.setCursorBufferPosition(position)
    editor.unfoldBufferRow(row)
    editor.scrollToCursorPosition()
  }

  removeToc ({row, type, text}) {
    const editor = this.getTextEditor()
    const selection = editor.getLastSelection()
    const position = new Point(row - 1, 0)

    editor.setCursorBufferPosition(position)

    if (this.config.keep_comments) {
      let newWords = ''
      switch (type) {
        case 'html':
          newWords = `<!-- ${text} -->`
          break
        case 'css':
          newWords = `/* ${text} */`
          break
        case 'js':
          newWords = `// ${text}`
          break
      }

      selection.selectToEndOfLine()
      selection.delete()
      selection.insertText(newWords)
    } else {
      selection.deleteLine()
    }
  }

}
