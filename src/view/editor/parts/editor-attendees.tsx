/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useCallback, useEffect, useMemo, useState } from 'react';

import {
	Button,
	ChipInput,
	ChipItem,
	Container,
	Row,
	useSnackbar
} from '@zextras/carbonio-design-system';
import { useIntegratedComponent } from '@zextras/carbonio-shell-ui';
import { find, map, some } from 'lodash';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import {
	applyAttendeeToContactInputItem,
	filterValidChips,
	getContactInputEmail,
	mapContactInputAttendees,
	validateChipInput
} from './attendees-utils';
import {
	EditorAvailabilityWarningRow,
	getIsBusyAtTimeOfTheEvent
} from './editor-availability-warning-row';
import { EditorOptionalAttendees } from './editor-optional-attendees';
import { getOrderedAccountIds } from '../../../carbonio-ui-commons/helpers/identities';
import { ContactInputItem } from '../../../carbonio-ui-commons/integrations/types';
import { useAttendeesAvailability } from '../../../hooks/use-attendees-availability';
import { useAppDispatch, useAppSelector } from '../../../store/redux/hooks';
import {
	selectEditorAllDay,
	selectEditorAttendees,
	selectEditorDisabled,
	selectEditorEnd,
	selectEditorOptionalAttendees,
	selectEditorStart,
	selectEditorUid,
	selectSender
} from '../../../store/selectors/editor';
import { editEditorAttendees } from '../../../store/slices/editor-slice';
import { EditorChipAttendees } from '../../../types/store/invite';

type EditorAttendeesProps = {
	editorId: string;
};

export const AttendeesContainer = styled.div`
	width: calc(
		100% - ${({ hasTooltip }: { hasTooltip?: boolean }): string => (hasTooltip ? `3rem` : '0rem')}
	);
	height: fit-content;
	background: ${({ theme }): string => theme.palette.gray5.regular};
	border-bottom: 0.0625rem solid ${({ theme }): string => theme.palette.gray2.regular};
	[class^='Chip__ChipComp'] {
		[class^='Text__Comp'] {
			color: ${({ theme }): string => theme.palette.text.regular};
		}
	}
`;

