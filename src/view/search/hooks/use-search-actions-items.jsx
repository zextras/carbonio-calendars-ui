/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useHistory, useLocation, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { editEventItem, moveInstanceToTrash } from '../utils/actions-items';

export const useSearchActionsItems = (event, toggleDeleteModal) => {
	const history = useHistory();
	const { pathname } = useLocation();
	const { apptId, ridZ, action } = useParams();
	const [t] = useTranslation();

	if (event?.resource?.iAmOrganizer) {
		return [
			editEventItem(event, action, history, pathname, apptId, ridZ, t),
			moveInstanceToTrash(event, t, { toggleDeleteModal: () => toggleDeleteModal(event, true) })
		];
	}
	return [];
};
