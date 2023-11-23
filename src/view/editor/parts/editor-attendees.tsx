/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useCallback, useMemo, useState } from 'react';

import { Button, ChipInput, Text, Container, Row } from '@zextras/carbonio-design-system';
import { useIntegratedComponent } from '@zextras/carbonio-shell-ui';
import { find, intersectionBy, isNil, map, some, startsWith } from 'lodash';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import {
	AttendeesAvailabilityListType,
	AttendeesAvailabilityType,
	useAttendeesAvailability
} from '../../../hooks/use-attendees-availability';
import { useAppDispatch, useAppSelector } from '../../../store/redux/hooks';
import {
	selectEditorAllDay,
	selectEditorAttendees,
	selectEditorDisabled,
	selectEditorEnd,
	selectEditorOptionalAttendees,
	selectEditorStart,
	selectEditorUid
} from '../../../store/selectors/editor';
import {
	editEditorAttendees,
	editEditorOptionalAttendees
} from '../../../store/slices/editor-slice';
import { Editor } from '../../../types/editor';

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

export const getIsBusyAtTimeOfTheEvent = (
	item: AttendeesAvailabilityType,
	start: Editor['start'],
	end: Editor['end'],
	attendeesAvailabilityList: AttendeesAvailabilityListType,
	isAllDay: Editor['allDay']
): boolean => {
	if (start && end && attendeesAvailabilityList && !isNil(isAllDay)) {
		const startDate = moment(start);
		const endDate = moment(end);

		const startDay = startDate.format('DDMMYYYY');
		const endDay = endDate.format('DDMMYYYY');
		const diffInDays = endDate.diff(startDate, 'days');
		const startHour = startDate.format('HHmm');
		const endHour = endDate.format('HHmm');

		if (isAllDay) {
			const diffInDaysAllDay = endDate
				.add(1, 'day')
				.startOf('day')
				.diff(startDate.startOf('day'), 'days');
			return diffInDaysAllDay > 1
				? false
				: !!find(
						(item.t ?? []).concat(item.b ?? []),
						(slot) =>
							moment(slot.s).format('DD') === startDate.format('DD') ||
							moment(slot.e).format('DD') === startDate.format('DD')
				  );
		}

		// from 00:00 to 00:00
		const lastsEntireDay = diffInDays === 1 && startHour === endHour && startsWith(startHour, '00');
		const endsTheSameDay = startDay === endDay;
		if (lastsEntireDay || endsTheSameDay) {
			return !!find(
				(item.t ?? []).concat(item.b ?? []),
				(slot) =>
					// appointment starts while attendee is busy
					(start > slot.s && start < slot.e) ||
					// the appointment ends while attendee is busy
					(end > slot.s && end < slot.e) ||
					// the appointment starts before the attendee is busy and ends after the attendee is busy
					(start < slot.s && end > slot.e) ||
					// the appointment starts when the attendee has another appointment starting at the same time
					start === slot.s ||
					// the appointment ends when the attendee has another appointment ending at the same time
					end === slot.e
			);
		}
	}

	return false;
};

export const EditorAttendees = ({ editorId }: EditorAttendeesProps): ReactElement => {
	const [t] = useTranslation();
	const [ContactInput, integrationAvailable] = useIntegratedComponent('contact-input');
	const [showOptionals, setShowOptional] = useState(false);
	const toggleOptionals = useCallback(() => setShowOptional((show) => !show), []);
	const dispatch = useAppDispatch();
	const attendees = useAppSelector(selectEditorAttendees(editorId));
	const uid = useAppSelector(selectEditorUid(editorId));
	const optionalAttendees = useAppSelector(selectEditorOptionalAttendees(editorId));
	const disabled = useAppSelector(selectEditorDisabled(editorId));
	const start = useAppSelector(selectEditorStart(editorId));
	const end = useAppSelector(selectEditorEnd(editorId));
	const allDay = useAppSelector(selectEditorAllDay(editorId));

	const attendeesAvailabilityList = useAttendeesAvailability(start, attendees, uid);

	const hasError = useMemo(() => some(attendees ?? [], { error: true }), [attendees]);
	const optionalHasError = useMemo(
		() => some(optionalAttendees ?? [], { error: true }),
		[optionalAttendees]
	);

	const onChange = useCallback(
		(value) => {
			const _attendees = map(value, (chip) => ({
				...chip,
				email: chip?.email ?? chip?.label
			}));
			dispatch(
				editEditorAttendees({
					id: editorId,
					attendees: _attendees
				})
			);
		},
		[dispatch, editorId]
	);

	const onOptionalsChange = useCallback(
		(value) => {
			dispatch(editEditorOptionalAttendees({ id: editorId, optionalAttendees: value }));
		},
		[dispatch, editorId]
	);

	const availableChips = useMemo(
		() => intersectionBy(attendeesAvailabilityList, attendees, 'email'),
		[attendees, attendeesAvailabilityList]
	);
	const AnyoneIsBusyAtTimeOfEvent = useMemo(
		() =>
			!!find(availableChips, (item) =>
				getIsBusyAtTimeOfTheEvent(item, start, end, attendeesAvailabilityList, allDay)
			),
		[allDay, attendeesAvailabilityList, availableChips, end, start]
	);
	const defaultValue = useMemo(() => {
		if (attendees?.length > 0) {
			return map(attendees, (chip) => {
				const chipLabel = chip.email ?? chip.label;
				const currentChipAvailability = find(attendeesAvailabilityList, ['email', chipLabel]);

				if (currentChipAvailability) {
					const isBusyAtTimeOfEvent = getIsBusyAtTimeOfTheEvent(
						currentChipAvailability,
						start,
						end,
						attendeesAvailabilityList,
						allDay
					);
					const actions = isBusyAtTimeOfEvent
						? [
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
						: undefined;
					return {
						...chip,
						email: chip?.email ?? chip?.label,
						actions
					};
				}
				return {
					...chip,
					email: chip?.email ?? chip?.label
				};
			});
		}
		return [];
	}, [allDay, attendees, attendeesAvailabilityList, end, start, t]);

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
								// eslint-disable-next-line @typescript-eslint/ban-ts-comment
								// @ts-ignore
								placeholder={t('label.attendee_plural', 'Attendees')}
								onChange={onChange}
								defaultValue={defaultValue}
								disabled={disabled?.attendees}
								dragAndDropEnabled
							/>
						) : (
							<ChipInput
								placeholder={t('label.attendee_plural', 'Attendees')}
								background={'gray5'}
								onChange={onChange}
								defaultValue={defaultValue}
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
			{AnyoneIsBusyAtTimeOfEvent && (
				<Row height="fit" width="fill" mainAlignment={'flex-start'} padding={{ top: 'small' }}>
					<Text size="small" color="error">
						{t(
							'attendees_unavailable',
							'One or more attendees are not available at the selected time of the event'
						)}
					</Text>
				</Row>
			)}
			{showOptionals && (
				<Row height="fit" width="fill" padding={{ top: 'large' }}>
					<AttendeesContainer>
						{integrationAvailable ? (
							<ContactInput
								// eslint-disable-next-line @typescript-eslint/ban-ts-comment
								// @ts-ignore
								placeholder={t('label.optionals', 'Optionals')}
								onChange={onOptionalsChange}
								defaultValue={optionalAttendees}
								dragAndDropEnabled
								disabled={disabled?.optionalAttendees}
							/>
						) : (
							<ChipInput
								placeholder={t('label.optionals', 'Optionals')}
								background={'gray5'}
								onChange={onOptionalsChange}
								defaultValue={optionalAttendees}
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
