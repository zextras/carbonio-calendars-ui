/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { lazy, ReactElement, Suspense } from 'react';

import { Button, Container } from '@zextras/carbonio-design-system';
import { useUpdateView } from '@zextras/carbonio-ui-commons';
import { noop } from 'lodash';
import { Routes, Route } from 'react-router-dom';

const CalendarComponent = lazy(
	() => import(/* webpackChunkName: "calendar-component" */ './calendar-component')
);

export default function CalendarView(): ReactElement {
	useUpdateView();

	return (
		<Container
			background={'gray6'}
			padding={{ all: 'large' }}
			style={{ overflowY: 'auto', position: 'relative' }}
			data-testid="MainCalendarContainer"
		>
			<Routes>
				<Route
					path={`:calendarId?/:action?/:apptId?/:ridZ?`}
					element={
						<>
							<Suspense
								fallback={
									<Container height="50%" mainAlignment="center" crossAlignment="center">
										<Button loading disabled label="" type="ghost" onClick={noop} />
									</Container>
								}
							>
								<CalendarComponent />
							</Suspense>
						</>
					}
				/>
			</Routes>
		</Container>
	);
}
