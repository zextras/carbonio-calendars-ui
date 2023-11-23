/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { DragEvent, ReactElement, ReactNode, useCallback, useMemo, useState } from 'react';

import { Container } from '@zextras/carbonio-design-system';
import { map } from 'lodash';

import { addAttachments } from './editor-attachments-button';
import { DropZoneAttachment } from './editor-dropzone-attachments';
import { useAppDispatch } from '../../../store/redux/hooks';
import { editEditorAttachments } from '../../../store/slices/editor-slice';

type DropzoneProps = {
	editorId: string;
	expanded?: boolean;
	children: ReactNode;
};

export const EditorDropZone = ({ editorId, children }: DropzoneProps): ReactElement | null => {
	const [dropZoneEnable, setDropZoneEnable] = useState(false);
	const parts: never[] = useMemo(() => [], []);
	const dispatch = useAppDispatch();

	const onDragOver = useCallback((event: DragEvent): void => {
		const eventType = event?.dataTransfer?.types;
		if (eventType?.includes('contact')) {
			setDropZoneEnable(false);
			return;
		}
		event.preventDefault();
		setDropZoneEnable(true);
	}, []);

	const onDrop = useCallback(
		(event: DragEvent): void => {
			event.preventDefault();
			setDropZoneEnable(false);
			if (event?.dataTransfer?.files) {
				addAttachments(editorId, parts, event.dataTransfer.files).then(({ payload, mp }) => {
					const attachments = map(payload, (file) => ({
						contentType: file.ct,
						disposition: 'attachment',
						filename: file.filename,
						name: undefined,
						size: file.s,
						aid: file.aid
					}));
					dispatch(
						editEditorAttachments({
							id: editorId,
							attach: { aid: map(payload, (el) => el.aid), mp },
							attachmentFiles: attachments
						})
					);
				});
			}
		},
		[dispatch, editorId, parts]
	);

	const onDragLeave = useCallback((event: DragEvent): void => {
		event.preventDefault();
		setDropZoneEnable(false);
	}, []);

	return (
		<Container
			height="fit"
			background="gray6"
			mainAlignment="flex-start"
			crossAlignment="flex-start"
			padding={{ all: 'large', bottom: 'extralarge' }}
			onDragOver={onDragOver}
			style={{
				overflowY: 'auto',
				display: 'block',
				float: 'left'
			}}
		>
			{dropZoneEnable ? (
				<DropZoneAttachment onDrop={onDrop} onDragOver={onDragOver} onDragLeave={onDragLeave} />
			) : null}
			{children}
		</Container>
	);
};
