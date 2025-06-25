/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useEffect, useState } from 'react';

import { searchCalendarMultipleResourcesRequest } from '../../soap/search-calendar-resources-request';
import { useAppStatusStore } from '../../store/zustand/store';
import { Contact } from '../../types/soap/soap-actions';

const normalizeResources = (
	r: Contact
): { id: string; label: string; value: string; email: string; type: string } => ({
	id: r.id,
	label: r._attrs.fullName,
	value: r._attrs.fullName,
	email: r._attrs.email,
	type: r._attrs.zimbraCalResType
});

export const useFetchEditorResources: () => { loading: boolean } = () => {
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		let cancelled = false;

		searchCalendarMultipleResourcesRequest(['Location', 'Equipment']).then((res) => {
			if (cancelled) return;

			const locationResources =
				res.calresource?.filter((r) => r._attrs.zimbraCalResType === 'Location') ?? [];
			const equipmentResources =
				res.calresource?.filter((r) => r._attrs.zimbraCalResType === 'Equipment') ?? [];

			useAppStatusStore.setState({
				meetingRoom: locationResources.map(normalizeResources),
				equipment: equipmentResources.map(normalizeResources)
			});

			setLoading(false);
		});

		return () => {
			cancelled = true;
		};
	}, []);

	return { loading };
};
