/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { TextProps } from '@zextras/carbonio-design-system';
import { AccordionFolder, FOLDERS, Folder, ROOT_NAME, t } from '@zextras/carbonio-shell-ui';
import { isNil } from 'lodash';
import moment from 'moment';
import { ReminderItem } from '../types/appointment-reminder';
import { SIDEBAR_ITEMS } from '../constants/sidebar';
import { folderAction } from '../store/actions/calendar-actions';
import { getMiniCal } from '../store/actions/get-mini-cal';
import { searchAppointments } from '../store/actions/search-appointments';
import { updateCalendar } from '../store/slices/calendars-slice';
import { ZIMBRA_STANDARD_COLORS } from './zimbra-standard-colors';

const FileExtensionRegex = /^.+\.([^.]+)$/;

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

export const translatedSystemFolders = (): Array<string> => [
	t('label.root', 'Root'),
	t('label.all_calendars', 'All calendars'),
	t('label.calendar', 'Calendar'),
	t('label.trash', 'Trash')
];

type GetFolderTranslatedName = {
	folderId: string;
	folderName: string;
};

export const getFolderTranslatedName = ({
	folderId,
	folderName
}: GetFolderTranslatedName): string => {
	let translationKey;
	switch (folderId) {
		case FOLDERS.USER_ROOT:
			translationKey = 'root';
			break;
		case FOLDERS.CALENDAR:
			translationKey = 'calendar';
			break;
		case FOLDERS.TRASH:
			translationKey = 'trash';
			break;
		default:
			return folderName;
	}

	return t(`label.${translationKey}`, folderName);
};

export const getFolderIconNameForAccordionFolder = (folder: AccordionFolder): string | null => {
	const systemFolders = [
		FOLDERS.USER_ROOT,
		FOLDERS.INBOX,
		FOLDERS.TRASH,
		FOLDERS.DRAFTS,
		FOLDERS.SPAM,
		FOLDERS.SENT
	];

	if (folder.id === FOLDERS.USER_ROOT || folder.folder?.oname === ROOT_NAME) {
		return null;
	}

	if (folder.id && systemFolders.includes(folder.id)) {
		switch (folder.id) {
			case FOLDERS.INBOX:
				return 'InboxOutline';
			case FOLDERS.DRAFTS:
				return 'FileOutline';
			case FOLDERS.SENT:
				return 'PaperPlaneOutline';
			case FOLDERS.SPAM:
				return 'SlashOutline';
			case FOLDERS.TRASH:
				return 'Trash2Outline';
			default:
				return 'FolderOutline';
		}
	}
	if (
		folder.id?.charAt(folder.id.length - 2) === ':' &&
		systemFolders.includes(folder.id.slice(-1))
	) {
		switch (folder.id.slice(-1)) {
			case FOLDERS.INBOX:
				return 'InboxOutline';
			case FOLDERS.DRAFTS:
				return 'FileOutline';
			case FOLDERS.SENT:
				return 'PaperPlaneOutline';
			case FOLDERS.SPAM:
				return 'SlashOutline';
			case FOLDERS.TRASH:
				return 'Trash2Outline';
			default:
				return 'FolderOutline';
		}
	}
	return 'FolderOutline';
};

export const getFolderIconColor = (f: Folder): string => {
	if (f?.color) {
		return Number(f.color) < 10
			? ZIMBRA_STANDARD_COLORS[Number(f.color)].color
			: f?.rgb ?? ZIMBRA_STANDARD_COLORS[0].color;
	}
	return ZIMBRA_STANDARD_COLORS[0].color;
};

export type RecursiveToggleCheckProps = {
	folder: Folder;
	checked: boolean;
	end: number;
	start: number;
	dispatchGetMiniCal?: boolean;
	dispatch: any;
};

export function recursiveToggleCheck({
	folder,
	checked,
	end,
	start,
	dispatchGetMiniCal,
	dispatch
}: RecursiveToggleCheckProps): void {
	const foldersToToggleIds: Array<string> = [];
	const checkAllChildren = (itemToCheck: Folder): void => {
		if (itemToCheck.id !== 'all') {
			foldersToToggleIds.push(itemToCheck.id);
		}
		if (itemToCheck.children.length > 0) {
			itemToCheck.children.forEach((child) => {
				checkAllChildren(child);
			});
		}
	};

	// remove item 'all' from an array of strings
	checkAllChildren(folder);

	dispatch(
		folderAction({
			id: foldersToToggleIds,
			changes: { checked },
			op: checked ? '!check' : 'check'
		})
	).then((res: { meta: { arg: { op: string } } }) => {
		if (res?.meta?.arg?.op === 'check') {
			dispatch(searchAppointments({ spanEnd: end, spanStart: start }));
			dispatchGetMiniCal &&
				dispatch(getMiniCal({ start, end })).then((response: { payload: { error: any } }) => {
					if (response?.payload?.error) {
						dispatch(updateCalendar(response?.payload?.error));
					}
				});
		}
	});
}

export const getFolderIcon = ({ item, checked }: { item: Folder; checked: boolean }): string => {
	if (item.id === FOLDERS.USER_ROOT || (item.isLink && item.oname === ROOT_NAME)) return '';
	if (item.id === FOLDERS.TRASH) return checked ? 'Trash2' : 'Trash2Outline';
	if (item.id === SIDEBAR_ITEMS.ALL_CALENDAR) return checked ? 'Calendar2' : 'CalendarOutline';
	if (item.isLink) return checked ? 'SharedCalendar' : 'SharedCalendarOutline';
	return checked ? 'Calendar2' : 'CalendarOutline';
};
