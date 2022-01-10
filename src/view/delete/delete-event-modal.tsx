/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useCallback, useState } from 'react';
import { Checkbox, Container, CustomModal, Padding, Text } from '@zextras/zapp-ui';
import { Spinner } from '@zextras/zapp-shell';
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
export const DeleteEventModal = ({ event, open, isInstance, onClose }: any): ReactElement => {
	const invite = useInvite(event?.resource?.inviteId);
	const [t] = useTranslation();
	const [isAskingConfirmation, setIsAskingConfirmation] = useState(false);

	const toggleAskConfirmation = useCallback(() => {
		setIsAskingConfirmation((a) => !a);
	}, []);

	const actions = useDeleteActions(event, invite, {
		isInstance,
		onClose
	});

	return (
		<CustomModal
			open={open}
			onClose={onClose}
			disablePortal
			maxHeight="90vh"
			onClick={(e: { stopPropagation: () => void }): void => e.stopPropagation()}
			onDoubleClick={(e: { stopPropagation: () => void }): void => e.stopPropagation()}
		>
			<Container mainAlignment="center" crossAlignment="flex-start" height="fit">
				{invite ? (
					<Container mainAlignment="center" crossAlignment="flex-start" height="fit">
						<ModalHeader
							title={`${t('label.delete', 'Delete')} ${event.title}`}
							onClose={onClose}
						/>
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
		</CustomModal>
	);
};
