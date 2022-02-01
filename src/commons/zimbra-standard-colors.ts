/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
export type ZimbraColorType = {
	color: string;
	background: string;
	label?: string;
};

export const ZIMBRA_STANDARD_COLORS: Array<ZimbraColorType> = [
	{ color: '#000000', background: '#E6E9ED', label: 'black' },
	{ color: '#0097A7', background: '#E5F4F6', label: 'aquamarine' },
	{ color: '#ef5350', background: '#FDEDED', label: 'red' },
	{ color: '#ec407a', background: '#FDECF1', label: 'magenta' },
	{ color: '#7e57c2', background: '#F2EEF9', label: 'purple' },
	{ color: '#5c6bc0', background: '#EEF0F9', label: 'violet' },
	{ color: '#29B6F6', background: '#E9F8FE', label: 'cyan' },
	{ color: '#26a69a', background: '#E9F6F5', label: 'sage' },
	{ color: '#66BB6A', background: '#EFF8F0', label: 'green' },
	{ color: '#FF7043', background: '#FFF0EC', label: 'orange' }
];

/*
	reference: https://zextras.atlassian.net/wiki/spaces/IRIS/pages/223215854/UI+Guidelines+and+theming
*/
