/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';

import { Container, Shimmer, useSnackbar } from '@zextras/carbonio-design-system';
import { AccountSettingsPrefs, editSettings, SettingsHeader, t } from '@zextras/carbonio-shell-ui';
import { ContactInputProps, usePrefs, useUpdateView } from '@zextras/carbonio-ui-commons';
import { map, filter, isEqual, uniqBy } from 'lodash';

import AppleICalSettings from './apple-ical-settings';
import { differenceObject, isValidEmail } from './components/utils';
import CreateAppSettings from './creating-app-settings-view';
import CustomScheduleModal from './custom-schedule-modal';
import GeneralSettingView from './general-settings-view';
import PermissionSettings from './permissions-settings-view';
import WorkWeekSettingsView from './work-week-settings-view';
import {
	GRANTEE_TYPES,
	PermissionsRightsOptions,
	USERS_PERMISSIONS_RIGHTS
} from '../constants/api';
import { getRightsRequest } from '../soap/get-rights-request';
import { WorkWeekDay } from '../utils/work-week';

type GranteeType = 'usr' | 'grp' | 'egp' | 'all' | 'dom' | 'edom' | 'gst' | 'key' | 'pub' | 'email';
type Right = 'invite' | 'loginAs' | 'sendAs' | 'sendOnBehalfOf' | 'viewFreeBusy';

type AccountACEInfo = {
	zid?: string;
	gt: GranteeType;
	right: Right;
	d: string;
	key?: string;
	pw?: string;
	deny?: boolean;
	chkgt?: boolean;
};

export type GrantRightsResponse = {
	ace?: AccountACEInfo[];
};

