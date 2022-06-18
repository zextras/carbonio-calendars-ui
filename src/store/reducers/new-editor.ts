/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { find } from 'lodash';
import moment from 'moment';
import { IdentityItem } from '../../types/editor';
import { EditorSlice } from '../../types/store/store';

type NewEditor = {
	payload: any;
};

type PrefilledEditor = {
	payload: {
		id: string | undefined;
		identities: Array<IdentityItem>;
		event: any;
	};
};

const defaultEditorValues = (id: string | undefined, identities: Array<IdentityItem>): any => {
	const defaultOrganizer = find(identities, ['identityName', 'DEFAULT']);

	return {
		organizer: defaultOrganizer,
		title: '',
		location: '',
		room: undefined,
		attendees: [],
		optionalAttendees: [],
		allDay: false,
		freeBusy: 'B',
		class: 'PUB',
		start: moment().valueOf(),
		end: moment().valueOf() + 3600,
		id
	};
};

export const newEditorReducer = (state: EditorSlice, { payload }: NewEditor): void => {
	if (payload) {
		state.editors[payload.id] = payload;
		if (payload.panel) {
			state.activeId = payload.id;
		}
	}
};
