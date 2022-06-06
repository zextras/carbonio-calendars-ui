/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, {
	useCallback,
	useEffect,
	useMemo,
	useState,
	useLayoutEffect,
	useContext
} from 'react';
import styled from 'styled-components';

import { useTranslation } from 'react-i18next';
import {
	Checkbox,
	Container,
	Row,
	Divider,
	Padding,
	Select,
	Text,
	Button,
	ChipInput
} from '@zextras/carbonio-design-system';
import { map, find, filter, flatten, findIndex, some } from 'lodash';
import {
	useIntegratedComponent,
	useUserAccount,
	useUserSettings
} from '@zextras/carbonio-shell-ui';
import SaveSendButtons from './components/save-send-buttons';
import DataRecap from './components/data-recap';
import InputRow from './components/input-row';
import FreeBusySelector from './components/free-busy-selector';
import CalendarSelector from './components/calendar-selector';
import ReminderSelector from './components/reminder-selector';
import ExpandedButtons, { addAttachments } from './components/expanded-buttons';

import { AttachmentsBlock } from '../event-panel-view/attachments-part';
import DatePicker from './components/date-picker';
import RecurrenceSelector from './components/recurrence-selector';
import DropZoneAttachment from './components/dropzone-component';

const emailRegex = /[^\s@]+@[^\s@]+\.[^\s@]+/;
export const TextArea = styled.textarea`
	box-sizing: border-box;
	padding: ${(props) => props.theme.sizes.padding.large};
	background: ${(props) => props.theme.palette.gray5.regular};
	height: fit-content;
	min-height: 150px;
	flex-grow: 1;
	width: 100%;
	border: none;
	resize: none;
	& :focus,
	:active {
		box-shadow: none;
		border: none;
		outline: none;
	}
`;

export const EditorWrapper = styled.div`
	width: 100%;
	height: 100%;
	overflow-y: auto;

	position: relative;
	.tox .tox-editor-header {
		z-index: 0;
	}
	> .tox:not(.tox-tinymce-inline) {
		width: 100%;
		border: none;

		.tox-editor-header {
			background-color: ${(props) => props.theme.palette.gray6.regular};
		}
		.tox-toolbar__primary {
			background: none;
			background-color: ${(props) => props.theme.palette.gray4.regular};
			border-radius: ${(props) => props.theme.borderRadius};
		}
	}
	> .tox {
		.tox-edit-area {
			margin-left: calc(-1rem + ${(props) => props.theme.sizes.padding.large});
			overflow-y: auto;
			max-height: 100%;
		}
		.tox-edit-area__iframe {
			height: 100%;
			padding-bottom: ${(props) => props.theme.sizes.padding.large};
		}
		&.tox-tinymce {
			height: 100%;
		}
	}
`;

export const AttendeesContainer = styled.div`
	width: calc(100% - ${({ hasTooltip }) => (hasTooltip ? `48px` : '0px')});
	height: fit-content;
	background: ${({ theme }) => theme.palette.gray5.regular};
	border-bottom: 1px solid ${({ theme }) => theme.palette.gray2.regular};
	[class^='Chip__ChipComp'] {
		[class^='Text__Comp'] {
			color: ${({ theme }) => theme.palette.text.regular};
		}
	}
`;

function ShiftedRow(props) {
	return <Row padding={{ top: 'large' }} width="fill" mainAlignment="flex-start" {...props} />;
}

