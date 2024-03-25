/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { faker } from '@faker-js/faker';
import { Folder } from '@zextras/carbonio-shell-ui';
import { isNil, reduce, values } from 'lodash';

import { Editor, IdentityItem } from '../../../types/editor';
import { AppointmentsSlice, EditorSlice, InvitesSlice } from '../../../types/store/store';
import cals from '../calendar';
import editors from '../editor';
import utils from '../utils';

type CalendarSliceItem = {
	length?: number;
	supportNesting?: boolean;
	folders?: Array<Folder>;
};

type EditorSliceItem = {
	editor?: Editor;
	calendar?: any;
	organizer?: IdentityItem;
};

type Reducers = {
	appointments?: Partial<AppointmentsSlice>;
	invites?: Partial<InvitesSlice>;
	editor?: Partial<EditorSlice>;
};

const getCalendarSliceItem = (
	{
		length = utils.getRandomInRange(),
		supportNesting = false,
		folders
	}: CalendarSliceItem = {} as CalendarSliceItem
): any =>
	reduce(
		folders ?? Array.from({ length }),
		(acc, v) => {
			const hasItems = supportNesting ? faker.datatype.boolean() : undefined;
			const itemNumbers = hasItems ? utils.getRandomInRange() : 0;
			const item = cals.getCalendar(v);

			return isNil(hasItems)
				? {
						...acc,
						[item.id]: item
					}
				: {
						...acc,
						[item.id]: {
							...item,
							items: hasItems ? values(getCalendarSliceItem({ length: itemNumbers })) : []
						}
					};
		},
		{ 10: cals.defaultCalendar }
	);

const getEditorSliceItem = (
	{
		editor,
		calendar = cals.defaultCalendar,
		organizer = utils.getRandomOrganizer()
	} = {} as EditorSliceItem
): Record<string, Editor> => {
	const id = editor?.id ?? utils.getRandomEditorId();
	const newEditor = editors.getEditor({ editor: { id }, folders: calendar, organizer });
	return {
		[newEditor.id]: {
			...newEditor,
			...(editor ?? {})
		}
	};
};

const mockReduxStore = (reducers: Reducers = {}): any => {
	const { editor = {}, appointments = {}, invites = {} } = reducers;
	return {
		editor: {
			editors: {},
			status: 'idle',
			...editor
		},
		appointments: {
			status: 'init',
			appointments: {},
			...appointments
		},
		invites: {
			status: 'idle',
			invites: {},
			...invites
		}
	};
};

export default { mockReduxStore, getEditorSliceItem, getCalendarSliceItem };
