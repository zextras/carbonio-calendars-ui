/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';
import { Container, Divider, Popover } from '@zextras/carbonio-design-system';
import { startsWith } from 'lodash';
import { TitleRow } from './title-row';
import { NeverSentWarningRow } from './never-sent-warning-row';
import { CalendarInfoRow } from './calendar-info-row';
import { LocationRow } from './location-row';
import { ParticipantsRow } from './partipants-row';
import { DescriptionFragmentRow } from './description-fragment-row';
import { ActionsButtonsRow } from './actions-buttons-row';
import { TimeInfoRow } from './time-info-row';
import { VirtualRoomRow } from './virtual-room-row';
import { ROOM_DIVIDER } from '../../commons/body-message-renderer';

export const EventResumeView = ({ anchorRef, open, event, onClose, invite, dispatch }) => (
	<Popover anchorEl={anchorRef} open={open} styleAsModal placement="left" onClose={onClose}>
		<Container padding={{ top: 'medium', horizontal: 'small', bottom: 'extrasmall' }} width="400px">
			<TitleRow event={event} invite={invite} />
			<NeverSentWarningRow event={event} />
			<CalendarInfoRow event={event} />
			{event && <TimeInfoRow event={event} showIcon />}
			{event && <LocationRow event={event} showIcon />}
			{invite?.meta && <VirtualRoomRow meta={invite?.meta} showIcon />}
			<ParticipantsRow event={event} invite={invite} />
			{!startsWith(event?.resource?.fragment ?? '', ROOM_DIVIDER) && (
				<DescriptionFragmentRow event={event} />
			)}
			<Divider />
			<ActionsButtonsRow event={event} dispatch={dispatch} onClose={onClose} />
		</Container>
	</Popover>
);
