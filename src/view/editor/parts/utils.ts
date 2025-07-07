/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Resource } from '../../../types/editor';

export const generateResourceId = (resource: Resource): string => {
	if (resource.email?.trim()) return resource.email.trim();
	if (resource.id?.trim()) return resource.id.trim();
	return `${resource.label?.trim() ?? '-unknown'}-${Date.now()}`;
};