export default function CalendarSettingsView(): React.JSX.Element {
	const settings = usePrefs();
	const [settingsObj, setSettingsObj] = useState({ ...settings });
	const [updatedSettings, setUpdatedSettings] = useState<Partial<AccountSettingsPrefs>>({});
	const [notFirstLoad, setNotFirstLoad] = useState(false);
	const [isEmailNotValid, setisEmailNotValid] = useState(false);
	const [userRights, setUserRights] = useState<GrantRightsResponse>({});
	const [activeFreeBusyOptn, setActiveFreeBusyOptn] = useState<PermissionsRightsOptions>(null);
	const [activeInviteOptn, setActiveInviteOptn] = useState<PermissionsRightsOptions>(null);
	const [currentFreeBusy, setCurrentFreeBusy] = useState<PermissionsRightsOptions>(null);
	const [currentInvite, setCurrentInvite] = useState<PermissionsRightsOptions>(null);
	const defaultSelectedFreeBusyContacts = useRef<ContactInputProps['defaultValue']>([]);
	const defaultSelectedInviteContacts = useRef<ContactInputProps['defaultValue']>([]);

	const [allowedFBUsers, setAllowedFBUsers] = useState<ContactInputProps['defaultValue']>([]);
	const [allowedInivteUsers, setAllowedInivteUsers] = useState<ContactInputProps['defaultValue']>(
		[]
	);
	const createSnackbar = useSnackbar();
	useUpdateView();

	const getUserRights = async (): Promise<void> => {
		const response: GrantRightsResponse = await getRightsRequest();
		setUserRights(response);
	};
	useEffect(() => {
		getUserRights();
	}, []);

	const [freeBusy, invite] = useMemo(
		() => [
			filter(userRights?.ace, (r) => r.right === 'viewFreeBusy'),
			filter(userRights?.ace, (r) => r.right === 'invite')
		],
		[userRights]
	);

	useEffect(() => {
		if (freeBusy.length > 0 && defaultSelectedFreeBusyContacts?.current) {
			const defaultFreeBusyValue =
				filter(freeBusy, (fb) => fb.gt === GRANTEE_TYPES.USR).length > 0
					? map(
							filter(freeBusy, (fb) => fb.gt === GRANTEE_TYPES.USR),
							(r) =>
								({
									id: r.d,
									email: r.d,
									type: 'CONTACT',
									value: { id: r.d, label: r.d, type: 'CONTACT', email: r.d },
									label: r.d
								}) as const
						)
					: [];
			defaultSelectedFreeBusyContacts.current = defaultFreeBusyValue;
			setAllowedFBUsers(defaultFreeBusyValue);
		}
		if (invite.length > 0 && defaultSelectedInviteContacts?.current) {
			const defaultInviteValue =
				filter(invite, (fb) => fb.gt === GRANTEE_TYPES.USR).length > 0
					? map(
							filter(invite, (fb) => fb.gt === GRANTEE_TYPES.USR),
							(r) =>
								({
									id: r.d,
									email: r.d,
									type: 'CONTACT',
									value: { id: r.d, label: r.d, type: 'CONTACT', email: r.d },
									label: r.d
								}) as const
						)
					: [];
			defaultSelectedInviteContacts.current = defaultInviteValue;
			setAllowedInivteUsers(defaultInviteValue);
		}
		if (freeBusy.length === 1 && freeBusy[0].gt === GRANTEE_TYPES.PUB) {
			setActiveFreeBusyOptn(USERS_PERMISSIONS_RIGHTS.ALLOW_INTERNAL_EXTERNAL);
			setCurrentFreeBusy(USERS_PERMISSIONS_RIGHTS.ALLOW_INTERNAL_EXTERNAL);
		}
		if (freeBusy.length === 1 && freeBusy[0].gt === GRANTEE_TYPES.ALL && !freeBusy[0].deny) {
			setActiveFreeBusyOptn(USERS_PERMISSIONS_RIGHTS.ALLOW_INTERNAL);
			setCurrentFreeBusy(USERS_PERMISSIONS_RIGHTS.ALLOW_INTERNAL);
		}
		if (
			freeBusy.length === 1 &&
			freeBusy[0].gt === GRANTEE_TYPES.DOM &&
			freeBusy[0].d === window.location.hostname
		) {
			setActiveFreeBusyOptn(USERS_PERMISSIONS_RIGHTS.ALLOW_DOMAIN_USERS);
			setCurrentFreeBusy(USERS_PERMISSIONS_RIGHTS.ALLOW_DOMAIN_USERS);
		}
		if (freeBusy.length === 1 && freeBusy[0].gt === GRANTEE_TYPES.ALL && freeBusy[0].deny) {
			setActiveFreeBusyOptn(USERS_PERMISSIONS_RIGHTS.ALLOW_NONE);
			setCurrentFreeBusy(USERS_PERMISSIONS_RIGHTS.ALLOW_NONE);
		}
		if (freeBusy.length >= 1 && freeBusy[0].gt === GRANTEE_TYPES.USR) {
			setActiveFreeBusyOptn(USERS_PERMISSIONS_RIGHTS.ALLOW_FOLLOWING);
			setCurrentFreeBusy(USERS_PERMISSIONS_RIGHTS.ALLOW_FOLLOWING);
		}
		if (invite.length === 1 && invite[0].gt === GRANTEE_TYPES.PUB) {
			setActiveInviteOptn(USERS_PERMISSIONS_RIGHTS.ALLOW_INTERNAL_EXTERNAL);
			setCurrentInvite(USERS_PERMISSIONS_RIGHTS.ALLOW_INTERNAL_EXTERNAL);
		}
		if (invite.length === 1 && invite[0].gt === GRANTEE_TYPES.ALL && !invite[0].deny) {
			setActiveInviteOptn(USERS_PERMISSIONS_RIGHTS.ALLOW_INTERNAL);
			setCurrentInvite(USERS_PERMISSIONS_RIGHTS.ALLOW_INTERNAL);
		}

		if (invite.length === 1 && invite[0].gt === GRANTEE_TYPES.ALL && invite[0].deny) {
			setActiveInviteOptn(USERS_PERMISSIONS_RIGHTS.ALLOW_NONE);
			setCurrentInvite(USERS_PERMISSIONS_RIGHTS.ALLOW_NONE);
		}
		if (invite.length >= 1 && invite[0].gt === GRANTEE_TYPES.USR) {
			setActiveInviteOptn(USERS_PERMISSIONS_RIGHTS.ALLOW_FOLLOWING);
			setCurrentInvite(USERS_PERMISSIONS_RIGHTS.ALLOW_FOLLOWING);
		}
		return () => {
			defaultSelectedFreeBusyContacts.current = [];
			defaultSelectedInviteContacts.current = [];
		};
	}, [freeBusy, invite]);

	const handlePermissionChange = useCallback(
		(permission: PermissionsRightsOptions) => () => {
			setActiveFreeBusyOptn(permission);
		},
		[]
	);
	const handleInviteRightChange = useCallback(
		(permission: PermissionsRightsOptions) => () => {
			setActiveInviteOptn(permission);
		},
		[]
	);

	const isContactChanged = useMemo(
		() =>
			isEqual(defaultSelectedInviteContacts.current, allowedInivteUsers) &&
			isEqual(defaultSelectedFreeBusyContacts.current, allowedFBUsers),
		[
			defaultSelectedInviteContacts,
			allowedInivteUsers,
			defaultSelectedFreeBusyContacts,
			allowedFBUsers
		]
	);

	const [loading, setLoading] = useState(false);
	function callLoader(): void {
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
		(e: {
			target: {
				name: string;
				value: string;
			};
		}) => {
			setSettingsObj({ ...settingsObj, [e.target.name]: e.target.value });
			setUpdatedSettings({ ...updatedSettings, [e.target.name]: e.target.value });
		},
		[settingsObj, updatedSettings]
	);

	const [workingSchedule, setWorkingSchedule] = useState<Array<WorkWeekDay>>(
		map(settings?.zimbraPrefCalendarWorkingHours?.split(','), (schedule) => ({
			day: schedule.split(':')[0],
			working: schedule.split(':')[1] !== 'N',
			start: schedule.split(':')[2],
			end: schedule.split(':')[3]
		}))
	);

	function getRegularHourEnable(): boolean {
		const uniqStart = uniqBy(workingSchedule, 'start');
		const uniqEnd = uniqBy(workingSchedule, 'end');
		return uniqStart.length === 1 && uniqEnd.length === 1;
	}
	const [isRegular, setIsRegular] = useState(getRegularHourEnable);
	const [open, setOpen] = useState(false);
	const toggleModal = useCallback(() => setOpen(!open), [open]);

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
		(day: string) => () =>
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
		() =>
			differenceObject<Partial<AccountSettingsPrefs>, AccountSettingsPrefs>(
				updatedSettings,
				settings
			) as unknown as AccountSettingsPrefs,
		[updatedSettings, settings]
	);

	const saveChanges = useCallback(() => {
		const isString = (setting: unknown): setting is string => typeof setting === 'string';
		if (
			isString(settingsToUpdate.zimbraPrefCalendarForwardInvitesTo) &&
			!isValidEmail(settingsToUpdate.zimbraPrefCalendarForwardInvitesTo)
		) {
			setisEmailNotValid(!isEmailNotValid);
			return;
		}
		let newFreeBusy = null;
		let newInviteRight = null;

		if (
			currentFreeBusy !== activeFreeBusyOptn ||
			(activeFreeBusyOptn === USERS_PERMISSIONS_RIGHTS.ALLOW_FOLLOWING &&
				!isEqual(defaultSelectedFreeBusyContacts.current, allowedFBUsers))
		) {
			switch (activeFreeBusyOptn) {
				case USERS_PERMISSIONS_RIGHTS.ALLOW_INTERNAL_EXTERNAL:
					newFreeBusy = { gt: GRANTEE_TYPES.PUB, deny: false };
					break;
				case USERS_PERMISSIONS_RIGHTS.ALLOW_INTERNAL:
					newFreeBusy = { gt: GRANTEE_TYPES.ALL, deny: false };
					break;
				case USERS_PERMISSIONS_RIGHTS.ALLOW_DOMAIN_USERS:
					newFreeBusy = { gt: GRANTEE_TYPES.DOM, deny: false, d: window.location.hostname };
					break;
				case USERS_PERMISSIONS_RIGHTS.ALLOW_NONE:
					newFreeBusy = { gt: GRANTEE_TYPES.ALL, deny: true };
					break;
				default:
					newFreeBusy = {
						gt: GRANTEE_TYPES.USR,
						deny: false,
						d: map(allowedFBUsers, (u) => ({ email: u.value.email }))
					};
			}
		}
		if (currentInvite !== activeInviteOptn) {
			switch (activeInviteOptn) {
				case USERS_PERMISSIONS_RIGHTS.ALLOW_INTERNAL_EXTERNAL:
					newInviteRight = { gt: GRANTEE_TYPES.PUB, deny: false };
					break;
				case USERS_PERMISSIONS_RIGHTS.ALLOW_INTERNAL:
					newInviteRight = { gt: GRANTEE_TYPES.ALL, deny: false };
					break;
				case USERS_PERMISSIONS_RIGHTS.ALLOW_NONE:
					newInviteRight = { gt: GRANTEE_TYPES.ALL, deny: true };
					break;
				default:
					newInviteRight = {
						gt: GRANTEE_TYPES.USR,
						deny: false,
						d: map(allowedInivteUsers, (u) => ({ email: u.value.email }))
					};
			}
		}

		const permissionsFreeBusy = newFreeBusy
			? { freeBusy: { current: freeBusy, new: newFreeBusy } }
			: {};
		const permissionsInviteRight = newInviteRight
			? {
					inviteRight: { current: invite, new: newInviteRight }
				}
			: {};
		const permissions =
			newFreeBusy || newInviteRight ? { ...permissionsFreeBusy, ...permissionsInviteRight } : {};
		const newValue = {
			...(Object.keys(settingsToUpdate).length > 0 && { prefs: settingsToUpdate }),
			permissions
		};

		// todo: it will be fixed in the next PR
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		editSettings(newValue).then((res) => {
			if (res.type.includes('fulfilled')) {
				createSnackbar({
					key: `new`,
					replace: true,
					severity: 'success',
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
					severity: 'error',
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

	const calculateRegularSchedule = (data: {
		start: string;
		hour: string;
		minute: string;
		day: string;
	}): void => {
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

	return loading ? (
		<Container
			orientation="horizontal"
			mainAlignment="flex-start"
			width="fill"
			crossAlignment="flex-start"
		>
			<Shimmer.FormSection variant={'dark'}>
				<Shimmer.FormSubSection variant={'dark'} />
			</Shimmer.FormSection>
		</Container>
	) : (
		<>
			<SettingsHeader
				title={title}
				/* TODO: settings need to be updated as they are using deprecated API, saveChanges can't be typed properly */
				/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */
				// @ts-ignore
				onSave={saveChanges}
				onCancel={onClose}
				isDirty={!disabled}
			/>
			<Container
				orientation="vertical"
				mainAlignment="flex-start"
				crossAlignment="baseline"
				background={'gray5'}
				gap="1rem"
				padding={{ all: 'medium' }}
				style={{ overflowY: 'auto' }}
			>
				<GeneralSettingView
					settingsObj={settingsObj}
					updateSettings={updateSettings}
					isEmailNotValid={isEmailNotValid}
					setisEmailNotValid={setisEmailNotValid}
				/>
				<WorkWeekSettingsView
					workingSchedule={workingSchedule}
					isRegular={isRegular}
					handelDaysClicked={handelDaysClicked}
					setIsRegular={setIsRegular}
					calculateRegularSchedule={calculateRegularSchedule}
					toggleModal={toggleModal}
				/>
				<CreateAppSettings settingsObj={settingsObj} updateSettings={updateSettings} />
				<AppleICalSettings settingsObj={settingsObj} updateSettings={updateSettings} />
				<PermissionSettings
					activeFreeBusyOptn={activeFreeBusyOptn}
					activeInviteOptn={activeInviteOptn}
					handleInviteRightChange={handleInviteRightChange}
					handlePermissionChange={handlePermissionChange}
					setAllowedFBUsers={setAllowedFBUsers}
					setAllowedInivteUsers={setAllowedInivteUsers}
					settingsObj={settingsObj}
					updateSettings={updateSettings}
					allowedFBUsers={allowedFBUsers}
					allowedInivteUsers={allowedInivteUsers}
				/>
			</Container>
			<CustomScheduleModal
				open={open}
				setWorkingSchedule={setWorkingSchedule}
				toggleModal={toggleModal}
				workingSchedule={workingSchedule}
				saveChanges={saveChanges}
				handelDaysClicked={handelDaysClicked}
				disabled={!Object.keys(settingsToUpdate).includes('zimbraPrefCalendarWorkingHours')}
			/>
		</>
	);
}
