/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useContext } from 'react';

import { Grant } from '../carbonio-ui-commons/types/folder';

export type EditModalContextType = {
	setModal: (modal: string) => void;
	onClose: () => void;
	setActiveGrant: (grant: Grant) => void;
	roleOptions: { label: string; value: string }[];
};

export const EditModalContext = React.createContext<EditModalContextType | null>(null);

export const useEditModalContext = (): EditModalContextType => {
	const currentUserContext = useContext(EditModalContext);

	if (!currentUserContext) {
		throw new Error('useCurrentUser has to be used within <CurrentUserContext.Provider>');
	}

	return currentUserContext;
};
