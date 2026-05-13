/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { TextProps } from '@zextras/carbonio-design-system';
import { t } from '@zextras/carbonio-shell-ui';
import type { DataSourceType, Folder } from '@zextras/carbonio-ui-commons';
import {
	ROOT_NAME,
	FOLDERS,
	getFoldersMap,
	getRoot,
	getUpdateFolder,
	hasId
} from '@zextras/carbonio-ui-commons';
import { find, forEach, isNil, map, reduce, some } from 'lodash';
import moment from 'moment';

import { FOLDER_OPERATIONS } from '../constants/api';
import { SIDEBAR_ITEMS } from '../constants/sidebar';
import { folderAction } from '../store/actions/calendar-actions';
import { getMiniCal } from '../store/actions/get-mini-cal';
import { searchAppointments } from '../store/actions/search-appointments';
import { AppDispatch } from '../store/redux';
import { SidebarFolder } from '../types/accordions';
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
	return root?.id === FOLDERS.USER_ROOT;
};

export const isExternalSyncFolder = (item: { f?: string; url?: string }): boolean =>
	/y/.test(item.f ?? '') || !!item.url;

/**
 * A folder returned in GetFolderResponse that is the root of a DataSource.
 * Regular folders and CalDAV sub-folders will have dsId/dsType as undefined.
 */
export interface FolderDataSourceInfo {
	/** ID of the DataSource this folder is the root of. Absent on non-datasource folders. */
	dsId?: string;
	/** Type of the DataSource. Always present when dsId is present. */
	dsType?: DataSourceType;
}

/** Type guard - narrows to a datasource root folder */
export function isDataSourceRootFolder(
	folder: FolderDataSourceInfo
): folder is FolderDataSourceInfo & { dsId: string; dsType: DataSourceType } {
	return folder.dsId !== undefined && folder.dsType !== undefined;
}

/** Type guard - checks specifically for CalDAV */
export function isCaldavRootFolder(folder: FolderDataSourceInfo): boolean {
	return isDataSourceRootFolder(folder) && folder.dsType === 'caldav';
}

/**
 * Check if a calendar is a child of a CalDAV datasource root folder.
 * CalDAV calendars live under a parent folder that has dsType === 'caldav',
 * but the children themselves don't have dsId/dsType properties.
 */
export const isCaldavChild = (
	folder: FolderDataSourceInfo & { parent?: string; l?: string }
): boolean => {
	const foldersMap = getFoldersMap();
	// Try to get parent by parent property first, then by l property (parent folder id)
	const parentId = folder.parent || folder.l;
	if (!parentId) return false;
	const parentFolder = foldersMap[parentId];
	return isCaldavRootFolder(parentFolder ?? {});
};

/**
 * Check if a folder is an external sync folder (ICS or CalDAV).
 * External sync folders should use "owner perspective" for attendee visibility.
 */
export const isIcsOrCaldavExternalFolder = (
	item: FolderDataSourceInfo & { f?: string; url?: string; parent?: string; l?: string }
): boolean => isExternalSyncFolder(item) || isCaldavRootFolder(item) || isCaldavChild(item);

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
	text: string;
} => {
	const { start, end, alarmData } = reminder;
	const difference = moment(end).diff(moment(start), 'seconds');
	if (start.valueOf() < currentTime && end.valueOf() > currentTime) {
		return {
			color: 'info',
			text: t('label.ongoing', 'Ongoing')
		};
	}
	if (start.valueOf() === currentTime) {
		return {
			color: 'info',
			text: t('label.now', 'Now')
		};
	}
	if (start.valueOf() < currentTime) {
		return {
			color: 'error',
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
				text: t('label.ongoing', 'Ongoing')
			};
		}
		if (alarmData[0].alarmInstStart < currentTime) {
			return {
				color: 'error',
				text: moment(alarmData[0].alarmInstStart).fromNow()
			};
		}
	}
	return {
		color: 'info',
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
	const foldersToToggleIds = checkAllChildren([folder], checked);

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

export const getFolderIcon = ({
	item,
	checked
}: {
	item: SidebarFolder;
	checked: boolean;
}): string => {
	if (item.id === FOLDERS.USER_ROOT || (item.isLink && item.oname === ROOT_NAME) || item.noIcon)
		return '';
	if (hasId(item, FOLDERS.TRASH)) return checked ? 'Trash2' : 'Trash2Outline';
	if (hasId(item, SIDEBAR_ITEMS.ALL_CALENDAR)) return checked ? 'Calendar2' : 'CalendarOutline';
	if (item.isLink || isLinkChild(item)) return checked ? 'SharedCalendar' : 'SharedCalendarOutline';
	if (isCaldavRootFolder({ dsId: item.dsId, dsType: item.dsType })) {
		return checked ? 'GroupCalendar' : 'GroupCalendarOutline';
	}
	return checked ? 'Calendar2' : 'CalendarOutline';
};

export const replaceLinkToAnchor = (content: string): string => {
	if (content === '' || content === undefined) {
		return '';
	}

	return content.replace(
		/(?:https?:\/\/|www\.)+(?![^\s]*?")([\w.,@?!^=%&amp;:()/~+#-]*[\w@?!^=%&amp;()/~+#-])?/gi,
		(url) => {
			const wrap = document.createElement('div');
			const anchor = document.createElement('a');
			let href = url.replace(/&amp;/g, '&');
			if (!url.startsWith('http') && !url.startsWith('https')) {
				href = `http://${url}`;
			}
			anchor.href = href.replace(/&#64;/g, '@').replace(/&#61;/g, '=');
			anchor.target = '_blank';
			anchor.innerHTML = url;

			wrap.appendChild(anchor);
			return wrap.innerHTML.trim();
		}
	);
};
