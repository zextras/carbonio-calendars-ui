/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import {
	$getNodeByKey,
	DecoratorNode,
	type DOMConversionMap,
	type DOMConversionOutput,
	type DOMExportOutput,
	type EditorConfig,
	type LexicalEditor,
	type LexicalNode,
	type NodeKey,
	type SerializedLexicalNode,
	type Spread
} from 'lexical';

import { ImageComponent } from './image-component';
import { type ImageDimension } from './image-types';

export type { ImageDimension } from './image-types';

export type SerializedImageNode = Spread<
	{
		src: string;
		altText: string;
		width: ImageDimension;
		height: ImageDimension;
	},
	SerializedLexicalNode
>;

function parseDimension(value: string | number | undefined): ImageDimension | undefined {
	if (typeof value === 'number') {
		return value > 0 ? value : undefined;
	}
	if (!value) {
		return undefined;
	}
	const parsed = Number.parseInt(value, 10);
	return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

/**
 * Decorator node representing an image inside the Lexical editor, inserted by
 * URL only — calendars-ui has no device-upload-as-attachment flow, so unlike
 * the carbonio-mails-ui original this node carries no `cid:` bookkeeping and no
 * alignment (both out of scope here).
 *
 * `importDOM`/`exportDOM` stay general-purpose (just a plain `<img src alt
 * width height>`) so a description already containing an `<img>` tag — e.g.
 * authored by another calendar client, or saved by this editor before a
 * reload — still round-trips correctly even though this editor never offers
 * upload.
 */
export class ImageNode extends DecoratorNode<React.JSX.Element> {
	__src: string;

	__altText: string;

	__width: ImageDimension;

	__height: ImageDimension;

	static override getType(): string {
		return 'inline-image';
	}

	static override clone(node: ImageNode): ImageNode {
		return new ImageNode(node.__src, node.__altText, node.__width, node.__height, node.__key);
	}

	constructor(
		src: string,
		altText?: string,
		width?: ImageDimension,
		height?: ImageDimension,
		key?: NodeKey
	) {
		super(key);
		this.__src = src;
		this.__altText = altText ?? 'Image';
		this.__width = width ?? 'inherit';
		this.__height = height ?? 'inherit';
	}

	static override importJSON(serializedNode: SerializedImageNode): ImageNode {
		return new ImageNode(
			serializedNode.src,
			serializedNode.altText,
			serializedNode.width,
			serializedNode.height
		);
	}

	override exportJSON(): SerializedImageNode {
		return {
			type: ImageNode.getType(),
			version: 1,
			src: this.__src,
			altText: this.__altText,
			width: this.__width,
			height: this.__height
		};
	}

	static override importDOM(): DOMConversionMap | null {
		return {
			img: () => ({
				conversion: (domNode: HTMLElement): DOMConversionOutput | null => {
					if (!(domNode instanceof HTMLImageElement)) {
						return null;
					}
					const src = domNode.getAttribute('src') ?? '';
					const altText = domNode.getAttribute('alt') ?? 'Image';
					const width = parseDimension(domNode.style.width) ?? parseDimension(domNode.width);
					const height = parseDimension(domNode.style.height) ?? parseDimension(domNode.height);

					return {
						node: new ImageNode(src, altText, width, height)
					};
				},
				priority: 1
			})
		};
	}

	override exportDOM(): DOMExportOutput {
		const element = document.createElement('img');
		element.setAttribute('src', this.__src);
		element.setAttribute('alt', this.__altText);
		if (this.__width !== 'inherit') {
			element.style.width = `${this.__width}px`;
		}
		if (this.__height !== 'inherit') {
			element.style.height = `${this.__height}px`;
		}
		return { element };
	}

	// eslint-disable-next-line class-methods-use-this -- required Lexical override; the node carries no per-instance styling (no alignment), so only the static theme class is needed
	override createDOM(config: EditorConfig): HTMLElement {
		const span = document.createElement('span');
		if (config.theme.image) {
			span.className = config.theme.image;
		}
		return span;
	}

	// eslint-disable-next-line class-methods-use-this -- required Lexical override; the host <span> never needs a class update after creation (no alignment to react to)
	override updateDOM(): false {
		return false;
	}

	getSrc(): string {
		return this.__src;
	}

	getAltText(): string {
		return this.__altText;
	}

	getWidth(): ImageDimension {
		return this.__width;
	}

	getHeight(): ImageDimension {
		return this.__height;
	}

	setSrc(src: string): void {
		const writable = this.getWritable();
		writable.__src = src;
	}

	setAltText(altText: string): void {
		const writable = this.getWritable();
		writable.__altText = altText;
	}

	setWidthAndHeight(width: ImageDimension, height: ImageDimension): void {
		const writable = this.getWritable();
		writable.__width = width;
		writable.__height = height;
	}

	override decorate(editor: LexicalEditor): React.JSX.Element {
		const key = this.getKey();
		return (
			<ImageComponent
				nodeKey={key}
				src={this.__src}
				altText={this.__altText}
				width={this.__width}
				height={this.__height}
				onResize={(width, height): void => {
					editor.update(() => {
						const node = $getNodeByKey(key);
						if (node instanceof ImageNode) {
							node.setWidthAndHeight(width, height);
						}
					});
				}}
			/>
		);
	}
}

export function $createImageNode(
	src: string,
	altText?: string,
	width?: ImageDimension,
	height?: ImageDimension
): ImageNode {
	return new ImageNode(src, altText, width, height);
}

export function $isImageNode(node: LexicalNode | null | undefined): node is ImageNode {
	return node instanceof ImageNode;
}
