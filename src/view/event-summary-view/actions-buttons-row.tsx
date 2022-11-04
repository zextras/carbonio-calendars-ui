/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import styled from 'styled-components';
import { Dropdown, Icon, Padding, Row, Text } from '@zextras/carbonio-design-system';
import React, { ReactElement, useMemo } from 'react';
import { FOLDERS } from '@zextras/carbonio-shell-ui';
import { useTranslation } from 'react-i18next';
import { ReplyButtonsPartSmall } from '../../commons/reply-buttons-small';
import { useEventSummaryViewActions } from '../../hooks/use-event-summary-view-actions';
import { EventType } from '../../types/event';
import { Invite } from '../../types/store/invite';
import OrganizerActions from './organizer-actions';

const RecurrentRow = styled(Row)`
	border: 0.0625rem solid ${(props): string => props.theme.palette.primary.regular};
`;

export const ActionsButtonsRow = ({
	onClose,
	event,
	invite
}: {
	onClose: () => void;
	event: EventType;
	invite: Invite;
}): ReactElement => {
	const [t] = useTranslation();
	const actions = useEventSummaryViewActions({
		onClose,
		event
	});

	const instanceActions = useMemo(() => actions?.[0]?.items ?? [], [actions]);
	const seriesActions = useMemo(() => actions?.[1]?.items ?? [], [actions]);
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
						<OrganizerActions event={event} invite={invite} actions={actions} />
					)}
				</>
			) : (
				<ReplyButtonsPartSmall
					inviteId={event.resource?.inviteId}
					participationStatus={event.resource?.participationStatus}
					compNum={event.resource?.compNum}
					event={event}
					actions={actions}
				/>
			)}
		</Row>
	);
};
