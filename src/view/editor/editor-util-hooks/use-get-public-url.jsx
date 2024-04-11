/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useCallback, useMemo } from 'react';

import { useSnackbar } from '@zextras/carbonio-design-system';
import { t, useIntegratedFunction } from '@zextras/carbonio-shell-ui';
import { filter, map } from 'lodash';
import moment from 'moment';

import { useAppDispatch, useAppSelector } from '../../../store/redux/hooks';
import {
	selectEditorPlainText,
	selectEditorRichText,
	selectEditorTitle
} from '../../../store/selectors/editor';
import { editEditorText } from '../../../store/slices/editor-slice';

export const useGetPublicUrl = ({ editorId }) => {
	const [getLink, getLinkAvailable] = useIntegratedFunction('get-link');
	const createSnackbar = useSnackbar();
	const richText = useAppSelector(selectEditorRichText(editorId));
	const plainText = useAppSelector(selectEditorPlainText(editorId));
	const title = useAppSelector(selectEditorTitle(editorId));
	const dispatch = useAppDispatch();

	const description = useMemo(
		() =>
			t('label.public_link_description', {
				title,
				date: moment().format('yyyy-MM-DD_hh:mm'),
				defaultValue: 'Generated from {{title}} on {{date}}'
			}),
		[title]
	);
	const getPublicUrl = useCallback(
		(nodes) => {
			const promises = map(nodes, (node) => getLink({ node, type: 'createLink', description }));

			Promise.allSettled(promises).then((res) => {
				const success = filter(res, ['status', 'fulfilled']);
				const allSuccess = res.length === success?.length;
				const allFails = res.length === filter(res, ['status', 'rejected'])?.length;
				const type = allSuccess ? 'info' : 'warning';
				// eslint-disable-next-line no-nested-ternary
				const label = allSuccess
					? t('message.snackbar.all_link_copied', 'Public link copied successfully')
					: allFails
						? t(
								'message.snackbar.link_copying_error',
								'There seems to be a problem while generating public link, please try again'
							)
						: t(
								'message.snackbar.some_link_copying_error',
								'There seems to be a problem while generating public url for some files, please try again'
							);
				createSnackbar({
					key: `public-link`,
					replace: true,
					type,
					hideButton: true,
					label,
					autoHideTimeout: 4000
				});

				const newText = [
					map(success, (i) => i.value.url)
						.join('\n')
						.concat(`\n${plainText}`),
					` ${map(success, (i) => `<p><a href="${i.value.url}"> ${i.value.url}</a></p>`).join(
						''
					)}`.concat(richText)
				];
				dispatch(editEditorText({ id: editorId, richText: newText[0], plainText: newText[1] }));
			});
		},
		[getLink, description, createSnackbar, plainText, richText, dispatch, editorId]
	);
	return [getPublicUrl, getLinkAvailable];
};
