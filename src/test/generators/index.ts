import getEvent from './event';
import getInvite from './invite';
import editor from './editor';
import calendars from './calendar';
import utils from './utils';
import store from './store';
import board from './board';

const mockedData = {
	getEvent,
	getInvite,
	editor,
	calendars,
	utils,
	store,
	getBoard: board
};

export default mockedData;
