/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { Button, Container, Input, Modal, Tooltip } from '@zextras/carbonio-design-system';
import { t } from '@zextras/carbonio-shell-ui';
import { $getNodeByKey, type LexicalEditor } from 'lexical';

import { INSERT_INLINE_IMAGE_COMMAND } from './image-plugin';
import { $getSelectedImageNode, $isImageNode, type ImageNode } from './nodes/image-node';
import { type ImageDimension } from './nodes/image-types';

type ImageModalProps = {
	editor: LexicalEditor;
	open: boolean;
	onClose: () => void;
};

type Dimensions = {
	width: ImageDimension;
	height: ImageDimension;
};

/** A dimension of the edited image and the text its input was pre-filled with. */
type InitialDimension = {
	value: ImageDimension;
	input: string;
};

type InitialDimensions = {
	width: InitialDimension;
	height: InitialDimension;
};

/**
 * Pre-fills the input of a stored {@link ImageDimension}; an 'inherit' dimension
 * shows the size the image is currently rendered with.
 */
function initialDimension(
	value: ImageDimension,
	renderedSize: number | undefined
): InitialDimension {
	if (value !== 'inherit') {
		return { value, input: String(value) };
	}
	return { value, input: renderedSize ? String(renderedSize) : '' };
}

function readInitialDimensions(editor: LexicalEditor, imageNode: ImageNode): InitialDimensions {
	const rendered = editor.getElementByKey(imageNode.getKey())?.querySelector('img');
	return {
		width: initialDimension(imageNode.getWidth(), rendered?.clientWidth),
		height: initialDimension(imageNode.getHeight(), rendered?.clientHeight)
	};
}

/** Turns the input text back into an {@link ImageDimension} (empty/invalid -> 'inherit'). */
function inputToDimension(value: string): ImageDimension {
	const trimmed = value.trim();
	if (trimmed === '') {
		return 'inherit';
	}
	const parsed = Number(trimmed);
	return Number.isFinite(parsed) && parsed > 0 ? parsed : 'inherit';
}

/** Whether the source embeds the image data (a dropped or pasted image file). */
function isEmbeddedSource(src: string): boolean {
	return src.startsWith('data:');
}

/**
 * Dimensions saved for the inputs. While both inputs still hold their pre-filled
 * text the image keeps its own dimensions: saving the dialog (e.g. to change the
 * alternative text) must not pin an image sized by the browser to the size it
 * happens to be rendered with. Once either input changes both are saved as
 * shown, so that the side left untouched after unlocking the ratio keeps the
 * value displayed instead of going back to the browser's choice.
 */
function toDimensions(
	width: string,
	height: string,
	initial: InitialDimensions | null
): Dimensions {
	if (initial?.width.input === width && initial.height.input === height) {
		return { width: initial.width.value, height: initial.height.value };
	}
	return { width: inputToDimension(width), height: inputToDimension(height) };
}

/** Width/height ratio of the given input values, or `null` if either is not a positive number. */
function ratioOf(width: string, height: string): number | null {
	const w = Number(width);
	const h = Number(height);
	return w > 0 && h > 0 ? w / h : null;
}

/**
 * Modal "Insert/Edit Image" dialog: it collects the image source URL, the
 * alternative description and the width/height. When a single image node is
 * selected the fields are pre-filled so the same dialog edits it in place (the
 * width/height of an image without explicit size show its rendered size);
 * otherwise a brand-new image is inserted at the caret.
 *
 * The width/height fields can be kept proportional through the aspect-ratio
 * lock: while locked, editing one dimension scales the other using the image's
 * natural ratio (read by loading the source), falling back to the width/height
 * ratio captured when the dialog opened or the lock was last engaged. The
 * fallback is captured rather than recomputed per keystroke, otherwise clearing
 * or partially typing a value would make the ratio drift.
 *
 * The source of an embedded image (a `data:` URI, as big as the image itself)
 * is not shown: the source field stays empty, which keeps the image, unless an
 * address is entered to replace it.
 */
