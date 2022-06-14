/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import {
	Dropdown,
	Icon,
	SnackbarManagerContext,
	ModalManagerContext,
	Padding,
	Row,
	Text
} from '@zextras/carbonio-design-system';
import React, { useContext, useMemo } from 'react';
import { FOLDERS, replaceHistory, useTags } from '@zextras/carbonio-shell-ui';
import { useTranslation } from 'react-i18next';
import { ReplyButtonsPartSmall } from '../../commons/reply-buttons-small';
import { selectCalendar } from '../../store/selectors/calendars';
import { EventType } from '../../types/event';
import { Invite } from '../../types/store/invite';
import { Store } from '../../types/store/store';
import OrganizerActions from './organizer-actions';
import { useGetRecurrentActions } from '../../hooks/use-recurrent-actions';
import { createAndApplyTag } from '../tags/tag-actions';

const RecurrentRow = styled(Row)`
	border: 1px solid ${(props): string => props.theme.palette.primary.regular};
`;

export const ActionsButtonsRow = ({
	event,
	onClose,
	invite
}: {
	event: EventType;
	onClose: () => void;
	invite: Invite;
}): JSX.Element => {
	const createModal = useContext(ModalManagerContext);
	const dispatch = useDispatch();
	const calendar = useSelector((s: Store) => selectCalendar(s, invite?.parent));
	const tags = useTags();
	const createSnackbar = useContext(SnackbarManagerContext);
	const context = useMemo(
		() => ({
			replaceHistory,
			dispatch,
			createModal,
			createSnackbar,
			tags,
			onClose,
			createAndApplyTag,
			calendar
		}),
		[dispatch, createModal, createSnackbar, tags, onClose, calendar]
	);
	const [t] = useTranslation();
	const instanceActions = useGetRecurrentActions(invite, { ...context, isInstance: true });
	const seriesActions = useGetRecurrentActions(invite, { ...context, isInstance: false });

	return (
		<Row width="fill" mainAlignment="flex-end" padding={{ all: 'small' }}>
			{event.resource.iAmOrganizer && event.haveWriteAccess ? (
				<>
					{event.resource?.isRecurrent ? (
						<Padding right="small" style={{ display: 'flex' }}>
							<Dropdown
								data-testid={`series-options`}
								items={seriesActions}
								style={{ cursor: 'pointer' }}
							>
								<RecurrentRow padding={{ all: 'small' }}>
									<Padding right="small">
										<Text color={'primary'}>{t('label.series', 'SERIES')}</Text>
									</Padding>
									<Icon color={'primary'} icon="ArrowIosDownwardOutline" />
								</RecurrentRow>
							</Dropdown>
							{event.resource.calendar.id !== FOLDERS.TRASH && (
								<Padding left="small">
									<Dropdown
										data-testid={`instance-options`}
										items={instanceActions}
										style={{ cursor: 'pointer' }}
									>
										<RecurrentRow padding={{ all: 'small' }}>
											<Padding right="small">
												<Text color={'primary'}>{t('label.instance', 'INSTANCE')}</Text>
											</Padding>
											<Icon color={'primary'} icon="ArrowIosDownwardOutline" />
										</RecurrentRow>
									</Dropdown>
								</Padding>
							)}
						</Padding>
					) : (
						<OrganizerActions event={event} onClose={onClose} invite={invite} />
					)}
				</>
			) : (
				<ReplyButtonsPartSmall
					inviteId={event.resource?.inviteId}
					participationStatus={event.resource?.participationStatus}
					compNum={event.resource?.compNum}
					event={event}
				/>
			)}
		</Row>
	);
};
