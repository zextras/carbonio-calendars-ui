/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { getUserSettings, t } from '@zextras/carbonio-shell-ui';

import { renderPrintDocument, renderPrintMessage } from './print-document';
import { buildPrintModel } from './print-model';
import { localeFromPrefs } from 'hooks/use-locale';
import { normalizeInvite } from 'normalizations/normalize-invite';
import { getInvite } from 'store/actions/get-invite';
import { ActionsClick, ActionsContext } from 'types/actions';
import { EventType } from 'types/event';

// the tab must open within the click, before the fetch, or pop-up blockers stop it
export const printAppointment =
	({ event, context }: { event: EventType; context: ActionsContext }) =>
	(ev?: ActionsClick): void => {
		if (ev) ev.preventDefault();

		const printWindow = window.open('', '_blank');
		if (!printWindow) {
			context.createSnackbar({
				key: 'print-popup-blocked',
				replace: true,
				severity: 'warning',
				label: t(
					'message.print_popup_blocked',
					'Allow pop-ups for this site to print the appointment'
				),
				autoHideTimeout: 5000
			});
			return;
		}
		printWindow.opener = null;

		context
			.dispatch(getInvite({ inviteId: event.resource.inviteId, ridZ: event.resource.ridZ }))
			.then((result) => {
				if (printWindow.closed) return;
				const message = getInvite.fulfilled.match(result) ? result.payload.m?.[0] : undefined;
				if (!message) throw new Error('invite not available');
				const model = buildPrintModel({ event, invite: normalizeInvite(message) });
				renderPrintDocument(printWindow.document, model);
				printWindow.focus();
				printWindow.print();
			})
			.catch(() => {
				if (printWindow.closed) return;
				renderPrintMessage(
					printWindow.document,
					t('label.error_try_again', 'Something went wrong, please try again'),
					localeFromPrefs(getUserSettings().prefs)
				);
			});
	};
