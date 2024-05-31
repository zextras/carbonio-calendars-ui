/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { TextProps } from '@zextras/carbonio-design-system';
import { FOLDERS, ROOT_NAME, t } from '@zextras/carbonio-shell-ui';
import { find, forEach, isNil, map, reduce, some } from 'lodash';
import moment from 'moment';

import {
	getFoldersMap,
	getRoot,
	getUpdateFolder
} from '../carbonio-ui-commons/store/zustand/folder';
import type { Folder } from '../carbonio-ui-commons/types/folder';
import { hasId } from '../carbonio-ui-commons/worker/handle-message';
import { FOLDER_OPERATIONS } from '../constants/api';
import { CALENDARS_STANDARD_COLORS } from '../constants/calendar';
import { SIDEBAR_ITEMS } from '../constants/sidebar';
import { folderAction } from '../store/actions/calendar-actions';
import { getMiniCal } from '../store/actions/get-mini-cal';
import { searchAppointments } from '../store/actions/search-appointments';
import { AppDispatch } from '../store/redux';
import { ReminderItem } from '../types/appointment-reminder';

const FileExtensionRegex = /^.+\.([^.]+)$/;

export const isLinkChild = (item: { absFolderPath?: string }): boolean => {
	const folders = getFoldersMap();
	const parentFoldersNames = item?.absFolderPath?.split('/');
	parentFoldersNames?.pop(); // removing itself from results
	const parentFolders =
		map(parentFoldersNames, (f) => find(folders, (ff) => ff.name === f) ?? '') ?? [];
	return some(parentFolders, ['isLink', true]) ?? false;
};

export const isMainRootChild = (item: { id: string }): boolean => {
	const root = getRoot(item.id);
	return root?.id === FOLDERS.USER_ROOT ?? false;
};

export const calcColor = (label: string, theme: unknown): string => {
	let sum = 0;
	for (let i = 0; i < label?.length; i += 1) {
		sum += label.charCodeAt(i);
	}
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	return theme.avatarColors[`avatar_${(sum % 50) + 1}`];
};
type FileType = {
	filename: string;
	contentType: string;
};
export const getFileExtension = (file: FileType): string => {
	const match = FileExtensionRegex.exec(file.filename);
	if (isNil(match)) {
		switch (file.contentType) {
			case 'text/html':
				return 'html';

			case 'text/css':
				return 'css';

			case 'text/xml':
				return 'xml';

			case 'image/gif':
				return 'gif';

			case 'image/jpeg':
				return 'jpg';

			case 'application/x-javascript':
				return 'js';

			case 'application/atom+xml':
				return 'atom';

			case 'application/rss+xml':
				return 'rss';

			case 'text/mathml':
				return 'mml';

			case 'text/plain':
				return 'txt';

			case 'text/vnd.sun.jme.app-descriptor':
				return 'jad';

			case 'text/vnd.wap.wml':
				return 'wml';

			case 'text/x-component':
				return 'htc';

			case 'image/png':
				return 'png';

			case 'image/tiff':
				return 'tif,tiff';

			case 'image/vnd.wap.wbmp':
				return 'wbmp';

			case 'image/x-icon':
				return 'ico';

			case 'image/x-jng':
				return 'jng';

			case 'image/x-ms-bmp':
				return 'bmp';

			case 'image/svg+xml':
				return 'svg';

			case 'image/webp':
				return 'webp';

			case 'application/java-archive':
				return 'jar,war,ear';

			case 'application/mac-binhex':
				return 'hqx';

			case 'application/msword':
				return 'doc';

			case 'application/pdf':
				return 'pdf';

			case 'application/postscript':
				return 'ps,eps,ai';

			case 'application/rtf':
				return 'rtf';

			case 'application/vnd.ms-excel':
				return 'xls';

			case 'application/vnd.ms-powerpoint':
				return 'ppt';

			case 'application/vnd.wap.wmlc':
				return 'wmlc';

			case 'application/vnd.google-earth.kml+xml':
				return 'kml';

			case 'application/vnd.google-earth.kmz':
				return 'kmz';

			case 'application/x-z-compressed':
				return 'z';

			case 'application/x-cocoa':
				return 'cco';

			case 'application/x-java-archive-diff':
				return 'jardiff';

			case 'application/x-java-jnlp-file':
				return 'jnlp';

			case 'application/x-makeself':
				return 'run';

			case 'application/x-perl':
				return 'pl,pm';

			case 'application/x-pilot':
				return 'prc,pdb';

			case 'application/x-rar-compressed':
				return 'rar';

			case 'application/x-redhat-package-manager':
				return 'rpm';

			case 'application/x-sea':
				return 'sea';

			case 'application/x-shockwave-flash':
				return 'swf';

			case 'application/x-stuffit':
				return 'sit';

			case 'application/x-tcl':
				return 'tcl';

			case 'application/x-x-ca-cert':
				return 'der';

			case 'application/x-xpinstall':
				return 'xpi';

			case 'application/xhtml+xml':
				return 'xhtml';

			case 'application/zip':
				return 'zip';

			case 'audio/midi':
				return 'midi';

			case 'audio/mpeg':
				return 'mp';

			case 'audio/ogg':
				return 'ogg';

			case 'audio/x-realaudio':
				return 'ra';

			case 'video/gpp':
				return 'gp';

			case 'video/mpeg':
				return 'mpeg';

			case 'video/quicktime':
				return 'mov';

			case 'video/x-flv':
				return 'flv';

			case 'video/x-mng':
				return 'mng';

			case 'video/x-ms-asf':
				return 'asf';

			case 'video/x-ms-wmv':
				return 'wmv';

			case 'video/x-msvideo':
				return 'avi';

			case 'video/mp':
				return 'mp';

			default:
				return '?';
		}
	}

	return match[1];
};

