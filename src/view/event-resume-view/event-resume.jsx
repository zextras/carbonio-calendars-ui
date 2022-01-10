/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';
import { Container, Popover } from '@zextras/zapp-ui';
import { TitleRow } from './title-row';
import { NeverSentWarningRow } from './never-sent-warning-row';
import { CalendarInfoRow } from './calendar-info-row';
import { LocationRow } from './location-row';
import { ParticipantsRow } from './partipants-row';
import { DescriptionFragmentRow } from './description-fragment-row';
import { ActionsButtonsRow } from './actions-buttons-row';
import { TimeInfoRow } from './time-info-row';

export const EventResumeView = ({ anchorRef, open, event, onClose, invite, dispatch }) => (
	<Popover anchorEl={anchorRef} open={open} styleAsModal placement="left" onClose={onClose}>
		<Container padding={{ top: 'medium', horizontal: 'small', bottom: 'extrasmall' }} width="400px">
			<TitleRow event={event} />
			<NeverSentWarningRow event={event} />
			<CalendarInfoRow event={event} />
			{event && <TimeInfoRow event={event} />}
			{event && <LocationRow event={event} />}
			<ParticipantsRow event={event} invite={invite} />
			<DescriptionFragmentRow event={event} />
			<ActionsButtonsRow event={event} dispatch={dispatch} onClose={onClose} />
		</Container>
	</Popover>
);
