/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useEffect, useState } from 'react';

import { searchCalendarMultipleResourcesRequest } from '../../soap/search-calendar-resources-request';

type FetchEditorResourcesProps = {
	onFailure?: () => void;
};

export const useFetchEditorResources = ({ onFailure }: FetchEditorResourcesProps = {}): {
	resourcesLoaded: boolean;
	hasEquipment: boolean;
	hasMeetingRoom: boolean;
} => {
	const [resourcesLoaded, setResourcesLoaded] = useState(false);

	const [hasEquipment, setHasEquipment] = useState(false);
	const [hasMeetingRoom, setHasMeetingRoom] = useState(false);

	useEffect(() => {
		const abortController = new AbortController();
		const { signal } = abortController;

		searchCalendarMultipleResourcesRequest(['Location', 'Equipment'], signal)
			.then((res) => {
				const locationResources =
					res.calresource?.filter((r) => r._attrs.zimbraCalResType === 'Location') ?? [];
				const equipmentResources =
					res.calresource?.filter((r) => r._attrs.zimbraCalResType === 'Equipment') ?? [];

				setHasEquipment(equipmentResources.length > 0);
				setHasMeetingRoom(locationResources.length > 0);

				setResourcesLoaded(true);
			})
			.catch((_error) => {
				if (!signal.aborted) {
					setResourcesLoaded(true);
					onFailure?.();
				}
			});

		return () => {
			abortController.abort();
		};
	}, [onFailure]);

	return { resourcesLoaded, hasEquipment, hasMeetingRoom };
};
