/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useCallback, useEffect, useMemo, useState } from 'react';

import {
	Button,
	ChipInput,
	ChipInputProps,
	ChipItem,
	Container,
	Row,
	useSnackbar
} from '@zextras/carbonio-design-system';
import { useIntegratedComponent } from '@zextras/carbonio-shell-ui';
import { find, map, reduce, reject, some, uniqBy } from 'lodash';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import {
	EditorAvailabilityWarningRow,
	getIsBusyAtTimeOfTheEvent
} from './editor-availability-warning-row';
import { getOrderedAccountIds } from '../../../carbonio-ui-commons/helpers/identities';
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
import {
	editEditorAttendees,
	editEditorOptionalAttendees
} from '../../../store/slices/editor-slice';
import { EditorChipAttendees } from '../../../types/store/invite';

function mapContactInputAttendees(contacts: ContactInputItem[]): EditorChipAttendees[] {
	return contacts.map((contact) => ({
		label: contact.label,
		fullName: contact.fullName,
		email: contact.email ?? 'unknown'
	}));
}

function handleContactsChange(
	contacts: ContactInputItem[],
	setterForState: (args: Record<string, ContactInputItem>) => void,
	dispatchAction: (args: { attendees: EditorChipAttendees[] }) => any
): void {
	const attendeesToSave = mapContactInputAttendees(contacts);
	const newContactsState: Record<string, ContactInputItem> = {};
	contacts.forEach((contact) => {
		if (contact.email) {
			newContactsState[contact.email] = contact;
		}
	});
	setterForState(newContactsState);
	dispatchAction({
		attendees: attendeesToSave
	});
}

function handleChipChange(
	chips: ChipItem<EditorChipAttendees>[],
	dispatchAction: (args: { attendees: EditorChipAttendees[] }) => any
): void {
	const attendeesToSave = uniqBy(
		reduce(
			chips,
			(acc, chip) => (chip.value ? [...acc, chip.value] : acc),
			[] as Array<EditorChipAttendees>
		),
		'email'
	);
	if (attendeesToSave.length) {
		dispatchAction({ attendees: attendeesToSave });
	}
}

type EditorAttendeesProps = {
	editorId: string;
};

// TODO: use types from contact. Consider extracting them or create a @types module
type ContactInputAction = {
	id: string;
	label: string;
	icon: string;
	type: string;
	color?: string;
	onClick?: () => void;
};

