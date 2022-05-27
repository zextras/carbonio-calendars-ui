/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';
import styled from 'styled-components';
import { setLightness } from 'polished';
import moment from 'moment';
import { EventType } from '../../types/event';

export const CustomEventWrapperStyler = styled.div<{ event: EventType }>`
	.rbc-event {
		color: ${({ event, theme }): string => {
			switch (event.resource.status) {
				case 'declined':
					return theme.palette.gray0.regular;
				case 'tentative':
				case 'accepted':
				default:
					return event.resource.calendar.color.color;
			}
		}};
		background-color: ${({ event, theme }): string => {
			switch (event.resource.status) {
				case 'declined':
					return theme.palette.gray3.regular;
				case 'tentative':
					return theme.palette.gray6.regular;
				case 'accepted':
				default:
					return event.resource.calendar.color.background;
			}
		}};
		border: ${({ event }): string => `1px solid ${event.resource.calendar.color.color} !important`};
		box-sizing: border-box;
		margin: 0;
		padding: ${({ event }): string =>
			moment(event.end).diff(event.start, 'minutes') >= 30
				? '4px 8px'
				: '1px 8px 4px 8px !important'};
		border-radius: 4px;
		cursor: pointer;
		width: 100%;
		text-align: left;
		transition: border 0.15s ease-in-out, background 0.15s ease-in-out;
		box-shadow: 0px 0px 14px -8px rgba(0, 0, 0, 0.5);
	}
	.rbc-slot-selecting .rbc-event {
		cursor: inherit;
		pointer-events: none;
	}
	.rbc-event.rbc-selected {
		/* background-color: ${({ event }): string =>
			setLightness(0.95, event.resource.calendar.color.background)}; */
		border: 1px solid ${({ event }): string => event.resource.calendar.color.color};
	}
	.rbc-event:focus {
		background-color: ${({ event }): string =>
			setLightness(0.8, event.resource.calendar.color.background)};
	}
	.rbc-event-label {
		display: none;
	}

	.rbc-event-overlaps {
		box-shadow: -1px 1px 5px 0px rgba(51, 51, 51, 0.5);
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
`;

type EventWrapperProps = {
	event: EventType;
	children: React.ReactChildren;
};

export default function CustomEventWrapper({ event, children }: EventWrapperProps): JSX.Element {
	return <CustomEventWrapperStyler event={event}>{children}</CustomEventWrapperStyler>;
}
