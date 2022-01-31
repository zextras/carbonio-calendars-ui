/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useCallback, useState } from 'react';
import { Checkbox, Container, Padding, Text } from '@zextras/carbonio-design-system';
import { Spinner, useReplaceHistoryCallback } from '@zextras/carbonio-shell-ui';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useInvite } from '../../hooks/use-invite';
import { DisplayFooter } from './parts/display-footer';
import { DisplayMessage } from './parts/display-message';
import { ModalHeader } from '../../commons/modal-header';
import { useDeleteActions } from './parts/use-delete-actions';

const ItalicText = styled(Text)`
	font-style: italic;
`;

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const DeleteEventModal = ({ event, onClose, isInstance }: any): ReactElement => {
	const invite = useInvite(event?.resource?.inviteId);
	const [t] = useTranslation();
	const [isAskingConfirmation, setIsAskingConfirmation] = useState(false);
	const replaceHistory = useReplaceHistoryCallback();
	const toggleAskConfirmation = useCallback(() => {
		setIsAskingConfirmation((a) => !a);
	}, []);

	const actions = useDeleteActions(event, invite, {
		isInstance,
		replaceHistory,
		onClose
	});

	return (
		<Container mainAlignment="center" crossAlignment="flex-start" height="fit">
			{invite ? (
				<Container mainAlignment="center" crossAlignment="flex-start" height="fit">
					<ModalHeader title={`${t('label.delete', 'Delete')} ${event.title}`} onClose={onClose} />
					<Padding vertical="extrasmall" />
					<Container
						padding={{ vertical: 'large', horizontal: 'small' }}
						mainAlignment="baseline"
						crossAlignment="baseline"
					>
						<DisplayMessage
							event={event}
							invite={invite}
							isInstance={isInstance}
							deleteAll={actions?.deleteAll}
							isAskingConfirmation={isAskingConfirmation}
						/>
						{!isInstance &&
							event?.resource?.iAmOrganizer &&
							!isAskingConfirmation &&
							event?.resource?.isRecurrent && (
								<>
									<Padding top="small" />
									<Checkbox
										value={actions?.deleteAll}
										onClick={actions?.toggleDeleteAll}
										label={t('message.delete_all_occurences', 'Delete all occurrences')}
									/>
									<Checkbox
										value={!actions?.deleteAll}
										onClick={actions?.toggleDeleteAll}
										label={t(
											'message.delete_future_occurences',
											'Delete this instance and all future occurrences'
										)}
									/>
									<Padding horizontal="extralarge">
										<Padding horizontal="small">
											<ItalicText overflow="break-word">
												{t(
													'message.delete_future_occurences_warning',
													'This will also delete all exceptions (before and after this instance) in the series'
												)}
											</ItalicText>
										</Padding>
									</Padding>
								</>
							)}
						{!event.resource.iAmOrganizer && !isAskingConfirmation && (
							<>
								<Padding top="small" />
								<Checkbox
									value={actions?.notifyOrganizer}
									onClick={actions?.toggleNotifyOrganizer}
									label={t('label.notify_organizer', 'Notify organizer')}
								/>
							</>
						)}
					</Container>
					<DisplayFooter
						actions={actions}
						toggleAskConfirmation={toggleAskConfirmation}
						event={event}
						invite={invite}
						isInstance={isInstance}
						onClose={onClose}
						isAskingConfirmation={isAskingConfirmation}
					/>
				</Container>
			) : (
				<Spinner />
			)}
		</Container>
	);
};
