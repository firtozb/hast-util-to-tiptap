/**
 * @typedef {import('hast').Root} HastRoot
 * @typedef {import('hast').DocType} HastDoctype
 * @typedef {import('hast').Element} HastElement
 * @typedef {import('hast').Text} HastText
 * @typedef {import('hast').Comment} HastComment
 * @typedef {import('hast').Content} HastChild
 * @typedef {HastChild|HastRoot} HastNode
 */

/**
 * @callback AfterTransform
 *   Function called when a hast node is transformed into a DOM node
 * @param {HastNode} hastNode
 *   The hast node that was handled
 * @param {TiptapResult} tree
 *   The corresponding DOM node
 * @returns {void}
 */

/**
 * @typedef {TiptapTree|string} TiptapResult
 * @typedef {string} TiptapTag
 * @typedef {Record<string, string | number | boolean | (string | number)[] | null | undefined>} TiptapAttributes
 * @typedef {[TiptapTag, TiptapAttributes, ...(TiptapResult|0)[]]} TiptapTree
 *
 */

/**
 * @typedef Options
 *   Configuration (optional).
 * @property {string} [namespace]
 *   `namespace` to use to create elements.
 * @property {AfterTransform} [afterTransform]
 *   Callback invoked after each node transformation
 */

/**
 * @typedef Context
 * @property {string} [namespace]
 * @property {string} [impliedNamespace]
 * @property {AfterTransform} [afterTransform]
 */

/* eslint-env browser */

import { webNamespaces } from 'web-namespaces'

import { find, svg, html } from 'property-information'

/**
 * Transform a hast tree to a DOM tree
 *
 * @param {HastNode} node
 * @param {Options} [options]
 * @returns {TiptapResult}
 */
export function toTiptap(node, options = {}) {
  return transform(node, { ...options })
}

/**
 * @param {HastNode} node
 * @param {Context} ctx
 * @returns {TiptapResult}
 */
function transform(node, ctx) {
  const transformed = one(node, ctx)
  if (ctx.afterTransform) ctx.afterTransform(node, transformed)
  return transformed
}

/**
 * @param {HastNode} node
 * @param {Context} ctx
 * @returns {TiptapResult}
 */
function one(node, ctx) {
  switch (node.type) {
    case 'root':
      return root(node, ctx)
    case 'text':
      return text(node, ctx)
    case 'element':
      return element(node, ctx)
    case 'doctype':
      // throw new Error('not able to handle this...')
      return doctype(node, ctx)
    case 'comment':
      return comment(node, ctx)
    default:
      return element(node, ctx)
  }
}

/**
 * Create a document.
 *
 * @param {HastRoot} node
 * @param {Context} ctx
 * @returns {TiptapResult}
 */
function root(node, ctx) {
  const { namespace: ctxNamespace } = ctx
  const { children = [] } = node

  let namespace = ctxNamespace
  // Let rootIsDocument = children.length === 0
  let index = -1

  while (++index < children.length) {
    const child = children[index]

    if (child.type === 'element' && child.tagName === 'html') {
      const { properties = {} } = child

      // If we have a root HTML node, we don’t need to render as a fragment.
      // rootIsDocument = true

      // Take namespace of the first child.
      if (ctxNamespace === undefined) {
        namespace = String(properties.xmlns || '') || webNamespaces.html
      }
    }
  }

  // The root node will be a Document, DocumentFragment, or HTMLElement.
  /** @type {TiptapResult} */
  const result = ['div', {}]

  // If (rootIsDocument) {
  //   result = doc.implementation.createDocument(namespace || null, '', null)
  // } else if (fragment) {
  //   result = doc.createDocumentFragment()
  // } else {
  //   result = doc.createElement('html')
  // }

  return appendAll(result, children, {
    ...ctx,
    namespace,
    impliedNamespace: namespace
  })
}

/**
 * Create a `doctype`.
 *
 * @param {HastDoctype} _
 * @param {Context} ctx
 * @returns {TiptapResult}
 */
function doctype(_, {}) {
  return '';//doc.implementation.createDocumentType('html', '', '')
}