export const ImageModal = ({ editor, open, onClose }: ImageModalProps): React.JSX.Element => {
	const [src, setSrc] = useState('');
	const [embeddedSrc, setEmbeddedSrc] = useState<string | null>(null);
	const [altText, setAltText] = useState('');
	const [width, setWidth] = useState('');
	const [height, setHeight] = useState('');
	const [locked, setLocked] = useState(true);
	const editImageKey = useRef<string | null>(null);
	const initialDimensions = useRef<InitialDimensions | null>(null);
	const naturalRatio = useRef<number | null>(null);
	const fallbackRatio = useRef<number | null>(null);

	useEffect(() => {
		if (!open) {
			return;
		}
		naturalRatio.current = null;
		editor.getEditorState().read(() => {
			const imageNode = $getSelectedImageNode();
			editImageKey.current = imageNode?.getKey() ?? null;
			initialDimensions.current = imageNode ? readInitialDimensions(editor, imageNode) : null;
			const nextWidth = initialDimensions.current?.width.input ?? '';
			const nextHeight = initialDimensions.current?.height.input ?? '';
			const nextSrc = imageNode?.getSrc() ?? '';
			const isEmbedded = isEmbeddedSource(nextSrc);
			setSrc(isEmbedded ? '' : nextSrc);
			setEmbeddedSrc(isEmbedded ? nextSrc : null);
			setAltText(imageNode?.getAltText() ?? '');
			setWidth(nextWidth);
			setHeight(nextHeight);
			fallbackRatio.current = ratioOf(nextWidth, nextHeight);
		});
		setLocked(true);
	}, [editor, open]);

	// The source applied on save: the embedded one is kept while no other is entered
	const effectiveSrc = src || embeddedSrc || '';

	useEffect(() => {
		if (!open || !effectiveSrc) {
			return undefined;
		}
		let cancelled = false;
		const image = new Image();
		image.onload = (): void => {
			if (cancelled || !image.naturalWidth || !image.naturalHeight) {
				return;
			}
			naturalRatio.current = image.naturalWidth / image.naturalHeight;
			if (!editImageKey.current) {
				setWidth((prev) => (prev === '' ? String(image.naturalWidth) : prev));
				setHeight((prev) => (prev === '' ? String(image.naturalHeight) : prev));
			}
		};
		image.src = effectiveSrc;
		return (): void => {
			cancelled = true;
		};
	}, [open, effectiveSrc]);

	const currentRatio = useCallback(
		(): number | null => naturalRatio.current ?? fallbackRatio.current,
		[]
	);

	const toggleLock = useCallback((): void => {
		if (!locked) {
			fallbackRatio.current = ratioOf(width, height);
		}
		setLocked(!locked);
	}, [height, locked, width]);

	const onWidthChange = useCallback(
		(ev: React.ChangeEvent<HTMLInputElement>): void => {
			const { value } = ev.target;
			setWidth(value);
			if (!locked) {
				return;
			}
			const ratio = currentRatio();
			const w = Number(value);
			if (ratio && w > 0) {
				setHeight(String(Math.round(w / ratio)));
			}
		},
		[currentRatio, locked]
	);

	const onHeightChange = useCallback(
		(ev: React.ChangeEvent<HTMLInputElement>): void => {
			const { value } = ev.target;
			setHeight(value);
			if (!locked) {
				return;
			}
			const ratio = currentRatio();
			const h = Number(value);
			if (ratio && h > 0) {
				setWidth(String(Math.round(h * ratio)));
			}
		},
		[currentRatio, locked]
	);

	const onConfirm = useCallback(() => {
		if (!effectiveSrc) {
			return;
		}
		const { width: nextWidth, height: nextHeight } = toDimensions(
			width,
			height,
			initialDimensions.current
		);
		const key = editImageKey.current;
		if (key) {
			editor.update(() => {
				const node = $getNodeByKey(key);
				if ($isImageNode(node)) {
					node.setSrc(effectiveSrc);
					node.setAltText(altText);
					node.setWidthAndHeight(nextWidth, nextHeight);
				}
			});
		} else {
			editor.dispatchCommand(INSERT_INLINE_IMAGE_COMMAND, {
				src: effectiveSrc,
				altText,
				width: nextWidth,
				height: nextHeight
			});
		}
		onClose();
	}, [altText, editor, effectiveSrc, height, onClose, width]);

	const lockLabel = locked
		? t('lexical-label.unlock_aspect_ratio', 'Unlock aspect ratio')
		: t('lexical-label.lock_aspect_ratio', 'Lock aspect ratio');

	return (
		<Modal
			open={open}
			title={t('lexical-label.insert_edit_image', 'Insert/Edit Image')}
			size="small"
			onClose={onClose}
			onConfirm={onConfirm}
			confirmLabel={t('label.save', 'Save')}
			confirmDisabled={!effectiveSrc}
			onSecondaryAction={onClose}
			secondaryActionLabel={t('label.cancel', 'Cancel')}
			showCloseIcon
		>
			<Container
				padding={{ vertical: 'large' }}
				gap="1rem"
				mainAlignment="flex-start"
				crossAlignment="flex-start"
			>
				<Input
					label={t('lexical-label.image_source', 'Source')}
					value={src}
					onChange={(ev: React.ChangeEvent<HTMLInputElement>): void => setSrc(ev.target.value)}
					description={
						embeddedSrc && !src
							? t(
									'lexical-label.image_source_embedded',
									'Embedded image: enter an address to replace it'
								)
							: undefined
					}
					background="gray5"
				/>
				<Input
					label={t('lexical-label.image_alt', 'Alternative description')}
					value={altText}
					onChange={(ev: React.ChangeEvent<HTMLInputElement>): void => setAltText(ev.target.value)}
					background="gray5"
				/>
				<Container
					orientation="horizontal"
					gap="0.5rem"
					mainAlignment="flex-start"
					crossAlignment="flex-end"
					width="fill"
				>
					<Input
						label={t('lexical-label.width', 'Width')}
						type="number"
						value={width}
						onChange={onWidthChange}
						background="gray5"
						minWidth={0}
					/>
					<Input
						label={t('lexical-label.height', 'Height')}
						type="number"
						value={height}
						onChange={onHeightChange}
						background="gray5"
						minWidth={0}
					/>
					<Tooltip label={lockLabel}>
						<Button
							icon={locked ? 'Lock' : 'Unlock'}
							type="ghost"
							color="text"
							size="extralarge"
							minWidth="fit-content"
							aria-label={lockLabel}
							aria-pressed={locked}
							onClick={toggleLock}
						/>
					</Tooltip>
				</Container>
			</Container>
		</Modal>
	);
};
