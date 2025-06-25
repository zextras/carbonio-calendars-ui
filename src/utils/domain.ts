/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
export const getCarbonioDomain = (): string => {
	const { hostname } = window.location;
	return hostname;
};