type ContactInputItem = {
	id?: string;
	email?: string;
	label?: string;
	fullName?: string;
	actions?: Array<ContactInputAction>;
	error?: boolean;
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
	const uid = useAppSelector(selectEditorUid(editorId));
	const optionalAttendees = useAppSelector(selectEditorOptionalAttendees(editorId));
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
	const [contactsState, setContactsState] = useState<Record<string, ContactInputItem>>({});

	const [optionalContactsState, setOptionalContactsState] = useState<
		Record<string, ContactInputItem>
	>({});

	const hasError = useMemo(() => some(attendees ?? [], { error: true }), [attendees]);
	const optionalHasError = useMemo(
		() => some(optionalAttendees ?? [], { error: true }),
		[optionalAttendees]
	);

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

	const onAddChipInput = useCallback<NonNullable<ChipInputProps<EditorChipAttendees>['onAdd']>>(
		(valueToAdd): ChipItem<EditorChipAttendees> => {
			if (valueToAdd && typeof valueToAdd === 'string') {
				return { label: valueToAdd, value: { email: valueToAdd } };
			}
			throw new Error('invalid keywords received');
		},
		[]
	);

	const onChangeAttendeeChip = useCallback<(items: ChipItem<EditorChipAttendees>[]) => void>(
		(chips) => {
			handleChipChange(chips, (args: { attendees: EditorChipAttendees[] }) => {
				dispatch(editEditorAttendees({ id: editorId, attendees: args.attendees }));
			});
		},
		[dispatch, editorId]
	);
	const onChangeAttendeeContact = useCallback<(items: Array<ContactInputItem>) => void>(
		(contacts) => {
			handleContactsChange(
				contacts,
				setContactsState,
				(args: { attendees: EditorChipAttendees[] }) => {
					dispatch(editEditorAttendees({ id: editorId, attendees: args.attendees }));
				}
			);
		},
		[dispatch, editorId]
	);
	const attendeesChipInputValues: ChipItem<EditorChipAttendees>[] = useMemo(
		() =>
			map(attendees, (attendee) => ({
				label: attendee.label ?? attendee.email,
				value: attendee
			})),
		[attendees]
	);
	const attendeesContactInputValues: Array<ContactInputItem> = useMemo(() => {
		if (attendees?.length > 0) {
			return map(attendees, (attendee) => {
				const currentChipAvailability = find(attendeesAvailabilityList, ['email', attendee.email]);

				const currentContactInput = {
					email: attendee.email,
					fullName: attendee.fullName,
					id: contactsState[attendee.email]?.id,
					actions: contactsState[attendee.email]?.actions,
					error: contactsState[attendee.email]?.error
				};
				const oldActions =
					(currentContactInput?.actions && !currentContactInput?.error) ||
					!currentContactInput?.email
						? reject(currentContactInput?.actions, ['icon', 'EditOutline'])
						: currentContactInput?.actions;

				if (currentChipAvailability) {
					const isBusyAtTimeOfEvent = getIsBusyAtTimeOfTheEvent(
						currentChipAvailability,
						start,
						end,
						attendeesAvailabilityList,
						allDay
					);

					const actions =
						isBusyAtTimeOfEvent && !find(oldActions, ['id', 'unavailable'])
							? [
									...(oldActions ?? []),
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
							: oldActions;
					return {
						...currentContactInput,
						actions
					};
				}
				return {
					...currentContactInput,
					actions: oldActions
				};
			});
		}
		return [];
	}, [allDay, attendees, attendeesAvailabilityList, contactsState, end, start, t]);

	const onChangeOptionalChip = useCallback<
		NonNullable<ChipInputProps<EditorChipAttendees>['onChange']>
	>(
		(chips) => {
			handleChipChange(chips, (args: { attendees: EditorChipAttendees[] }) => {
				dispatch(editEditorOptionalAttendees({ id: editorId, optionalAttendees: args.attendees }));
			});
		},
		[dispatch, editorId]
	);
	const onChangeOptionalContact = useCallback<(items: Array<ContactInputItem>) => void>(
		(contacts) => {
			handleContactsChange(
				contacts,
				setOptionalContactsState,
				(args: { attendees: EditorChipAttendees[] }) => {
					dispatch(
						editEditorOptionalAttendees({ id: editorId, optionalAttendees: args.attendees })
					);
				}
			);
		},
		[dispatch, editorId]
	);
	const optionalAttendeesChipInputValues: ChipItem<EditorChipAttendees>[] = useMemo(
		() =>
			map(optionalAttendees, (optionalAttendee) => ({
				label: optionalAttendee.label ?? optionalAttendee.email,
				value: optionalAttendee
			})),
		[optionalAttendees]
	);
	const optionalAttendeesContactInputValues: Array<ContactInputItem> = useMemo(() => {
		if (optionalAttendees?.length > 0) {
			return map(optionalAttendees, (optionalAttendee) => {
				const currentContactInput = {
					email: optionalAttendee.email,
					fullName: optionalAttendee.fullName,
					id: optionalContactsState[optionalAttendee.email]?.id,
					actions: optionalContactsState[optionalAttendee.email]?.actions,
					error: optionalContactsState[optionalAttendee.email]?.error
				};
				const oldActions =
					(currentContactInput?.actions && !currentContactInput?.error) ||
					!currentContactInput?.email
						? reject(currentContactInput?.actions, ['icon', 'EditOutline'])
						: currentContactInput?.actions;

				return {
					...currentContactInput,
					actions: oldActions
				};
			});
		}
		return [];
	}, [optionalContactsState, optionalAttendees]);

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
								onAdd={onAddChipInput}
								value={attendeesChipInputValues}
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
						{integrationAvailable ? (
							<ContactInput
								placeholder={t('label.optionals', 'Optionals')}
								onChange={onChangeOptionalContact}
								defaultValue={optionalAttendeesContactInputValues}
								disabled={disabled?.optionalAttendees}
								dragAndDropEnabled
								orderedAccountIds={orderedAccountIds}
							/>
						) : (
							<ChipInput
								data-testid={'optional-attendees-chip-input'}
								placeholder={t('label.optionals', 'Optionals')}
								background={'gray5'}
								onChange={onChangeOptionalChip}
								onAdd={onAddChipInput}
								defaultValue={optionalAttendeesChipInputValues}
								hasError={optionalHasError}
								description={optionalHasError ? '' : undefined}
								disabled={disabled?.optionalAttendees}
							/>
						)}
					</AttendeesContainer>
				</Row>
			)}
		</>
	);
};
