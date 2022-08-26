# hast-util-to-tiptap

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Size][size-badge]][size]
[![Sponsors][sponsors-badge]][collective]
[![Backers][backers-badge]][collective]
[![Chat][chat-badge]][chat]

[hast][] utility to transform to a [TipTap][] tree.

## Contents

*   [What is this?](#what-is-this)
*   [When should I use this?](#when-should-i-use-this)
*   [Install](#install)
*   [Use](#use)
*   [API](#api)
    *   [`toTipTap(node[, options])`](#totipTap-options)
*   [Types](#types)
*   [Compatibility](#compatibility)
*   [Security](#security)
*   [Related](#related)
*   [Contribute](#contribute)
*   [License](#license)

## What is this?

This package is a utility that creates a TipTap tree.

## When should I use this?

You can use this project when you want to turn hast into a TipTap node tree for renderHTML.

## Install

This package is [ESM only][esm].
In Node.js (version 12.20+, 14.14+, or 16.0+), install with [npm][]:

```sh
npm install hast-util-to-tiptap
```

## API

This package exports the identifier `toTipTap`.
There is no default export.

### `toTipTap(node[, options])`

Turn a hast tree into a DOM tree.

##### `options`

Configuration (optional).

###### `options.namespace`

`namespace` to use to create elements (`string?`, optional).

###### `options.afterTransform`

Called when a hast node was transformed into a DOM node
(`(HastNode, TipTapTree) => void?`, optional).

##### Returns

[`TipTap`][tipTapTree].

## Types

This package is fully typed with [TypeScript][].
It exports the additional type `Options`.

## Compatibility

Projects maintained by the unified collective are compatible with all maintained
versions of Node.js.
As of now, that is Node.js 17.3.0.
Our projects sometimes work with older versions, but this is not guaranteed.

## Security

Use of `hast-util-to-tiptap` can open you up to a
[cross-site scripting (XSS)][xss] attack if the hast tree is unsafe.
Use [`hast-util-santize`][hast-util-sanitize] to make the hast tree safe.

## Related

*   [`hast-util-to-dom`](https://github.com/syntax-tree/hast-util-to-dom)
    — original repo
*   [`hast-util-sanitize`](https://github.com/syntax-tree/hast-util-sanitize)
    — sanitize hast nodes
*   [`hast-util-to-html`](https://github.com/syntax-tree/hast-util-to-html)
    — serialize as HTML
*   [`hast-util-from-dom`](https://github.com/syntax-tree/hast-util-from-dom)
    — create a hast tree from a DOM tree

## Contribute

This project has a [code of conduct][coc].
By interacting with this repository, organisation, or community you agree to
abide by its terms.

## License

[ISC][license] © [Keith McKnight][author]

<!-- Definitions -->

[build-badge]: https://github.com/firtozb/hast-util-to-tiptap/workflows/main/badge.svg

[build]: https://github.com/firtozb/hast-util-to-tiptap/actions

[coverage-badge]: https://img.shields.io/codecov/c/github/firtozb/hast-util-to-tiptap.svg

[coverage]: https://codecov.io/github/firtozb/hast-util-to-tiptap

[downloads-badge]: https://img.shields.io/npm/dm/hast-util-to-tiptap.svg

[downloads]: https://www.npmjs.com/package/hast-util-to-tiptap

[size-badge]: https://img.shields.io/bundlephobia/minzip/hast-util-to-tiptap.svg

[size]: https://bundlephobia.com/result?p=hast-util-to-tiptap

[sponsors-badge]: https://opencollective.com/unified/sponsors/badge.svg

[backers-badge]: https://opencollective.com/unified/backers/badge.svg

[collective]: https://opencollective.com/unified

[chat-badge]: https://img.shields.io/badge/chat-discussions-success.svg

[chat]: https://github.com/firtozb/unist/discussions

[npm]: https://docs.npmjs.com/cli/install

[esm]: https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c

[esmsh]: https://esm.sh

[typescript]: https://www.typescriptlang.org

[license]: license

[author]: https://keith.mcknig.ht

[hast]: https://github.com/syntax-tree/hast

[TipTap]: https://tiptap.dev/guide/custom-extensions#render-html

[dom]: https://developer.mozilla.org/docs/Web/API/Document_Object_Model

[xss]: https://en.wikipedia.org/wiki/Cross-site_scripting

[hast-util-sanitize]: https://github.com/syntax-tree/hast-util-sanitize

[hast-util-from-dom]: https://github.com/syntax-tree/hast-util-from-dom

[jsdom]: https://github.com/jsdom/jsdom

[rehype-dom-stringify]: https://github.com/rehypejs/rehype-dom/tree/main/packages/rehype-dom-stringify
