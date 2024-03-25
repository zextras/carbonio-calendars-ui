/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useCallback } from 'react';

import { useSnackbar } from '@zextras/carbonio-design-system';
import { t, useIntegratedFunction } from '@zextras/carbonio-shell-ui';
import { filter, map } from 'lodash';

import { useAppDispatch, useAppSelector } from '../../../store/redux/hooks';
import { selectEditorAttach, selectEditorAttachmentFiles } from '../../../store/selectors/editor';
import { editEditorAttachments } from '../../../store/slices/editor-slice';

export const uploadToFiles = async (node, uploadTo) => {
	const upload = await uploadTo({ nodeId: node.id, targetModule: 'CALENDARS' });
	return {
		res: upload,
		node
	};
};

export const useGetFilesFromDrive = ({ editorId }) => {
	const createSnackbar = useSnackbar();
	const attachmentFiles = useAppSelector(selectEditorAttachmentFiles(editorId));
	const parts = useAppSelector(selectEditorAttach(editorId));
	const [uploadTo, isAvailable] = useIntegratedFunction('upload-to-target-and-get-target-id');
	const dispatch = useAppDispatch();

	const confirmAction = useCallback(
		(nodes) => {
			const promises = map(nodes, (node) => uploadToFiles(node, uploadTo));
			if (isAvailable) {
				Promise.allSettled(promises).then((res) => {
					const success = filter(res, ['status', 'fulfilled']);
					const allSuccess = res.length === success?.length;
					const allFails = res.length === filter(res, ['status', 'rejected'])?.length;
					const type = allSuccess ? 'info' : 'warning';
					// eslint-disable-next-line no-nested-ternary
					const label = allSuccess
						? t('message.snackbar.all_att_added', 'Attachments added successfully')
						: allFails
							? t(
									'message.snackbar.att_err_adding',
									'There seems to be a problem when adding attachments, please try again'
								)
							: t(
									'message.snackbar.some_att_add_fails',
									'There seems to be a problem when adding some attachments, please try again'
								);
					createSnackbar({
						key: `calendar-moved-root`,
						replace: true,
						type,
						hideButton: true,
						label,
						autoHideTimeout: 4000
					});
					const attachments = map(success, (file) => ({
						contentType: file.value.node.mime_type,
						disposition: 'attachment',
						filename: file.value.node.name,
						name: undefined,
						size: file.value.node.size,
						aid: file.value.res.attachmentId
					}));
					const attachmentFilesArr = [...(attachmentFiles ?? []), ...attachments];
					dispatch(
						editEditorAttachments({
							id: editorId,
							attach: { aid: map(success, (i) => i.value.res.attachmentId), mp: parts },
							attachmentFIles: attachmentFilesArr
						})
					);
				});
			}
		},
		[attachmentFiles, createSnackbar, dispatch, editorId, isAvailable, parts, uploadTo]
	);
	return [confirmAction, isAvailable];
};
