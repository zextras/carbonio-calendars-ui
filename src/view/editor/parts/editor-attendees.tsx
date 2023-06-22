/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
	Button,
	ChipInput,
	Text,
	Container,
	Row,
	ChipInputProps
} from '@zextras/carbonio-design-system';
import { useIntegratedComponent } from '@zextras/carbonio-shell-ui';
import { find, intersectionBy, map, some } from 'lodash';
import React, { ReactElement, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useAttendeesAvailability } from '../../../hooks/use-attendees-availability';
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
import { AttendeesChip, getIsBusyAtTimeOfTheEvent } from './attendees-chip';

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
			dispatch(
				editEditorAttendees({
					id: editorId,
					attendees: map(value, (chip) => ({
						...chip,
						email: chip?.email ?? chip?.label
					}))
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

	const CustomChipComponent = useCallback<
		(args: React.ComponentProps<NonNullable<ChipInputProps['ChipComponent']>>) => JSX.Element
	>(
		(props) => (
			<AttendeesChip
				{...props}
				start={start}
				allDay={allDay}
				end={end}
				attendeesAvailabilityList={attendeesAvailabilityList}
			/>
		),
		[start, allDay, end, attendeesAvailabilityList]
	);

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
								defaultValue={attendees}
								ChipComponent={CustomChipComponent}
								disabled={disabled?.attendees}
							/>
						) : (
							<ChipInput
								placeholder={t('label.attendee_plural', 'Attendees')}
								background={'gray5'}
								onChange={onChange}
								defaultValue={attendees}
								hasError={hasError}
								errorLabel=""
								ChipComponent={CustomChipComponent}
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
							labelColor="secondary"
							style={{ padding: 0 }}
							onClick={toggleOptionals}
						/>
					</Container>
				</Container>
			</AttendeesContainer>
			{AnyoneIsBusyAtTimeOfEvent && (
				<Row height="fit" width="fill" mainAlignment={'flex-start'} padding={{ vertical: 'small' }}>
					<Text color="error">
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
								disabled={disabled?.optionalAttendees}
							/>
						) : (
							<ChipInput
								placeholder={t('label.optionals', 'Optionals')}
								background={'gray5'}
								onChange={onOptionalsChange}
								defaultValue={optionalAttendees}
								hasError={optionalHasError}
								errorLabel=""
								disabled={disabled?.optionalAttendees}
							/>
						)}
					</AttendeesContainer>
				</Row>
			)}
		</>
	);
};
