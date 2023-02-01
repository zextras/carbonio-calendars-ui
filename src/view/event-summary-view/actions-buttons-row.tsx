/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { noop } from 'lodash';
import { Button, Dropdown, Padding, Row } from '@zextras/carbonio-design-system';
import React, { ReactElement, useMemo } from 'react';
import { FOLDERS } from '@zextras/carbonio-shell-ui';
import { useTranslation } from 'react-i18next';
import { ReplyButtonsPartSmall } from '../../commons/reply-buttons-small';
import { useEventActions } from '../../hooks/use-event-actions';
import { EventType } from '../../types/event';
import { Invite } from '../../types/store/invite';
import OrganizerActions from './organizer-actions';

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
	const actions = useEventActions({
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
							<Dropdown data-testid={`series-options`} items={seriesActions} placement="bottom-end">
								<Button
									type="outlined"
									label={t('label.series', 'SERIES')}
									icon="ChevronDown"
									onClick={noop}
								/>
							</Dropdown>
							{event.resource.calendar.id !== FOLDERS.TRASH && (
								<Padding left="small">
									<Dropdown
										data-testid={`instance-options`}
										items={instanceActions}
										placement="bottom-end"
									>
										<Button
											type="outlined"
											label={t('label.instance', 'INSTANCE')}
											icon="ChevronDown"
											onClick={noop}
										/>
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
