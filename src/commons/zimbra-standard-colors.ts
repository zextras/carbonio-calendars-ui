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
	{ color: '#007AFF', background: '#E6E9ED', label: 'blue' },
	{ color: '#5AC8FA', background: '#E5F4F6', label: 'cyan' },
	{ color: '#34C759', background: '#FDEDED', label: 'green' },
	{ color: '#AF52DE', background: '#FDECF1', label: 'purple' },
	{ color: '#FF3B30', background: '#F2EEF9', label: 'red' },
	{ color: '#FFCC00', background: '#EEF0F9', label: 'yellow' },
	{ color: '#FF2D55', background: '#E9F8FE', label: 'pink' },
	{ color: '#8E8E93', background: '#E9F6F5', label: 'grey' },
	{ color: '#FF9500', background: '#FFF0EC', label: 'orange' }
];

/*
	reference: https://zextras.atlassian.net/wiki/spaces/IRIS/pages/223215854/UI+Guidelines+and+theming
*/
