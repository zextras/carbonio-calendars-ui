/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useEffect, useMemo } from 'react';

import { Container, Row, Shimmer } from '@zextras/carbonio-design-system';
import { FOLDERS } from '@zextras/carbonio-shell-ui';
import { filter, map } from 'lodash';

import { useFoldersArrayByRoot } from '../../../carbonio-ui-commons/store/zustand/folder';
import { LinkFolder } from '../../../carbonio-ui-commons/types/folder';
import { hasId } from '../../../carbonio-ui-commons/worker/handle-message';
import { searchAppointments } from '../../../store/actions/search-appointments';
import { useAppDispatch } from '../../../store/redux/hooks';

const useAppointmentsInRange = (start: number, end: number, rootId: string): null => {
	const dispatch = useAppDispatch();
	const calendars = useFoldersArrayByRoot(rootId);

	const filteredCalendars = filter(
		calendars,
		(calendar) =>
			!/b/.test(calendar?.f ?? '') &&
			!(calendar as LinkFolder).broken &&
			!hasId({ id: calendar.id }, FOLDERS.TRASH)
	);

	const query = useMemo(
		() =>
			map(filteredCalendars, (result, id) =>
				id === 0 ? `inid:"${result.id}"` : `OR inid:"${result.id}"`
			).join(' '),
		[filteredCalendars]
	);
	useEffect(() => {
		if (start && end) {
			dispatch(searchAppointments({ spanEnd: end, spanStart: start, query }));
		}
	}, [dispatch, end, query, start]);
	return null;
};

export const AppointmentCardContainer = ({
	start,
	end,
	rootId
}: {
	start: number;
	end: number;
	rootId: string;
}): JSX.Element => {
	const something = useAppointmentsInRange(start, end, rootId);
	if (!something) {
		return (
			<Container
				width={'fill'}
				padding={{ top: 'medium' }}
				data-testid="ShimmerAppointmentCardContainer"
			>
				<Row width={'fill'} padding={{ bottom: 'small' }}>
					<Shimmer.ListItem width="100%" type={3} />
				</Row>
				<Row width={'fill'} padding={{ bottom: 'small' }}>
					<Shimmer.ListItem width="100%" type={3} />
				</Row>
				<Row width={'fill'}>
					<Shimmer.ListItem width="100%" type={3} />
				</Row>
			</Container>
		);
	}
	return <Container data-testid="AppointmentCardContainer" />;
};