export default function EditorCompleteView({
	setTitle,
	data,
	callbacks,
	invite,
	updateAppTime = false,
	proposeNewTime
}) {
	const [t] = useTranslation();
	const title = useMemo(() => (data && data.title !== '' ? data.title : 'No Subject'), [data]);
	const settings = useUserSettings();
	const account = useUserAccount();
	const [ContactInput, integrationAvailable] = useIntegratedComponent('contact-input');
	const [RoomSelector, isRoomAvailable] = useIntegratedComponent('room-selector');

	const [richText, setRichText] = useState('');
	const [dropZoneEnable, setDropZoneEnable] = useState(false);
	const [showOptionals, setShowOptional] = useState(false);
	const toggleOptionals = useCallback(() => setShowOptional((show) => !show), []);

	const onDragOverEvent = (event) => {
		event.preventDefault();
		setDropZoneEnable(true);
	};

	const [defaultIdentity, setDefaultIdentity] = useState({});
	const [list, setList] = useState([]);

	useEffect(() => {
		if (data?.resource?.optionalAttendees?.length) {
			setShowOptional(true);
		}
	}, [data?.resource?.optionalAttendees?.length]);

	const newItems = useMemo(
		() =>
			map(list, (el) => ({
				label: el.label,
				value: el.value,
				address: el.address,
				fullname: el.fullName,
				type: el.type,
				identityName: el.identityName,
				customComponent: (
					<Container
						width="100%"
						takeAvailableSpace
						mainAlignment="space-between"
						orientation="horizontal"
						height="fit"
					>
						<Padding left="small">
							<Text>{el.label}</Text>
						</Padding>
					</Container>
				)
			})),
		[list]
	);

	const onOrganizerChange = useCallback(
		(val) => {
			const selectedOrganizer = find(list, { value: val });
			callbacks.onOrganizerChange(
				selectedOrganizer.type === 'sendOnBehalfOf'
					? {
							email: selectedOrganizer.address,
							name: selectedOrganizer.fullname,
							sentBy: account.name
					  }
					: {
							email: selectedOrganizer.address,
							name: selectedOrganizer.fullname
					  }
			);
		},
		[account.name, callbacks, list]
	);

	useEffect(() => {
		const identityList = map(account.identities.identity, (item, idx) => ({
			value: idx,

			label: `${item.name}(${item._attrs?.zimbraPrefFromDisplay}  <${item._attrs?.zimbraPrefFromAddress}>)`,
			address: item._attrs?.zimbraPrefFromAddress,
			fullname: item._attrs?.zimbraPrefFromDisplay,
			type: item._attrs.zimbraPrefFromAddressType,
			identityName: item.name
		}));
		setDefaultIdentity(find(identityList, (item) => item?.identityName === 'DEFAULT'));

		const rightsList = map(
			filter(
				account?.rights?.targets,
				(rts) => rts.right === 'sendAs' || rts.right === 'sendOnBehalfOf'
			),
			(ele, idx) =>
				map(ele?.target, (item) => ({
					value: idx + identityList.length,
					label:
						ele.right === 'sendAs'
							? `${item.d}<${item.email[0].addr}>`
							: t('label.on_behalf_of', {
									identity: item.d,
									accountName: account.name,
									otherAccount: item.email[0].addr,
									defaultValue: '{{accountName}} on behalf of {{identity}} <{{otherAccount}}>'
							  }),
					address: item.email[0].addr,
					fullname: item.d,
					type: ele.right,
					identityName: ''
				}))
		);

		const flattenList = flatten(rightsList);
		const uniqueIdentityList = [...identityList];
		if (flattenList?.length) {
			map(flattenList, (ele) => {
				const uniqIdentity = findIndex(identityList, { address: ele.address });
				if (uniqIdentity < 0) uniqueIdentityList.push(ele);
			});
			setList(uniqueIdentityList);
		} else setList(identityList);
	}, [account, t]);

	const onDropEvent = (event) => {
		event.preventDefault();
		setDropZoneEnable(false);
		addAttachments(
			callbacks.onSave,
			callbacks.uploadAttachments,
			data,
			invite,
			event.dataTransfer.files
		).then(({ payload, mp }) => {
			const attachments = map(payload, (file) => ({
				contentType: file.ct,
				disposition: 'attachment',
				filename: file.filename,
				name: undefined,
				size: file.s,
				aid: file.aid
			}));
			callbacks.onAttachmentsChange(
				{ aid: map(payload, (el) => el.aid), mp },
				data?.resource?.attachmentFiles
					? [...data.resource.attachmentFiles, ...attachments]
					: attachments,
				false
			);
		});
	};

	const onDragLeaveEvent = (event) => {
		event.preventDefault();
		setDropZoneEnable(false);
	};
	useEffect(() => {
		setRichText(data?.resource.richText || data?.resource.plainText);
	}, [data]);

	const onEditorChange = useCallback(
		(change) => {
			setRichText(change[1]);
			callbacks.onTextChange(change);
		},
		[callbacks]
	);
	const textAreaLabel = useMemo(
		() => t('messages.format_as_plain_text', 'Format as Plain Text'),
		[t]
	);
	useLayoutEffect(() => {
		if (setTitle) {
			setTitle(title);
		}
	}, [title, setTitle]);

	const onAttendeesChange = useCallback(
		(participants) => {
			callbacks.onAttendeesChange(
				map(participants, (participant) =>
					participant.email
						? {
								type: 'to',
								address: participant.email,
								name: participant.firstName,
								fullName: participant.fullName,
								error: !emailRegex.test(participant.email)
						  }
						: {
								...participant,
								email: participant.label,
								address: participant.label,
								type: 'to',
								error: !emailRegex.test(participant.label)
						  }
				)
			);
		},
		[callbacks]
	);

	const onOptionalsChange = useCallback(
		(participants) => {
			callbacks.onAttendeesOptionalChange(
				map(participants, (participant) =>
					participant.email
						? {
								type: 'to',
								address: participant.email,
								name: participant.firstName,
								fullName: participant.fullName,
								error: !emailRegex.test(participant.email)
						  }
						: {
								...participant,
								email: participant.label,
								address: participant.label,
								type: 'to',
								error: !emailRegex.test(participant.label)
						  }
				)
			);
		},
		[callbacks]
	);

	const [Composer, composerIsAvailable] = useIntegratedComponent('composer');
	return (
		<Container
			padding={{ horizontal: 'large', bottom: 'large', top: 'small' }}
			mainAlignment="flex-start"
			crossAlignment="flex-start"
			onDragOver={(event) => onDragOverEvent(event)}
		>
			{dropZoneEnable && (
				<DropZoneAttachment
					onDragOverEvent={onDragOverEvent}
					onDropEvent={onDropEvent}
					onDragLeaveEvent={onDragLeaveEvent}
				/>
			)}
			{data && (
				<Row
					orientation="horizontal"
					padding={{ bottom: 'large', top: 'small', horizontal: 'medium' }}
					height="fit"
					width="fill"
					mainAlignment="flex-end"
					background="gray6"
				>
					<ExpandedButtons data={data} callbacks={callbacks} invite={invite} />
					<SaveSendButtons
						proposeNewTime={proposeNewTime}
						onSend={proposeNewTime ? callbacks.onProposeNewTime : callbacks.onSend}
						onSave={callbacks.onSave}
						data={data}
					/>
					<DataRecap data={data} />
					<Divider />
				</Row>
			)}
			{data && (
				<Container
					background="gray6"
					padding={{ all: 'large', bottom: 'extralarge' }}
					mainAlignment="flex-start"
					crossAlignment="flex-start"
					height="fit"
					style={{
						overflowY: 'auto',
						display: 'block',
						float: 'left'
					}}
				>
					<Row mainAlignment="flex-start" crossAlignment="flex-start" width="fill">
						<Container orientation="vertical" style={{ minWidth: '800px' }}>
							{defaultIdentity && list.length && (
								<Select
									items={newItems}
									label={t('placeholder.organizer', 'Organizer')}
									defaultSelection={{
										label: defaultIdentity?.label,
										value: defaultIdentity?.value
									}}
									onChange={onOrganizerChange}
								/>
							)}
							<InputRow
								label={t('label.event_title', 'Event title')}
								defaultValue={data.title}
								onChange={callbacks.onSubjectChange}
							/>
							<InputRow
								label={t('label.location', 'Location')}
								defaultValue={data.resource.location}
								onChange={callbacks.onLocationChange}
							/>
							{isRoomAvailable && (
								<>
									<Padding top="large" />
									<RoomSelector
										onChange={callbacks.onRoomChange}
										defaultValue={data?.resource?.room}
									/>
								</>
							)}
							<ShiftedRow>
								<AttendeesContainer>
									<Container
										orientation="horizontal"
										background="gray5"
										style={{ overflow: 'hidden' }}
										padding={{ all: 'none' }}
									>
										<Container background="gray5" style={{ overflow: 'hidden' }}>
											{integrationAvailable ? (
												<ContactInput
													placeholder={t('label.attendee_plural', 'Attendees')}
													onChange={callbacks.onAttendeesChange}
													defaultValue={data.resource.attendees}
													disabled={updateAppTime}
												/>
											) : (
												<ChipInput
													placeholder={t('label.attendee_plural', 'Attendees')}
													background="gray5"
													onChange={onAttendeesChange}
													defaultValue={data.resource.attendees}
													valueKey="address"
													hasError={some(data.resource.attendees || [], { error: true })}
													errorLabel=""
													disabled={updateAppTime}
												/>
											)}
										</Container>
										<Container
											width="fit"
											background="gray5"
											padding={{ right: 'medium', left: 'extrasmall' }}
											orientation="horizontal"
										>
											<Button
												label={t('label.optional_plural', 'Optionals')}
												type="ghost"
												labelColor="secondary"
												style={{ padding: 0 }}
												onClick={toggleOptionals}
											/>
										</Container>
									</Container>
								</AttendeesContainer>
							</ShiftedRow>

							{showOptionals && (
								<ShiftedRow>
									<AttendeesContainer>
										{integrationAvailable ? (
											<ContactInput
												placeholder={t('label.optional_plural', 'Optionals')}
												onChange={callbacks.onAttendeesOptionalChange}
												defaultValue={data.resource.optionalAttendees}
												disabled={updateAppTime}
											/>
										) : (
											<ChipInput
												placeholder={t('label.optional_plural', 'Optionals')}
												background="gray5"
												onChange={onOptionalsChange}
												defaultValue={data.resource.optionalAttendees}
												valueKey="address"
												hasError={some(data.resource.optionalAttendees || [], {
													error: true
												})}
												errorLabel=""
												disabled={updateAppTime}
											/>
										)}
									</AttendeesContainer>
								</ShiftedRow>
							)}

							<ShiftedRow width="fill" style={{ minWidth: '40%' }} mainAlignment="space-between">
								<Container width="calc(50% - 4px)">
									<FreeBusySelector
										style={{ maxWidth: '48%' }}
										disabled={updateAppTime}
										onDisplayStatusChange={callbacks.onDisplayStatusChange}
										data={data}
									/>
								</Container>
								<Container width="calc(50% - 4px)">
									<CalendarSelector
										calendarId={data.resource.calendar.id}
										onCalendarChange={callbacks.onCalendarChange}
										style={{ maxWidth: '48%' }}
										updateAppTime={updateAppTime}
									/>
								</Container>
							</ShiftedRow>
							<ShiftedRow>
								<Checkbox
									label={t('label.private', 'Private')}
									onChange={callbacks.onPrivateChange}
									defaultChecked={data.resource.class === 'PRI'}
									disabled={updateAppTime}
								/>
							</ShiftedRow>
							<Container
								height="fit"
								padding={{ top: 'large' }}
								mainAlignment="flex-start"
								crossAlignment="flex-start"
							>
								<DatePicker
									start={data.start}
									end={data.end}
									allDay={data.allDay}
									onChange={callbacks.onDateChange}
									onAllDayChange={callbacks.onAllDayChange}
									settings={settings}
									onTimeZoneChange={callbacks.onTimeZoneChange}
									startTimeZone={data.startTimeZone}
									endTimeZone={data.endTimeZone}
									invite={invite}
									t={t}
								/>
							</Container>

							<ShiftedRow style={{ minWidth: '40%' }} mainAlignment="space-between">
								<Container width="calc(50% - 4px)">
									<ReminderSelector
										disabled={updateAppTime}
										onReminderChange={callbacks.onReminderChange}
										data={data}
									/>
								</Container>
								<Container width="calc(50% - 4px)">
									<RecurrenceSelector
										data={data}
										callbacks={callbacks}
										updateAppTime={updateAppTime}
									/>
								</Container>
							</ShiftedRow>

							{data?.resource?.attachmentFiles && data?.resource?.attachmentFiles?.length > 0 && (
								<AttachmentsBlock
									attachments={data?.resource.attachmentFiles}
									id={data.resource.inviteId}
									subject={data?.resource?.title}
									onAttachmentsChange={callbacks?.onAttachmentsChange}
									isEditor
									isComplete
								/>
							)}
						</Container>
						<Container orientation="vertical" width="30%">
							{/*	TODO: suggested parts */}
						</Container>
					</Row>

					<Container minHeight="200px" padding={{ vertical: 'large' }}>
						{composerIsAvailable && data.resource.isRichText ? (
							<EditorWrapper>
								<Composer value={richText} onEditorChange={onEditorChange} minHeight={200} />
							</EditorWrapper>
						) : (
							<TextArea
								placeholder={textAreaLabel}
								defaultValue={data.resource.plainText}
								onChange={(ev) => {
									// eslint-disable-next-line no-param-reassign
									ev.target.style.height = 'auto';
									// eslint-disable-next-line no-param-reassign
									ev.target.style.height = `${25 + ev.target.scrollHeight}px`;
									callbacks.onTextChange([ev.target.value, ev.target.value]);
								}}
							/>
						)}
					</Container>
				</Container>
			)}
		</Container>
	);
}
