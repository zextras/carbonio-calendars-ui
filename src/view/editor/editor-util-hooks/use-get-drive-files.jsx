/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { SnackbarManagerContext } from '@zextras/carbonio-design-system';
import { useIntegratedFunction } from '@zextras/carbonio-shell-ui';
import { filter, map } from 'lodash';
import { useCallback, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { selectEditorAttach, selectEditorAttachmentFiles } from '../../../store/selectors/editor';

export const uploadToFiles = async (node, uploadTo) => {
	const upload = await uploadTo({ nodeId: node.id, targetModule: 'CALENDARS' });
	return {
		res: upload,
		node
	};
};

export const useGetFilesFromDrive = ({ editorId, onAttachmentsChange }) => {
	const createSnackbar = useContext(SnackbarManagerContext);
	const attachmentFiles = useSelector(selectEditorAttachmentFiles(editorId));
	const parts = useSelector(selectEditorAttach(editorId));
	const [t] = useTranslation();
	const [uploadTo, isAvailable] = useIntegratedFunction('upload-to-target-and-get-target-id');

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
					onAttachmentsChange(
						{ aid: map(success, (i) => i.value.res.attachmentId), mp: parts },
						attachmentFilesArr
					);
				});
			}
		},
		[attachmentFiles, createSnackbar, isAvailable, onAttachmentsChange, parts, t, uploadTo]
	);
	return [confirmAction, isAvailable];
};