export const EditorAttendees = ({ editorId }: EditorAttendeesProps): ReactElement => {
	const [t] = useTranslation();
	const [ContactInput, integrationAvailable] = useIntegratedComponent('contact-input');
	const dispatch = useAppDispatch();
	const attendees = useAppSelector(selectEditorAttendees(editorId));
	const optionalAttendees = useAppSelector(selectEditorOptionalAttendees(editorId));
	const uid = useAppSelector(selectEditorUid(editorId));
	const disabled = useAppSelector(selectEditorDisabled(editorId));
	const start = useAppSelector(selectEditorStart(editorId));
	const end = useAppSelector(selectEditorEnd(editorId));
	const allDay = useAppSelector(selectEditorAllDay(editorId));
	const sender = useAppSelector(selectSender(editorId));
	const createSnackbar = useSnackbar();

	const [showOptionals, setShowOptional] = useState(!!optionalAttendees?.length);
	const [orderedAccountIds, setOrderedAccountIds] = useState<Array<string>>([]);
	const toggleOptionals = useCallback(() => setShowOptional((show) => !show), []);

	const attendeesAvailabilityList = useAttendeesAvailability(start, attendees, uid);
	const [contactsState, setContactsState] = useState<Record<string, ContactInputItem | undefined>>(
		{}
	);

	const hasError = useMemo(() => some(attendees ?? [], { error: true }), [attendees]);

	useEffect(() => {
		getOrderedAccountIds(sender ? sender.address : '')
			.then((ids) => {
				setOrderedAccountIds(ids);
			})
			.catch(() => {
				createSnackbar({
					key: `ordered-account-ids`,
					replace: true,
					severity: 'error',
					label: t('label.error_try_again', 'Something went wrong, please try again'),
					autoHideTimeout: 3000,
					hideButton: true
				});
			});
	}, [createSnackbar, sender, t]);

	const onChangeAttendeeChip = useCallback<(items: ChipItem<EditorChipAttendees>[]) => void>(
		(chips) => {
			const newAttendees = filterValidChips(chips);
			dispatch(editEditorAttendees({ id: editorId, attendees: newAttendees }));
		},
		[dispatch, editorId]
	);
	const onChangeAttendeeContact = useCallback<(items: Array<ContactInputItem>) => void>(
		(contacts) => {
			const newContactsState: Record<string, ContactInputItem> = {};
			contacts.forEach((contact) => {
				newContactsState[getContactInputEmail(contact)] = contact;
			});
			setContactsState(newContactsState);
			const newAttendees = mapContactInputAttendees(contacts);
			dispatch(
				editEditorAttendees({
					id: editorId,
					attendees: newAttendees
				})
			);
		},
		[dispatch, editorId]
	);
	const attendeesChipInputValues: ChipItem<EditorChipAttendees>[] = useMemo(
		() =>
			map(attendees, (attendee) => ({
				label: attendee.email,
				value: attendee
			})),
		[attendees]
	);
	const attendeesContactInputValues: ContactInputItem[] = useMemo(() => {
		if (attendees?.length > 0) {
			return map(attendees, (attendee) => {
				const currentChipAvailability = find(attendeesAvailabilityList, ['email', attendee.email]);
				const storedValue = contactsState[attendee.email];
				const currentContactInput = applyAttendeeToContactInputItem(attendee, storedValue);

				if (currentChipAvailability) {
					const isBusyAtTimeOfEvent = getIsBusyAtTimeOfTheEvent(
						currentChipAvailability,
						start,
						end,
						attendeesAvailabilityList,
						allDay
					);

					currentContactInput.actions =
						isBusyAtTimeOfEvent && !find(currentContactInput.actions, ['id', 'unavailable'])
							? [
									...(currentContactInput.actions ?? []),
									{
										id: 'unavailable',
										label: t(
											'attendee_unavailable',
											'Attendee not available at the selected time of the event'
										),
										color: 'error',
										type: 'icon',
										icon: 'AlertTriangle'
									} as const
								]
							: currentContactInput.actions;
				}
				return currentContactInput;
			});
		}
		return [];
	}, [allDay, attendees, attendeesAvailabilityList, contactsState, end, start, t]);

	return (
		<>
			<AttendeesContainer>
				<Container
					orientation="horizontal"
					background={'gray5'}
					style={{ overflow: 'hidden' }}
					padding={{ all: 'none' }}
				>
					<Container background={'gray5'} style={{ overflow: 'hidden' }}>
						{integrationAvailable ? (
							<ContactInput
								placeholder={t('label.attendees', 'Attendees')}
								onChange={onChangeAttendeeContact}
								defaultValue={attendeesContactInputValues}
								disabled={disabled?.attendees}
								dragAndDropEnabled
								orderedAccountIds={orderedAccountIds}
							/>
						) : (
							<ChipInput
								data-testid={'attendees-chip-input'}
								placeholder={t('label.attendees', 'Attendees')}
								background={'gray5'}
								onChange={onChangeAttendeeChip}
								onAdd={validateChipInput}
								defaultValue={attendeesChipInputValues}
								hasError={hasError}
								description={hasError ? '' : undefined}
								disabled={disabled?.attendees}
							/>
						)}
					</Container>
					<Container
						width="fit"
						background={'gray5'}
						padding={{ right: 'medium', left: 'extrasmall' }}
						orientation="horizontal"
					>
						<Button
							label={t('label.optionals', 'Optionals')}
							type="ghost"
							color="secondary"
							style={{ padding: 0 }}
							onClick={toggleOptionals}
						/>
					</Container>
				</Container>
			</AttendeesContainer>
			<EditorAvailabilityWarningRow
				label={t(
					'attendees_unavailable',
					'One or more attendees are not available at the selected time of the event'
				)}
				list={attendeesAvailabilityList}
				items={attendees}
				editorId={editorId}
			/>
			{showOptionals && (
				<Row height="fit" width="fill" padding={{ top: 'large' }}>
					<AttendeesContainer>
						<EditorOptionalAttendees editorId={editorId} orderedAccountIds={orderedAccountIds} />
					</AttendeesContainer>
				</Row>
			)}
		</>
	);
};
