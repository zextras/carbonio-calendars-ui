/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import editor from '../editor';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const getBoard = (context: any): any => {
	const defaultEditor = editor.getEditor({ folders: context?.folders, editor: context?.editor });
	return {
		url: 'calendars/',
		app: 'carbonio-calendars-ui',
		icon: 'CalendarModOutline',
		title: '',
		...(context?.editor ?? defaultEditor)
	};
};

export default getBoard;
