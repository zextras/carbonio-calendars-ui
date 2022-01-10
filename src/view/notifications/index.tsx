/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, FC, useEffect } from 'react';

export const showNotification = (title: string, body: string): void => {
	// eslint-disable-next-line no-new
	new Notification(title, {
		body,
		vibrate: [200, 100, 200],
		dir: 'ltr'
	});
};

const Notifications: FC = (): ReactElement => {
	useEffect(() => {
		if (!('Notification' in window)) {
			// eslint-disable-next-line no-console
			console.warn('This browser does not support desktop notifications');
		} else {
			Notification.requestPermission();
		}
	}, []);

	return <></>;
};
export default Notifications;
