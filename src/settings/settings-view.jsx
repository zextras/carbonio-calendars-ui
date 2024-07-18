/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useState, useEffect, useMemo, useCallback } from 'react';

import {
	Container,
	FormSection,
	FormSubSection,
	Shimmer,
	useSnackbar
} from '@zextras/carbonio-design-system';
import { editSettings, SettingsHeader, t } from '@zextras/carbonio-shell-ui';
import { map, filter, isEqual, uniqBy } from 'lodash';

import AppleICalSettings from './apple-ical-settings';
import { differenceObject, validEmail } from './components/utils';
import CreateAppSettings from './creating-app-settings-view';
import CustomScheduleModal from './custom-schedule-modal';
import GeneralSettingView from './general-settings-view';
import PermissionSettings from './permissions-settings-view';
import {
	creatingAppointmentsSubSection,
	generalSubSection,
	iCalSubSection,
	permissionsSubSection,
	workWeekSubSection
} from './sub-sections';
import WorkWeekSettingsView from './work-week-settings-view';
import { useUpdateView } from '../carbonio-ui-commons/hooks/use-update-view';
import { usePrefs } from '../carbonio-ui-commons/utils/use-prefs';
import { getRightsRequest } from '../soap/get-rights-request';

export default function CalendarSettingsView() {
	const settings = usePrefs();
	const [settingsObj, setSettingsObj] = useState({ ...settings });
	const [updatedSettings, setUpdatedSettings] = useState({});
	const [notFirstLoad, setNotFirstLoad] = useState(false);
	const [isEmailNotValid, setisEmailNotValid] = useState(false);
	const [userRights, setUserRights] = useState({});
	const [activeFreeBusyOptn, setActiveFreeBusyOptn] = useState(null);
	const [activeInviteOptn, setActiveInviteOptn] = useState(null);
	const [currentFreeBusy, setCurrentFreeBusy] = useState(null);
	const [currentInvite, setCurrentInvite] = useState(null);
	const [allowedFBUsers, setAllowedFBUsers] = useState([]);
	const [allowedInivteUsers, setAllowedInivteUsers] = useState([]);
	const createSnackbar = useSnackbar();
	useUpdateView();

	const getUserRights = async () => {
		const response = await getRightsRequest();
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
		map(settings?.zimbraPrefCalendarWorkingHours?.split(','), (schedule) => ({
			day: schedule.split(':')[0],
			working: schedule.split(':')[1] !== 'N',
			start: schedule.split(':')[2],
			end: schedule.split(':')[3]
		}))
	);

	function getRegularHourEnable() {
		const uniqStart = uniqBy(workingSchedule, 'start');
		const uniqEnd = uniqBy(workingSchedule, 'end');
		if (uniqStart.length === 1 && uniqEnd.length === 1) {
			return true;
		}
		return false;
	}
	const [isRegular, setIsRegular] = useState(getRegularHourEnable);
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
					type: 'success',
					label: t('label.settings_saved', 'Settings saved'),
					autoHideTimeout: 3000,
					hideButton: true
				});
				if (currentFreeBusy !== activeFreeBusyOptn) {
					setCurrentFreeBusy(activeFreeBusyOptn);
				}
				if (currentInvite !== activeInviteOptn) {
					setCurrentInvite(activeInviteOptn);
				}
				if (settingsToUpdate.zimbraPrefCalendarWorkingHours) {
					setOpen(false);
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
		createSnackbar
	]);

	const calculateRegularSchedule = (data) => {
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

	const title = useMemo(() => t('label.calendar_setting', 'Calendar Settings'), []);
	const sectionTitleGeneral = useMemo(() => generalSubSection(), []);
	const sectionTitleWorkWeek = useMemo(() => workWeekSubSection(), []);
	const sectionTitleAppointments = useMemo(() => creatingAppointmentsSubSection(), []);
	const sectionTitleAppleCal = useMemo(() => iCalSubSection(), []);
	const sectionTitlePermissions = useMemo(() => permissionsSubSection(), []);

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
		<>
			<SettingsHeader title={title} onSave={saveChanges} onCancel={onClose} isDirty={!disabled} />
			<Container
				orientation="vertical"
				mainAlignment="baseline"
				crossAlignment="baseline"
				background={'gray5'}
				style={{ overflowY: 'auto' }}
			>
				<FormSection width="50%" minWidth="calc(min(100%, 32rem))">
					<FormSubSection id={sectionTitleGeneral.id} label={sectionTitleGeneral.label}>
						<GeneralSettingView
							settings={settings}
							settingsObj={settingsObj}
							updateSettings={updateSettings}
							isEmailNotValid={isEmailNotValid}
							setisEmailNotValid={setisEmailNotValid}
						/>
					</FormSubSection>
					<FormSubSection id={sectionTitleWorkWeek.id} label={sectionTitleWorkWeek.label}>
						<WorkWeekSettingsView
							settingsObj={settingsObj}
							workingSchedule={workingSchedule}
							isRegular={isRegular}
							handelDaysClicked={handelDaysClicked}
							setIsRegular={setIsRegular}
							calculateRegularSchedule={calculateRegularSchedule}
							toggleModal={toggleModal}
						/>
					</FormSubSection>
					<FormSubSection id={sectionTitleAppointments.id} label={sectionTitleAppointments.label}>
						<CreateAppSettings
							settings={settings}
							settingsObj={settingsObj}
							updateSettings={updateSettings}
						/>
					</FormSubSection>
					<FormSubSection id={sectionTitleAppleCal.id} label={sectionTitleAppleCal.label}>
						<AppleICalSettings
							settings={settings}
							settingsObj={settingsObj}
							updateSettings={updateSettings}
						/>
					</FormSubSection>
					<FormSubSection label={sectionTitlePermissions.label} id={sectionTitlePermissions.id}>
						<PermissionSettings
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
				workingSchedule={workingSchedule}
				onFromChange={onFromChange}
				saveChanges={saveChanges}
				handelDaysClicked={handelDaysClicked}
				settingsToUpdate={settingsToUpdate}
				disabled={!Object.keys(settingsToUpdate).includes('zimbraPrefCalendarWorkingHours')}
			/>
		</>
	);
}
