/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Button, Container, ModalManagerContext } from '@zextras/carbonio-design-system';
import { t } from '@zextras/carbonio-shell-ui';
import React, { ReactElement, useCallback, useContext, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { getShareInfo } from '../../../store/actions/get-share-info';
import { StoreProvider } from '../../../store/redux';
import { SharesModal } from '../shares-modal';

export const SharesComponent = (): ReactElement => {
	const createModal = useContext(ModalManagerContext);
	const dispatch = useDispatch();
	const label = useMemo(() => t('find_shares', 'Find shares'), []);

	const onClick = useCallback(
		() =>
			dispatch(getShareInfo())
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				.unwrap()
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				.then((res) => {
					if (res.isFulfilled) {
						const closeModal = createModal(
							{
								children: (
									<StoreProvider>
										<SharesModal calendars={res.calendars} onClose={(): void => closeModal()} />
									</StoreProvider>
								)
							},
							true
						);
					}
				}),
		[createModal, dispatch]
	);
	return (
		<Container padding={{ horizontal: 'medium', vertical: 'small' }}>
			<Button type="outlined" label={label} width="fill" color="primary" onClick={onClick} />
		</Container>
	);
};
