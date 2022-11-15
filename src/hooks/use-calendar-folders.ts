import { Folder, useFolders } from '@zextras/carbonio-shell-ui';
import { filter } from 'lodash';
import { useMemo } from 'react';

export const useCalendarFolders = (): Array<Folder> => {
	const folders = useFolders();
	return useMemo(() => filter(folders, ['view', 'appointment']), [folders]);
};
