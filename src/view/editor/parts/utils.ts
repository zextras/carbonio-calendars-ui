/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Resource } from '../../../types/editor';

export const generateResourceId = (resource: Resource): string => {
	if (resource.email?.trim()) return resource.email.trim();
	if (resource.id?.trim()) return resource.id.trim();
	return `${resource.label?.trim() ?? 'unknown'}-${Date.now()}`;
};

export const isValidResource = (resource: Resource | undefined): boolean =>
	!!resource?.label?.trim() && !!resource?.email?.trim();

export const getDuplicateResourceIds = (resources: Resource[]): Set<string> => {
	const seen = new Map<string, number>();
	resources.forEach((r) => {
		if (isValidResource(r)) {
			const key = [r.id, r.email].map((v) => v?.trim()).find(Boolean) ?? '';
			seen.set(key, (seen.get(key) ?? 0) + 1);
		}
	});
	return new Set(
		Array.from(seen.entries())
			.filter(([, count]) => count > 1)
			.map(([key]) => key)
	);
};
