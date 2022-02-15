/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback } from 'react';
import styled from 'styled-components';
import { Container, Button, IconButton } from '@zextras/carbonio-design-system';

const MultiButton = styled(Button)`
	&:last-child {
		border-left: none;
		border-radius: 0 2px 2px 0;
	}
	&:first-child {
		border-right: none;
		border-radius: 2px 0 0 2px;
	}
	&:not(:first-child):not(:last-child) {
		border-radius: 0;
		border-right: none;
		border-left: none;
	}
`;

export default function CustomToolbar({ label, onView, onNavigate, view }) {
	const today = useCallback(() => onNavigate('TODAY'), [onNavigate]);
	const next = useCallback(() => onNavigate('NEXT'), [onNavigate]);
	const prev = useCallback(() => onNavigate('PREV'), [onNavigate]);
	const week = useCallback(() => onView('week'), [onView]);
	const day = useCallback(() => onView('day'), [onView]);
	const month = useCallback(() => onView('month'), [onView]);
	const workView = useCallback(() => onView('work_week'), [onView]);
	return (
		<Container width="fill" height="fit" padding={{ bottom: 'small' }}>
			<Container
				orientation="horizontal"
				width="fill"
				height={48}
				mainAlignment="baseline"
				crossAlignment="stretch"
				background="gray5"
				padding={{ horizontal: 'small' }}
			>
				<Container width="fit" orientation="horizontal" mainAlignment="flex-start">
					<Button label="Today" type="outlined" onClick={today} />
				</Container>
				<Container orientation="horizontal" width="100%">
					<IconButton iconColor="primary" icon="ChevronLeft" onClick={prev} />
					<Button type="ghost" label={label} onClick={() => null} minWidth="250px" />
					<IconButton iconColor="primary" icon="ChevronRight" onClick={next} />
				</Container>
				<Container width="fit" orientation="horizontal" mainAlignment="flex-end">
					<MultiButton
						backgroundColor={view === 'month' ? 'highlight' : null}
						label="Month"
						type="outlined"
						onClick={month}
					/>
					<MultiButton
						backgroundColor={view === 'week' ? 'highlight' : null}
						label="Week"
						type="outlined"
						onClick={week}
					/>
					<MultiButton
						backgroundColor={view === 'day' ? 'highlight' : null}
						label="Day"
						type="outlined"
						onClick={day}
					/>
					<MultiButton
						backgroundColor={view === 'work_week' ? 'highlight' : null}
						label="Work Week"
						type="outlined"
						onClick={workView}
					/>
				</Container>
			</Container>
		</Container>
	);
}
