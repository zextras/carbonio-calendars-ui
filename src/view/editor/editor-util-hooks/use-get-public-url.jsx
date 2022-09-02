/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { SnackbarManagerContext } from '@zextras/carbonio-design-system';
import { useIntegratedFunction } from '@zextras/carbonio-shell-ui';
import { filter, map } from 'lodash';
import moment from 'moment';
import { useCallback, useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import {
	selectEditorPlainText,
	selectEditorRichText,
	selectEditorTitle
} from '../../../store/selectors/editor';

export const useGetPublicUrl = ({ editorId, onTextChange }) => {
	const [getLink, getLinkAvailable] = useIntegratedFunction('get-link');
	const createSnackbar = useContext(SnackbarManagerContext);
	const richText = useSelector(selectEditorRichText(editorId));
	const plainText = useSelector(selectEditorPlainText(editorId));
	const title = useSelector(selectEditorTitle(editorId));
	const [t] = useTranslation();
	const description = useMemo(
		() =>
			t('label.public_link_description', {
				title,
				date: moment().format('yyyy-MM-DD_hh:mm'),
				defaultValue: 'Generated from {{title}} on {{date}}'
			}),
		[t, title]
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
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
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
				onTextChange(newText);
			});
		},
		[getLink, t, createSnackbar, plainText, richText, onTextChange, description]
	);
	return [getPublicUrl, getLinkAvailable];
};