export const convertToDecimal = (source: string): string => {
	let result = '';
	for (let i = 0; i < source.length; i += 1) {
		const charCode = source.charCodeAt(i);
		// Encode non-ascii or double quotes
		if (charCode > 127 || charCode === 34) {
			let temp = charCode.toString(10);
			while (temp.length < 4) {
				temp = `0${temp}`;
			}
			result += `&#${temp};`;
		} else {
			result += source.charAt(i);
		}
	}
	return result;
};

export const getTimeToDisplayData = (
	reminder: ReminderItem,
	currentTime: number
): {
	color: TextProps['color'];
	size: TextProps['size'];
	text: string;
} => {
	const { start, end, alarmData } = reminder;
	const difference = moment(end).diff(moment(start), 'seconds');
	if (start.valueOf() < currentTime && end.valueOf() > currentTime) {
		return {
			color: 'info',
			size: 'large',
			text: t('label.ongoing', 'Ongoing')
		};
	}
	if (start.valueOf() === currentTime) {
		return {
			color: 'info',
			size: 'large',
			text: t('label.now', 'Now')
		};
	}
	if (start.valueOf() < currentTime) {
		return {
			color: 'error',
			size: 'large',
			text: moment(start).from(moment())
		};
	}
	if (alarmData && alarmData?.[0] && alarmData?.[0]?.alarmInstStart) {
		if (
			alarmData[0].alarmInstStart < currentTime &&
			moment(alarmData[0].alarmInstStart).add(difference, 'seconds').valueOf() > currentTime
		) {
			return {
				color: 'info',
				size: 'large',
				text: t('label.ongoing', 'Ongoing')
			};
		}
		if (alarmData[0].alarmInstStart < currentTime) {
			return {
				color: 'error',
				size: 'large',
				text: moment(alarmData[0].alarmInstStart).fromNow()
			};
		}
	}
	return {
		color: 'info',
		size: 'large',
		text: moment(alarmData[0].alarmInstStart).fromNow()
	};
};

type GetFolderTranslatedName = {
	folderId: string;
	folderName: string;
};

export const getFolderTranslatedName = ({
	folderId,
	folderName
}: GetFolderTranslatedName): string => {
	switch (folderId) {
		case FOLDERS.USER_ROOT:
			return t(`label.root`, folderName);
		case 'all':
			return t('label.all_calendars', 'All calendars');
		case FOLDERS.CALENDAR:
			return t(`label.calendar`, folderName);
		case FOLDERS.TRASH:
			return t(`label.trash`, folderName);
		default:
			return folderName;
	}
};

export const getFolderIconColor = (f: Folder): string => {
	if (f?.color) {
		return Number(f.color) < 10
			? CALENDARS_STANDARD_COLORS[Number(f.color)].color
			: f?.rgb ?? CALENDARS_STANDARD_COLORS[0].color;
	}
	return CALENDARS_STANDARD_COLORS[0].color;
};

export type RecursiveToggleCheckProps = {
	folder: Folder;
	checked: boolean;
	start: number;
	end: number;
	dispatch: AppDispatch;
	query: string;
};

const checkAllChildren = (_folder: Array<Folder>, checked: boolean): Array<string> =>
	reduce(
		_folder,
		(acc, itemToCheck) => {
			if (itemToCheck.children.length > 0) {
				return hasId(itemToCheck, SIDEBAR_ITEMS.ALL_CALENDAR) || itemToCheck.checked !== checked
					? [...acc, ...checkAllChildren(itemToCheck.children, checked)]
					: [...acc, itemToCheck.id, ...checkAllChildren(itemToCheck.children, checked)];
			}
			return hasId(itemToCheck, SIDEBAR_ITEMS.ALL_CALENDAR) || itemToCheck.checked !== checked
				? acc
				: [...acc, itemToCheck.id];
		},
		[] as Array<string>
	);

export function recursiveToggleCheck({
	folder,
	checked,
	dispatch,
	start,
	end,
	query
}: RecursiveToggleCheckProps): void {
	const foldersToToggleIds: Array<string> = checkAllChildren([folder], checked);

	const op = checked ? FOLDER_OPERATIONS.UNCHECK : FOLDER_OPERATIONS.CHECK;
	const actions = map(foldersToToggleIds, (id) => ({
		id,
		op
	}));
	folderAction(actions).then((res) => {
		if (op === FOLDER_OPERATIONS.CHECK && !res.Fault) {
			dispatch(searchAppointments({ spanEnd: end, spanStart: start, query }));
			dispatch(getMiniCal({ start, end })).then((response) => {
				const updateFolder = getUpdateFolder();
				// todo: remove ts ignore once getMiniCal is typed
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				if (response?.payload?.Fault) {
					// todo: remove ts ignore once getMiniCal is typed
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore
					forEach(response?.payload?.Fault, ({ id }) => {
						updateFolder(id, { broken: true });
					});
				}
			});
		}
	});
}

export const getFolderIcon = ({ item, checked }: { item: Folder; checked: boolean }): string => {
	if (item.id === FOLDERS.USER_ROOT || (item.isLink && item.oname === ROOT_NAME)) return '';
	if (hasId(item, FOLDERS.TRASH)) return checked ? 'Trash2' : 'Trash2Outline';
	if (hasId(item, SIDEBAR_ITEMS.ALL_CALENDAR)) return checked ? 'Calendar2' : 'CalendarOutline';
	if (item.isLink || isLinkChild(item)) return checked ? 'SharedCalendar' : 'SharedCalendarOutline';
	return checked ? 'Calendar2' : 'CalendarOutline';
};
