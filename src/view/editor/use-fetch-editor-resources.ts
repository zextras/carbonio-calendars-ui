/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useEffect, useState } from 'react';

import { searchCalendarMultipleResourcesRequest } from '../../soap/search-calendar-resources-request';

export const useFetchEditorResources: () => {
	loadingResources: boolean;
	hasEquipment: boolean;
	hasMeetingRoom: boolean;
} = () => {
	const [loadingResources, setLoadingResources] = useState(true);

	const [hasEquipment, setHasEquipment] = useState(false);
	const [hasMeetingRoom, setHasMeetingRoom] = useState(false);

	useEffect(() => {
		let cancelled = false;

		searchCalendarMultipleResourcesRequest(['Location', 'Equipment']).then((res) => {
			if (cancelled) return;

			const locationResources =
				res.calresource?.filter((r) => r._attrs.zimbraCalResType === 'Location') ?? [];
			const equipmentResources =
				res.calresource?.filter((r) => r._attrs.zimbraCalResType === 'Equipment') ?? [];

			setHasEquipment(equipmentResources.length > 0);
			setHasMeetingRoom(locationResources.length > 0);

			setLoadingResources(false);
		});

		return () => {
			cancelled = true;
		};
	}, []);

	return { loadingResources, hasEquipment, hasMeetingRoom };
};
