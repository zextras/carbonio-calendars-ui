/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement } from 'react';

import { setLightness } from 'polished';
import styled from 'styled-components';

import { EventType } from '../../types/event';

export const CustomEventWrapperStyler = styled.div<{ event: EventType }>`
	.rbc-event {
		color: ${({ event, theme }): string => {
			switch (event.resource.status) {
				case 'CANC':
					return theme.palette.gray0.regular;
				case 'TENT':
				case 'CONF':
				default:
					return event.resource.calendar.color.color;
			}
		}};
		background-color: ${({ event, theme }): string => {
			switch (event.resource.status) {
				case 'CANC':
					return theme.palette.gray3.regular;
				case 'TENT':
					return theme.palette.gray6.regular;
				case 'CONF':
				default:
					return event.resource.calendar.color.background;
			}
		}};
		border: ${({ event }): string =>
			`0.0625rem solid ${event.resource.calendar.color.color} !important`};
		box-sizing: border-box;
		margin: 0;
		border-radius: 0.25rem;
		cursor: pointer;
		width: 100%;
		text-align: left;
		transition:
			border 0.15s ease-in-out,
			background 0.15s ease-in-out;
		box-shadow: 0 0 0.875rem -0.5rem rgba(0, 0, 0, 0.5);
	}
	.rbc-slot-selecting .rbc-event {
		cursor: inherit;
		pointer-events: none;
	}
	.rbc-event.rbc-selected {
		background-color: ${({ event }): string =>
			setLightness(0.95, event.resource.calendar.color.background)};
		border: 0.0625rem solid ${({ event }): string => event.resource.calendar.color.color};
	}
	.rbc-event:focus {
		background-color: ${({ event }): string =>
			setLightness(0.8, event.resource.calendar.color.background)};
	}
	.rbc-event-label {
		display: none;
	}

	.rbc-event-overlaps {
		box-shadow: -0.0625rem 0.0625rem 0.3125rem 0 rgba(51, 51, 51, 0.5);
	}

	.rbc-event-continues-prior {
		border-top-left-radius: 0;
		border-bottom-left-radius: 0;
	}

	.rbc-event-continues-after {
		border-top-right-radius: 0;
		border-bottom-right-radius: 0;
	}

	.rbc-event-continues-earlier {
		border-top-left-radius: 0;
		border-top-right-radius: 0;
	}

	.rbc-event-continues-later {
		border-bottom-left-radius: 0;
		border-bottom-right-radius: 0;
	}
	.rbc-addons-dnd-resizable {
		height: 100%;
	}
	.rbc-event-content {
		height: 100%;
	}
`;

type EventWrapperProps = {
	event: EventType;
	children: React.ReactChildren;
};

export default function CustomEventWrapper({ event, children }: EventWrapperProps): ReactElement {
	return <CustomEventWrapperStyler event={event}>{children}</CustomEventWrapperStyler>;
}
