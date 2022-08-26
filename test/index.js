/**
 * @typedef {import('../lib/index.js').HastNode} HastNode
 */

import fs from 'node:fs'
import path from 'node:path'
import test from 'tape'
import glob from 'glob'
import {JSDOM} from 'jsdom'
import {webNamespaces} from 'web-namespaces'
import {h, s} from 'hastscript'
import {toTiptap} from '../index.js'

const window = new JSDOM().window
const document = window.document

globalThis.document = document

test('hast-util-to-tiptap', (t) => {
  t.equal(
    // @ts-expect-error runtime.
    serializeNodeToHtmlString(toTiptap({type: 'root'})),
    '["div",{}]',
    'creates an empty root node'
  )

  t.equal(
    serializeNodeToHtmlString(
      toTiptap({
        type: 'root',
        children: [
          {type: 'element', tagName: 'html', properties: {}, children: []}
        ]
      })
    ),
    '["div",{},["html",{}]]',
    'creates a root node with a document element'
  )

  // T.equal(
  //   serializeNodeToHtmlString(
  //     toTiptap({
  //       type: 'root',
  //       children: [
  //         {type: 'doctype', name: 'html'},
  //         {
  //           type: 'element',
  //           tagName: 'html',
  //           properties: {},
  //           children: [
  //             {type: 'element', tagName: 'head', properties: {}, children: []},
  //             {type: 'element', tagName: 'body', properties: {}, children: []}
  //           ]
  //         }
  //       ]
  //     })
  //   ),
  //   '<!DOCTYPE html><html><head></head><body></body></html>',
  //   'creates a root node with a doctype'
  // )

  t.equal(
    serializeNodeToHtmlString(toTiptap({type: 'text', value: 'hello world'})),
    '"hello world"',
    'creates a text node'
  )

  t.equal(
    serializeNodeToHtmlString(toTiptap(h('div'))),
    '["div",{}]',
    'creates an element node'
  )

  t.equal(
    // @ts-expect-error runtime.
    serializeNodeToHtmlString(toTiptap({type: 'something-else'})),
    '["div",{}]',
    'creates an unknown node in HTML'
  )

  t.equal(
    serializeNodeToHtmlString(
      // @ts-expect-error runtime.
      toTiptap({type: 'something-else'}, {namespace: webNamespaces.svg})
    ),
    '["g",{}]',
    'creates an unknown node in SVG'
  )

  t.equal(
    serializeNodeToHtmlString(
      toTiptap({
        // @ts-expect-error runtime.
        type: 'something-else',
        children: [{type: 'text', value: 'value'}]
      })
    ),
    '["div",{},"value"]',
    'creates an unknown node (with children)'
  )

  t.equal(
    serializeNodeToHtmlString(toTiptap(h('span', ['hello', 'world']))),
    '["span",{},"hello","world"]',
    'creates text nodes inside an element node'
  )

  t.equal(
    serializeNodeToHtmlString(toTiptap(h('#foo.bar', 'text'))),
    '["div",{"id":"foo","class":"bar"},"text"]',
    'creates an html element'
  )

  t.equal(
    serializeNodeToHtmlString(
      toTiptap(s('#foo.bar', s('circle')), {namespace: webNamespaces.svg})
    ),
    '["g",{"id":"foo","class":"bar"},["circle",{}]]',
    'creates SVG elements'
  )

  t.equal(
    serializeNodeToHtmlString(
      toTiptap(h('input', {disabled: true, value: 'foo'}))
    ),
    // '<input disabled="" value="foo" />',
    '["input",{"disabled":"","value":"foo"}]',
    'creates an input node with some attributes'
  )

  t.equal(
    serializeNodeToHtmlString(
      toTiptap(h('input', {type: 'checkbox', checked: true}))
    ),
    // '<input type="checkbox" checked="" />',
    '["input",{"type":"checkbox","checked":""}]',
    'creates an checkbox where `checked` must be set as a property'
  )

  t.equal(
    serializeNodeToHtmlString(
      toTiptap({
        type: 'element',
        tagName: 'div',
        properties: {allowFullScreen: false},
        children: []
      })
    ),
    '["div",{}]',
    'handles falsey booleans correctly'
  )

  t.equal(
    serializeNodeToHtmlString(toTiptap(h('div', {class: ['foo', 'bar']}))),
    // '<div class="foo bar"></div>',
    '["div",{"class":"foo bar"}]',
    'handles space-separated attributes correctly'
  )

  t.equal(
    serializeNodeToHtmlString(
      toTiptap(h('input', {type: 'file', accept: ['image/*', '.doc']}))
    ),
    // `<input type="file" accept="image/*, .doc" />`,
    '["input",{"type":"file","accept":"image/*, .doc"}]',
    'handles comma-separated attributes correctly'
  )

  // T.equal(
  //   // @ts-expect-error hast types out of date.
  //   serializeNodeToHtmlString(toTiptap({type: 'doctype'})),
  //   '<!DOCTYPE html>',
  //   'creates a doctype node'
  // )

  t.equal(
    serializeNodeToHtmlString(toTiptap({type: 'comment', value: 'after'})),
    // '<!--after-->',
    '""',
    'creates a comment'
  )

  t.equal(
    serializeNodeToHtmlString(
      toTiptap(
        h('.alpha', [
          'bravo ',
          h('b', 'charlie'),
          ' delta ',
          h('a.echo', {download: true}, 'foxtrot')
        ])
      )
    ),
    // '<div class="alpha">bravo <b>charlie</b> delta <a class="echo" download="">foxtrot</a></div>',
    '["div",{"class":"alpha"},"bravo ",["b",{},"charlie"]," delta ",["a",{"class":"echo","download":""},"foxtrot"]]',
    'creates nested nodes with attributes'
  )

  // t.equal(
  //   serializeNodeToHtmlString(
  //     toTiptap({
  //       type: 'root',
  //       children: [
  //         {
  //           type: 'element',
  //           tagName: 'title',
  //           properties: {},
  //           children: [{type: 'text', value: 'Hi'}]
  //         },
  //         {
  //           type: 'element',
  //           tagName: 'h2',
  //           properties: {},
  //           children: [{type: 'text', value: 'Hello world!'}]
  //         }
  //       ]
  //     })
  //   ),
  //   '<html><title>Hi</title><h2>Hello world!</h2></html>',
  //   'wraps a fragment in an HTML element'
  // )

  // t.equal(
  //   serializeNodeToHtmlString(
  //     toTiptap(
  //       {
  //         type: 'root',
  //         children: [
  //           {
  //             type: 'element',
  //             tagName: 'title',
  //             properties: {},
  //             children: [{type: 'text', value: 'Hi'}]
  //           },
  //           {
  //             type: 'element',
  //             tagName: 'h2',
  //             properties: {},
  //             children: [{type: 'text', value: 'Hello world!'}]
  //           }
  //         ]
  //       },
  //       {}
  //     )
  //   ),
  //   '<title>Hi</title><h2>Hello world!</h2>',
  //   'does not wrap a fragment when the option is specified'
  // )

  // t.equal(
  //   serializeNodeToHtmlString(
  //     toTiptap(
  //       {type: 'root', children: [h('html')]},
  //       {namespace: 'http://example.com'}
  //     )
  //   ),
  //   '<html xmlns="http://example.com"/>',
  //   'should support a given namespace'
  // )

  // const doc = {
  //   /**
  //    * @param {string} namespace
  //    * @param {string} tagName
  //    */
  //   createElementNS(namespace, tagName) {
  //     const name = tagName === 'h1' ? 'h2' : tagName
  //     return document.createElementNS(namespace, name)
  //   },
  //   /**
  //    * @param {string} value
  //    */
  //   createTextNode(value) {
  //     return document.createTextNode(value.toUpperCase())
  //   },
  //   implementation: {
  //     /**
  //      * @param {string} namespace
  //      * @param {string} qualifiedName
  //      * @param {DocumentType} documentType
  //      */
  //     createDocument(namespace, qualifiedName, documentType) {
  //       return document.implementation.createDocument(
  //         namespace,
  //         qualifiedName,
  //         documentType
  //       )
  //     }
  //   }
  // }

  // t.equal(
  //   serializeNodeToHtmlString(
  //     toTiptap(
  //       {
  //         type: 'root',
  //         children: [h('html', [h('title', 'foo'), h('h1', 'bar')])]
  //       },
  //       // @ts-expect-error Minimum of what we need.
  //       {document: doc}
  //     )
  //   ),
  //   '<html><title>FOO</title><h2>BAR</h2></html>',
  //   'should support a given document'
  // )

  t.equal(
    serializeNodeToHtmlString(toTiptap(h('div', {ariaChecked: true}))),
    // '<div aria-checked="true"></div>',
    '["div",{"aria-checked":true}]',
    'handles booleanish attribute with `true` value correctly'
  )

  t.equal(
    serializeNodeToHtmlString(toTiptap(h('div', {ariaChecked: false}))),
    // '<div aria-checked="false"></div>',
    '["div",{"aria-checked":false}]',
    'handles booleanish attribute with `false` value correctly'
  )

  t.equal(
    serializeNodeToHtmlString(toTiptap(h('div', {ariaChecked: 'mixed'}))),
    // '<div aria-checked="mixed"></div>',
    '["div",{"aria-checked":"mixed"}]',
    'handles booleanish attribute with value correctly'
  )

  t.equal(
    serializeNodeToHtmlString(toTiptap(h('div', {dataTest: false}))),
    // '<div></div>',
    '["div",{}]',
    'does not ignore data properties when value is `false`'
  )

  t.equal(
    serializeNodeToHtmlString(toTiptap(h('div', {dataTest: Number.NaN}))),
    // '<div></div>',
    '["div",{}]',
    'ignores data properties when value is `NaN`'
  )

  t.equal(
    serializeNodeToHtmlString(toTiptap(h('div', {dataTest: 0}))),
    // '<div data-test="0"></div>',
    '["div",{"data-test":0}]',
    'encodes data properties when a number'
  )

  t.equal(
    serializeNodeToHtmlString(toTiptap(h('div', {dataTest: true}))),
    // '<div data-test=""></div>',
    '["div",{"data-test":""}]',
    'encodes data properties w/o value `true`'
  )

  t.equal(
    serializeNodeToHtmlString(toTiptap(h('div', {dataTest: ''}))),
    '["div",{"data-test":""}]',
    // '<div data-test=""></div>',
    'encodes data properties when an empty string'
  )

  t.equal(
    serializeNodeToHtmlString(toTiptap(h('div', {dataTest: 'data-test'}))),
    // '<div data-test="data-test"></div>',
    '["div",{"data-test":"data-test"}]',
    'encodes data properties when string'
  )

  t.equal(
    serializeNodeToHtmlString(toTiptap(h('div', {data123: 'dataTest'}))),
    // '<div data-123="dataTest"></div>',
    '["div",{"data-123":"dataTest"}]',
    'encodes data properties when string'
  )

  t.deepEqual(
    (() => {
      /** @type {Array<[HastNode, string]>} */
      const calls = []
      toTiptap(h('html', [h('title', 'Hi')]), {
        afterTransform(node, transformed) {
          calls.push([node, serializeNodeToHtmlString(transformed)])
        }
      })
      return calls
    })(),
    [
      [{type: 'text', value: 'Hi'}, '"Hi"'],
      [h('title', 'Hi'), '["title",{},"Hi"]'],
      [h('html', [h('title', 'Hi')]), '["html",{},["title",{},"Hi"]]']
    ],
    'should invoke afterTransform'
  )

  t.end()
})

test('fixtures', (t) => {
  const root = path.join('test', 'fixtures')
  const fixturePaths = glob.sync(path.join(root, '**/*/'))
  let index = -1

  while (++index < fixturePaths.length) {
    each(fixturePaths[index])
  }

  t.end()

  /**
   * @param {string} fixturePath
   */
  function each(fixturePath) {
    const fixture = path.relative(root, fixturePath)
    const fixtureInput = path.join(fixturePath, 'index.json')
    const fixtureOutput = path.join(fixturePath, 'result.json')
    /** @type {HastNode} */
    const fixtureData = JSON.parse(String(fs.readFileSync(fixtureInput)))
    const parsedActual = serializeNodeToHtmlString(toTiptap(fixtureData), null, '  ')
    /** @type {string} */
    let parsedExpected

    try {
      parsedExpected = fs.readFileSync(fixtureOutput).toString().trim()
    } catch {
      fs.writeFileSync(fixtureOutput, parsedActual)
      return
    }

    t.equal(parsedActual, parsedExpected, fixture)
  }
})

/**
 * @param {import('../lib/index.js').TiptapResult} node
 * @param {any} args
 */
function serializeNodeToHtmlString(node, ...args) {
  return JSON.stringify(node, ...args);
}
