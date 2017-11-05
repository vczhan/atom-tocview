'use strict';

const config = {
    'html_regexp': {
      description: 'Collect comments when it was matched the regexp. eg. `<!-- # match -->`',
      type: 'string',
      default: '<!--\\s*#\\s?(.+?)\\s*-->',
      order: 0
    },
    'css_regexp': {
      description: 'Collect comments when it was matched the regexp. eg. `/* # match */`',
      type: 'string',
      default: '\\/\\**\\s*#\\s?(.+?)\\s*\\**\\/',
      order: 1
    },
    'js_regexp': {
      description: 'Collect comments when it was matched the regexp. eg. `// # match`',
      type: 'string',
      default: '\\/\\/\\s*#\\s?(.+)\\s*',
      order: 2
    },
    'keep_comments': {
      description: 'Define if you want **comments** to keep in code when the toc item was removed.',
        type: 'boolean',
        default: true,
        order: 3
    },
    'delay': {
      description: 'Relect time (ms)',
      type: 'string',
      default: '0',
      order: 4
    }
}

module.exports = config
