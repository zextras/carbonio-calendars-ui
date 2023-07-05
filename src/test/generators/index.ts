/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import getEvent from './event';
import getInvite from './invite';
import getAppointment from './appointment';
import editor from './editor';
import calendars from './calendar';
import utils from './utils';
import store from './store';
import board from './board';

const mockedData = {
	getEvent,
	getInvite,
	getAppointment,
	editor,
	calendars,
	utils,
	store,
	getBoard: board
};

export default mockedData;