/**
 * Create a `text`.
 *
 * @param {HastText} node
 * @param {Context} _
 * @returns {TiptapResult}
 */
function text(node, _) {
  return node.value
}

/**
 * Create a `comment`.
 *
 * @param {HastComment} node
 * @param {Context} _
 * @returns {TiptapResult}
 */
function comment(node, _) {
  return ''
  // Return doc.createComment(node.value)
}

/**
 * Create an `element`.
 *
 * @param {HastElement} node
 * @param {Context} ctx
 * @returns {TiptapResult}
 */

function element(node, ctx) {
  const { namespace } = ctx
  let impliedNamespace = ctx.impliedNamespace || namespace
  const {
    tagName = impliedNamespace === webNamespaces.svg ? 'g' : 'div',
    properties = {},
    children = []
  } = node

  if (
    (impliedNamespace === null ||
      impliedNamespace === undefined ||
      impliedNamespace === webNamespaces.html) &&
    tagName === 'svg'
  ) {
    impliedNamespace = webNamespaces.svg
  }

  // Const schema = impliedNamespace === webNamespaces.svg ? svg : html

  // const result =
  //   impliedNamespace === null || impliedNamespace === undefined
  //     ? doc.createElement(tagName)
  //     : doc.createElementNS(impliedNamespace, tagName)
  const schema = impliedNamespace === webNamespaces.svg ? svg : html;

  /**
   * @type {TiptapAttributes}
   */
  const propertiesClone = {};
  // Object.fromEntries(
  //   Object.entries(properties).map((entry) => {
  //     const [key, value] = entry
  //     if (key === 'className') {
  //       return ['class', value]
  //     }
  //
  //     return entry
  //   })
  // )

  /**
   * @type {TiptapTree}
   */
  const result = [tagName, propertiesClone]

  // Add HTML attributes.
  const props = Object.keys(properties)
  const { length } = props

  for (let i = 0; i < length; i += 1) {
    const key = props[i]

    const {
      attribute,
      property,
      // `mustUseAttribute`,
      mustUseProperty,
      boolean,
      booleanish,
      overloadedBoolean,
      // `number`,
      // `defined`,
      commaSeparated
      // `spaceSeparated`,
      // `commaOrSpaceSeparated`,
    } = find(schema, key)

    let value = properties[key]

    if (Array.isArray(value)) {
      value = value.join(commaSeparated ? ', ' : ' ')
    }

    if (mustUseProperty) {
      // @ts-expect-error: fine.
      result[property] = value
    }
    // else {
    // propertiesClone[attribute] = value;
    // }

    // console.log({booleanish, attribute, property, value});


    if (boolean || (overloadedBoolean && typeof value === 'boolean')) {
      if (value) {
        propertiesClone[attribute] = '';
        // result.setAttribute(attribute, '')
      } else {
        delete propertiesClone[attribute];
        // result.removeAttribute(attribute)
      }
    } else if (booleanish) {
      propertiesClone[attribute] = value;
      // result.setAttribute(attribute, String(value))
    } else if (value === true) {
      propertiesClone[attribute] = '';
      // result.setAttribute(attribute, '')
    } else if (value || value === 0 || value === '') {
      propertiesClone[attribute] = value;

      // propertiesClone.setAttribute(attribute, String(value))
    }
  }

  return appendAll(result, children, { ...ctx, impliedNamespace })
}

/**
 * Add all children.
 *
 * @param {TiptapResult} node
 * @param {Array<HastChild>} children
 * @param {Context} ctx
 * @returns {TiptapResult}
 */
function appendAll(node, children, ctx) {
  if (children.length === 0) {
    return node
  }

  if (Array.isArray(node)) {
    // if(node.length === 2) {
    // append the child
    // }
    // const nodeElement = node[2]
    // if (Array.isArray(nodeElement)) {
    for (const child of children) {
      node.push(transform(child, ctx))
    }
    // }

    return node
  }

  if (children.length === 1) {
    return transform(children[0], ctx)
  }

  console.error('Unhandled appending...', {
    node,
    children,
    ctx
  })

  throw new Error('Unhandled case')
}
