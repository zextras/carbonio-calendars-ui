/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, {
	useCallback,
	useContext,
	useLayoutEffect,
	useMemo,
	useState,
	useEffect
} from 'react';
import { useTranslation } from 'react-i18next';
import {
	Checkbox,
	Container,
	Row,
	RichTextEditor,
	Divider,
	Padding,
	Select,
	Text
} from '@zextras/zapp-ui';
import { map, throttle, find, filter, flatten, findIndex } from 'lodash';
import { useUserAccount, useIntegratedComponent, useUserSettings } from '@zextras/zapp-shell';
import { AttendeesContainer, TextArea, EditorWrapper } from './editor-complete-view';

import ExpandedButtons, { addAttachments } from './components/expanded-buttons';
import SaveSendButtons from './components/save-send-buttons';
import DataRecap from './components/data-recap';
import InputRow from './components/input-row';
import FreeBusySelector from './components/free-busy-selector';
import CalendarSelector from './components/calendar-selector';
import DatePicker from './components/date-picker';
import ReminderSelector from './components/reminder-selector';
import RecurrenceSelector from './components/recurrence-selector';
import AttachmentsBlock from '../event-panel-view/attachments-part';
import { EventContext } from '../../commons/event-context';
import DropZoneAttachment from './components/dropzone-component';

export default function EditorSmallView({
	setTitle,
	data,
	callbacks,
	invite,
	updateAppTime = false,
	proposeNewTime
}) {
	const [t] = useTranslation();

	const [firstTime, setFirstTime] = useState(true);

	const title = useMemo(() => (data && data.title !== '' ? data.title : 'No Subject'), [data]);
	const settings = useUserSettings();
	const account = useUserAccount();
	const utils = useContext(EventContext);
	const [dropZoneEnable, setDropZoneEnable] = useState(false);
	useLayoutEffect(() => {
		setTitle && setTitle(title);
	}, [title, setTitle, data, callbacks]);

	const [ContactInput] = useIntegratedComponent('contact-input');
	const onDragOverEvent = (event) => {
		event.preventDefault();
		setDropZoneEnable(true);
	};

	const [defaultIdentity, setDefaultIdentity] = useState({});
	const [list, setList] = useState([]);

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
									identitiy: item.d,
									accountName: account.name,
									otherAccount: item.email[0].addr,
									defaultValue: '{{accountName}} on behalf of {{identitiy}} <{{otherAccount}}>'
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
		[account, callbacks, list]
	);

	useEffect(() => {
		if (firstTime && data?.resource?.richText) {
			setFirstTime(false);
		}
	}, [data, firstTime]);

	const textAreaLabel = useMemo(
		() => t('messages.format_as_plain_text', 'Format as Plain Text'),
		[t]
	);

	const updateInputField = useCallback(
		(fn) =>
			throttle(fn, 250, {
				trailing: true,
				leading: false
			}),
		[]
	);

	return (
		<Container
			padding={{ horizontal: 'large', bottom: 'large' }}
			mainAlignment="flex-start"
			crossAlignment="flex-start"
		>
			{data && (
				<Row
					orientation="horizontal"
					padding={{ top: 'small', bottom: 'small' }}
					height="fit"
					width="fill"
					mainAlignment="flex-end"
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
			<Container
				height="fit"
				background="gray6"
				mainAlignment="flex-start"
				crossAlignment="flex-start"
				padding={{ all: 'large', bottom: 'extralarge' }}
				onDragOver={(event) => onDragOverEvent(event)}
				style={{
					overflowY: 'auto',
					display: 'block',
					float: 'left'
				}}
			>
				{dropZoneEnable && (
					<DropZoneAttachment
						onDragOverEvent={onDragOverEvent}
						onDropEvent={onDropEvent}
						onDragLeaveEvent={onDragLeaveEvent}
					/>
				)}
				{data && (
					<>
						<Container style={{ overflowY: 'auto' }} height="fit">
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
								onChange={updateInputField(callbacks.onSubjectChange)}
								disabled={updateAppTime}
							/>

							<InputRow
								label={t('label.location', 'Location')}
								defaultValue={data.resource.location}
								onChange={updateInputField(callbacks.onLocationChange)}
								disabled={updateAppTime}
							/>

							<Row width="fill" padding={{ top: 'large' }}>
								<AttendeesContainer>
									<ContactInput
										placeholder={t('label.attendee_plural', 'Attendees')}
										onChange={callbacks.onAttendeesChange}
										defaultValue={data.resource.attendees}
										disabled={updateAppTime}
									/>
								</AttendeesContainer>
							</Row>
							<Container
								orientation="vertical"
								height="fit"
								width="fill"
								style={{ maxWidth: '70vw' }}
								mainAlignment="flex-start"
								crossAlignment="flex-start"
							>
								<Row
									width="fill"
									style={{ minWidth: '40%' }}
									padding={{ top: 'large' }}
									mainAlignment="space-between"
								>
									<Container width="calc(50% - 4px)">
										<FreeBusySelector
											onDisplayStatusChange={callbacks.onDisplayStatusChange}
											data={data}
											style={{ maxWidth: '48%' }}
											disabled={updateAppTime}
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
								</Row>
								<Row padding={{ top: 'large' }}>
									<Checkbox
										label={t('label.private', 'Private')}
										onChange={callbacks.onPrivateChange}
										defaultChecked={data.resource.class === 'PRI'}
										disabled={updateAppTime}
									/>
								</Row>
								<Container
									height="fit"
									padding={{ top: 'large' }}
									mainAlignment="flex-start"
									crossAlignment="flex-start"
								>
									<DatePicker
										start={data.start ?? utils.event.start}
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
								<Row
									width="fill"
									style={{ minWidth: '40%' }}
									padding={{ top: 'large' }}
									mainAlignment="space-between"
								>
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
								</Row>
								{data?.resource?.attachmentFiles && data?.resource?.attachmentFiles?.length > 0 && (
									<AttachmentsBlock
										attachments={data?.resource.attachmentFiles}
										message={{ id: data?.resource.inviteId, subject: data?.title }}
										callbacks={callbacks}
										isEditor
									/>
								)}
							</Container>
							<Container minHeight="200px" padding={{ vertical: 'large' }}>
								{data.resource.isRichText ? (
									<EditorWrapper>
										<RichTextEditor
											value={data.resource.richText}
											onEditorChange={updateInputField(callbacks.onTextChange)}
											minHeight={200}
										/>
									</EditorWrapper>
								) : (
									<TextArea
										placeholder={textAreaLabel}
										value={data.resource.plainText}
										onChange={updateInputField((ev) => {
											// eslint-disable-next-line no-param-reassign
											ev.target.style.height = 'auto';
											// eslint-disable-next-line no-param-reassign
											ev.target.style.height = `${25 + ev.target.scrollHeight}px`;
											callbacks.onTextChange([ev.target.value, ev.target.value]);
										})}
									/>
								)}
							</Container>
						</Container>
					</>
				)}
			</Container>
		</Container>
	);
}
