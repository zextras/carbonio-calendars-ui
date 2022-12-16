import editor from '../editor';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const getBoard = (context: any): any => {
	const defaultEditor = editor.getEditor({ folders: context?.folders, editor: context?.editor });
	return {
		url: 'calendars/',
		app: 'carbonio-calendars-ui',
		icon: 'CalendarModOutline',
		title: '',
		...(context?.editor ?? defaultEditor)
	};
};

export default getBoard;
