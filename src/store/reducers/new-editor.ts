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
	payload: {
		id: string | undefined;
		identities: Array<IdentityItem>;
	};
};

export const newEditorReducer = (state: EditorSlice, { payload }: NewEditor): void => {
	const { id, identities } = payload;
	const defaultOrganizer = find(identities, ['identityName', 'DEFAULT']);
	if (id) {
		const editor = {
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

		state.editors[id] = editor;
	}
};
