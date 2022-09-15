/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useCallback, useState } from 'react';
import { Checkbox, Container, Padding, Text } from '@zextras/carbonio-design-system';
import { Spinner, replaceHistory, t } from '@zextras/carbonio-shell-ui';
import styled from 'styled-components';
import { EventType } from '../../types/event';
import { Invite } from '../../types/store/invite';
import { DisplayFooter } from './parts/display-footer';
import { DisplayMessage } from './parts/display-message';
import { ModalHeader } from '../../commons/modal-header';
import { useDeleteActions } from './parts/use-delete-actions';

const ItalicText = styled(Text)`
	font-style: italic;
`;

type DeleteEventModalProps = {
	event: EventType;
	invite: Invite;
	context: any;
	onClose: () => void;
};

export const DeleteEventModal = ({
	event,
	invite,
	context,
	onClose
}: DeleteEventModalProps): ReactElement => {
	const [isAskingConfirmation, setIsAskingConfirmation] = useState(false);
	const isInstance = context?.isInstance;
	const toggleAskConfirmation = useCallback(() => {
		setIsAskingConfirmation((a) => !a);
	}, []);

	const actions = useDeleteActions(event, invite, {
		isInstance,
		replaceHistory,
		onClose
	});

	return (
		<Container
			mainAlignment="center"
			crossAlignment="flex-start"
			height="fit"
			padding={{ top: 'small', right: 'small', bottom: 'extralarge', left: 'small' }}
		>
			{invite ? (
				<Container mainAlignment="center" crossAlignment="flex-start" height="fit">
					<ModalHeader title={`${t('label.delete', 'Delete')} ${event.title}`} onClose={onClose} />
					<Container
						padding={{ vertical: 'medium' }}
						mainAlignment="baseline"
						crossAlignment="baseline"
					>
						<DisplayMessage
							invite={invite}
							isInstance={isInstance}
							isAskingConfirmation={isAskingConfirmation}
						/>
						{!isInstance &&
							event.resource.iAmOrganizer &&
							!isAskingConfirmation &&
							event.resource.isRecurrent && (
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
