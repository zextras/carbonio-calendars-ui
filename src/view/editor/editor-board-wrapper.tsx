/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useEffect, useRef } from 'react';

import { useBoard, useBoardHooks } from '@zextras/carbonio-shell-ui';

import { EditorPanel } from './editor-panel';
import { StoreProvider } from '../../store/redux';
import { useAppSelector } from '../../store/redux/hooks';
import { selectEditorIsDirty } from '../../store/selectors/editor';
import { useGlobalModal } from '../global-modal-manager';
import { EditorCloseConfirmationModal } from '../modals/editor-close-confirmation-modal';

const BoardEditPanel = (): ReactElement | null => {
	const board = useBoard();
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	const editorId: string | undefined = board?.editor?.id;
	const isDirty = useAppSelector(selectEditorIsDirty(editorId ?? ''));
	const isDirtyRef = useRef(isDirty);
	isDirtyRef.current = isDirty;
	const boardTitleRef = useRef(board?.title ?? '');
	boardTitleRef.current = board?.title ?? '';

	const { updateBoard } = useBoardHooks();
	const { createModal, closeModal } = useGlobalModal();

	useEffect(() => {
		updateBoard({
			onClose: () => {
				if (isDirtyRef.current && editorId) {
					const modalId = 'editor-close-confirmation';
					createModal(
						{
							id: modalId,
							children: (
								<StoreProvider>
									<EditorCloseConfirmationModal
										editorId={editorId}
										boardTitle={boardTitleRef.current}
										onClose={(): void => closeModal(modalId)}
									/>
								</StoreProvider>
							),
							onClose: () => closeModal(modalId)
						},
						true
					);
				}
			}
		});
	}, [closeModal, createModal, editorId, updateBoard]);

	if (!editorId) {
		return null;
	}

	return <EditorPanel editorId={editorId} />;
};
export default BoardEditPanel;
