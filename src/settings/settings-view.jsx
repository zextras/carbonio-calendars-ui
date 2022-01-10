/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useState, useEffect, useMemo, useCallback, useContext } from 'react';
import {
	useUserSettings,
	useReplaceHistoryCallback,
	soapFetch,
	editSettings
} from '@zextras/zapp-shell';
import {
	Container,
	Padding,
	Text,
	Button,
	Row,
	Divider,
	FormSection,
	FormSubSection,
	SnackbarManagerContext,
	Shimmer
} from '@zextras/zapp-ui';
import { map, filter, isEqual } from 'lodash';
import { useTranslation } from 'react-i18next';
import CustomScheduleModal from './custom-schedule-modal';
import GeneralSettingView from './general-settings-view';
import WorkWeekSettingsView from './work-week-settings-view';
import AppleICalSettings from './apple-ical-settings';
import CreateAppSettings from './creating-app-settings-view';
import PermissionSettings from './permissions-settings-view';
import { differenceObject, validEmail } from './components/utils';

export default function CalendarSettingsView() {
	const [t] = useTranslation();
	const settings = useUserSettings()?.prefs;
	const [isRegular, setIsRegular] = useState(true);
	const [settingsObj, setSettingsObj] = useState({ ...settings });
	const [updatedSettings, setUpdatedSettings] = useState({});
	const [notFirstLoad, setNotFirstLoad] = useState(false);
	const [isEmailNotValid, setisEmailNotValid] = useState(false);
	const replaceHistory = useReplaceHistoryCallback();
	const [userRights, setUserRights] = useState({});
	const [activeFreeBusyOptn, setActiveFreeBusyOptn] = useState(null);
	const [activeInviteOptn, setActiveInviteOptn] = useState(null);
	const [currentFreeBusy, setCurrentFreeBusy] = useState(null);
	const [currentInvite, setCurrentInvite] = useState(null);
	const [allowedFBUsers, setAllowedFBUsers] = useState([]);
	const [allowedInivteUsers, setAllowedInivteUsers] = useState([]);
	const createSnackbar = useContext(SnackbarManagerContext);

	const getUserRights = async () => {
		const response = await soapFetch('GetRights', {
			_jsns: 'urn:zimbraAccount'
		});
		setUserRights(response);
	};
	useEffect(() => {
		getUserRights();
	}, []);

	const [freeBusy, invite] = useMemo(
		() => [
			filter(userRights.ace, (r) => r.right === 'viewFreeBusy'),
			filter(userRights.ace, (r) => r.right === 'invite')
		],
		[userRights]
	);

	useEffect(() => {
		if (freeBusy.length === 1 && freeBusy[0].gt === 'pub') {
			setActiveFreeBusyOptn('allowInternalExternal');
			setCurrentFreeBusy('allowInternalExternal');
		}
		if (freeBusy.length === 1 && freeBusy[0].gt === 'all' && !freeBusy[0].deny) {
			setActiveFreeBusyOptn('allowInternal');
			setCurrentFreeBusy('allowInternal');
		}
		if (freeBusy.length === 1 && freeBusy[0].gt === 'dom' && freeBusy[0].d === 'zextras.com') {
			setActiveFreeBusyOptn('allowDomainUsers');
			setCurrentFreeBusy('allowDomainUsers');
		}
		if (freeBusy.length === 1 && freeBusy[0].gt === 'all' && freeBusy[0].deny) {
			setActiveFreeBusyOptn('allowNone');
			setCurrentFreeBusy('allowNone');
		}
		if (freeBusy.length >= 1 && freeBusy[0].gt === 'usr') {
			setActiveFreeBusyOptn('allowFollowing');
			setCurrentFreeBusy('allowFollowing');
		}
		if (invite.length === 1 && invite[0].gt === 'pub') {
			setActiveInviteOptn('allowInternalExternal');
			setCurrentInvite('allowInternalExternal');
		}
		if (invite.length === 1 && invite[0].gt === 'all' && !invite[0].deny) {
			setActiveInviteOptn('allowInternal');
			setCurrentInvite('allowInternal');
		}

		if (invite.length === 1 && invite[0].gt === 'all' && invite[0].deny) {
			setActiveInviteOptn('allowNone');
			setCurrentInvite('allowNone');
		}
		if (invite.length >= 1 && invite[0].gt === 'usr') {
			setActiveInviteOptn('allowFollowing');
			setCurrentInvite('allowFollowing');
		}
	}, [freeBusy, invite]);

	const handlePermissionChange = useCallback(
		(permission) => () => {
			setActiveFreeBusyOptn(permission);
		},
		[]
	);
	const handleInviteRightChange = useCallback(
		(permission) => () => {
			setActiveInviteOptn(permission);
		},
		[]
	);

	const defaultSelectedInviteContacts = useMemo(
		() =>
			filter(invite, (i) => i.gt === 'usr').length > 0
				? map(
						filter(invite, (i) => i.gt === 'usr'),
						(r) => ({ email: r.d })
				  )
				: [],
		[invite]
	);
	const defaultSelectedFreeBusyContacts = useMemo(
		() =>
			filter(freeBusy, (fb) => fb.gt === 'usr').length > 0
				? map(
						filter(freeBusy, (fb) => fb.gt === 'usr'),
						(r) => ({ email: r.d })
				  )
				: [],
		[freeBusy]
	);

	const isContactChanged = useMemo(
		() =>
			isEqual(defaultSelectedInviteContacts, allowedInivteUsers) &&
			isEqual(defaultSelectedFreeBusyContacts, allowedFBUsers),
		[
			defaultSelectedInviteContacts,
			allowedInivteUsers,
			defaultSelectedFreeBusyContacts,
			allowedFBUsers
		]
	);

	const [loading, setLoading] = useState(false);
	function callLoader() {
		setLoading(true);
		setTimeout(() => setLoading(false), 10);
	}

	const onClose = useCallback(() => {
		setSettingsObj({ ...settings });
		setUpdatedSettings({});
		setActiveFreeBusyOptn(currentFreeBusy);
		setActiveInviteOptn(currentInvite);
		callLoader();
	}, [settings, currentFreeBusy, currentInvite]);

	const updateSettings = useCallback(
		(e) => {
			setSettingsObj({ ...settingsObj, [e.target.name]: e.target.value });
			setUpdatedSettings({ ...updatedSettings, [e.target.name]: e.target.value });
		},
		[settingsObj, updatedSettings]
	);

	const [workingSchedule, setWorkingSchedule] = useState(
		map(settings?.prefs?.zimbraPrefCalendarWorkingHours?.split(','), (schedule) => ({
			day: schedule.split(':')[0],
			working: schedule.split(':')[1] !== 'N',
			start: schedule.split(':')[2],
			end: schedule.split(':')[3]
		}))
	);

	const [open, setOpen] = useState(false);
	const toggleModal = useCallback(() => setOpen(!open), [open]);

	const onFromChange = (data) => {
		data.start
			? setWorkingSchedule(
					workingSchedule.map((schedule) =>
						schedule.day === data.day
							? {
									...schedule,
									end: `${data.hour}${data.minute}`
							  }
							: schedule
					)
			  )
			: setWorkingSchedule(
					workingSchedule.map((schedule) =>
						schedule.day === data.day
							? {
									...schedule,
									start: `${data.hour}${data.minute}`
							  }
							: schedule
					)
			  );
	};

	useEffect(() => {
		const schedule = [...workingSchedule];
		const zimbraPrefCalendarWorkingHours = map(
			schedule,
			(v) => `${v.day}:${v.working ? 'Y' : 'N'}:${v.start}:${v.end}`
		).join();
		if (notFirstLoad) {
			updateSettings({
				target: { name: 'zimbraPrefCalendarWorkingHours', value: zimbraPrefCalendarWorkingHours }
			});
		} else setNotFirstLoad(true);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [workingSchedule]);

	const handelDaysClicked = useCallback(
		(day) => () =>
			setWorkingSchedule(
				workingSchedule.map((schedule) =>
					schedule.day === day
						? {
								...schedule,
								working: !schedule.working
						  }
						: schedule
				)
			),
		[workingSchedule]
	);

	const settingsToUpdate = useMemo(
		() => differenceObject(updatedSettings, settings),
		[updatedSettings, settings]
	);

	const saveChanges = useCallback(() => {
		if (settingsToUpdate.zimbraPrefCalendarForwardInvitesTo) {
			if (!validEmail(settingsToUpdate.zimbraPrefCalendarForwardInvitesTo)) {
				setisEmailNotValid(!isEmailNotValid);
				return;
			}
		}
		let newFreeBusy = null;
		let newInviteRight = null;

		if (currentFreeBusy !== activeFreeBusyOptn) {
			switch (activeFreeBusyOptn) {
				case 'allowInternalExternal':
					newFreeBusy = { gt: 'pub', deny: false };
					break;
				case 'allowInternal':
					newFreeBusy = { gt: 'all', deny: false };
					break;
				case 'allowDomainUsers':
					newFreeBusy = { gt: 'dom', deny: false, d: 'zextras.com' };
					break;
				case 'allowNone':
					newFreeBusy = { gt: 'all', deny: true };
					break;
				default:
					newFreeBusy = { gt: 'usr', deny: false, d: allowedFBUsers };
			}
		}
		if (currentInvite !== activeInviteOptn) {
			switch (activeInviteOptn) {
				case 'allowInternalExternal':
					newInviteRight = { gt: 'pub', deny: false };
					break;
				case 'allowInternal':
					newInviteRight = { gt: 'all', deny: false };
					break;
				case 'allowNone':
					newInviteRight = { gt: 'all', deny: true };
					break;
				default:
					newInviteRight = { gt: 'usr', deny: false, d: allowedInivteUsers };
			}
		}

		editSettings({
			...(Object.keys(settingsToUpdate).length > 0 && { prefs: settingsToUpdate }),
			...((newFreeBusy || newInviteRight) && {
				permissions: {
					...(newFreeBusy && {
						freeBusy: { current: freeBusy, new: newFreeBusy }
					}),
					...(newInviteRight && {
						inviteRight: { current: invite, new: newInviteRight }
					})
				}
			})
		}).then((res) => {
			if (res.type.includes('fulfilled')) {
				createSnackbar({
					key: `new`,
					replace: true,
					type: 'info',
					label: t('label.edits_saved', 'Edits saved correctly'),
					autoHideTimeout: 3000,
					hideButton: true
				});
				if (currentFreeBusy !== activeFreeBusyOptn) {
					setCurrentFreeBusy(activeFreeBusyOptn);
				}
				if (currentInvite !== activeInviteOptn) {
					setCurrentInvite(activeInviteOptn);
				}
			} else {
				createSnackbar({
					key: `new`,
					replace: true,
					type: 'error',
					label: t('label.error_try_again', 'Something went wrong, please try again'),
					autoHideTimeout: 3000,
					hideButton: true
				});
			}
		});
	}, [
		settingsToUpdate,
		currentFreeBusy,
		activeFreeBusyOptn,
		currentInvite,
		activeInviteOptn,
		freeBusy,
		invite,
		isEmailNotValid,
		allowedFBUsers,
		allowedInivteUsers,
		createSnackbar,
		t
	]);

	const calculateRegularSchedule = (data) => {
		data.start
			? updateSettings({
					target: { name: 'zimbraPrefCalendarDayHourEnd', value: `${data.hour}${data.minute}` }
			  })
			: updateSettings({
					target: { name: 'zimbraPrefCalendarDayHourStart', value: `${data.hour}${data.minute}` }
			  });

		data.start
			? setWorkingSchedule(
					workingSchedule.map((schedule) => ({
						...schedule,
						end: `${data.hour}${data.minute}`
					}))
			  )
			: setWorkingSchedule(
					workingSchedule.map((schedule) => ({
						...schedule,
						start: `${data.hour}${data.minute}`
					}))
			  );
	};

	const disabled = useMemo(
		() =>
			Object.keys(settingsToUpdate).length < 1 &&
			currentFreeBusy === activeFreeBusyOptn &&
			currentInvite === activeInviteOptn &&
			isContactChanged,
		[
			settingsToUpdate,
			currentFreeBusy,
			activeFreeBusyOptn,
			currentInvite,
			activeInviteOptn,
			isContactChanged
		]
	);

	return loading ? (
		<Container
			orientation="horizontal"
			mainAlignment="flex-start"
			width="fill"
			crossAlignment="flex-start"
		>
			<Shimmer.FormSection>
				<Shimmer.FormSubSection />
			</Shimmer.FormSection>
		</Container>
	) : (
		<Container
			orientation="vertical"
			mainAlignment="space-around"
			background="gray5"
			style={{ overflowY: 'auto' }}
		>
			<Row orientation="horizontal" width="100%">
				<Row
					padding={{ all: 'small' }}
					mainAlignment="flex-start"
					width="50%"
					crossAlignment="flex-start"
				>
					<Text size="large" weight="regular">
						{t('label.calendar_setting', 'Calendar Settings')}
					</Text>
				</Row>
				<Row
					padding={{ all: 'small' }}
					width="50%"
					mainAlignment="flex-end"
					crossAlignment="flex-end"
				>
					<Padding right="small">
						<Button
							label={t('label.discard_changes', 'DISCARD CHANGES')}
							onClick={onClose}
							color="secondary"
							disabled={disabled}
						/>
					</Padding>
					<Button
						label={t('label.save', 'Save')}
						color="primary"
						onClick={saveChanges}
						disabled={disabled}
					/>
				</Row>
			</Row>
			<Divider />
			<Container
				orientation="vertical"
				mainAlignment="baseline"
				crossAlignment="baseline"
				background="gray5"
				style={{ overflowY: 'auto' }}
			>
				<FormSection width="50%" minWidth="calc(min(100%, 512px))">
					<FormSubSection label={t('label.general', 'General')}>
						<GeneralSettingView
							t={t}
							settings={settings}
							settingsObj={settingsObj}
							updateSettings={updateSettings}
							isEmailNotValid={isEmailNotValid}
							setisEmailNotValid={setisEmailNotValid}
						/>
					</FormSubSection>
					<FormSubSection label={t('label.work_week', 'Work week')}>
						<WorkWeekSettingsView
							settingsObj={settingsObj}
							t={t}
							workingSchedule={workingSchedule}
							isRegular={isRegular}
							handelDaysClicked={handelDaysClicked}
							setIsRegular={setIsRegular}
							calculateRegularSchedule={calculateRegularSchedule}
							toggleModal={toggleModal}
						/>
					</FormSubSection>
					<FormSubSection label={t('label.create_appt_settings', 'Creating Appointments')}>
						<CreateAppSettings
							t={t}
							settings={settings}
							settingsObj={settingsObj}
							updateSettings={updateSettings}
						/>
					</FormSubSection>

					<FormSubSection label={t('label.apple_ical', 'Apple iCal')}>
						<AppleICalSettings
							t={t}
							settings={settings}
							settingsObj={settingsObj}
							updateSettings={updateSettings}
						/>
					</FormSubSection>

					<FormSubSection label={t('label.permissions', 'Permissions')}>
						<PermissionSettings
							t={t}
							activeFreeBusyOptn={activeFreeBusyOptn}
							activeInviteOptn={activeInviteOptn}
							handleInviteRightChange={handleInviteRightChange}
							handlePermissionChange={handlePermissionChange}
							setAllowedFBUsers={setAllowedFBUsers}
							setAllowedInivteUsers={setAllowedInivteUsers}
							settingsObj={settingsObj}
							updateSettings={updateSettings}
							defaultSelectedFreeBusyContacts={defaultSelectedFreeBusyContacts}
							defaultSelectedInviteContacts={defaultSelectedInviteContacts}
						/>
					</FormSubSection>
				</FormSection>
			</Container>
			<CustomScheduleModal
				open={open}
				toggleModal={toggleModal}
				t={t}
				workingSchedule={workingSchedule}
				onFromChange={onFromChange}
				saveChanges={saveChanges}
				handelDaysClicked={handelDaysClicked}
				settingsToUpdate={settingsToUpdate}
				disabled={!Object.keys(settingsToUpdate).includes('zimbraPrefCalendarWorkingHours')}
			/>
		</Container>
	);
}
