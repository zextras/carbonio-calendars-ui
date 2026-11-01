/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { ComponentType } from 'react';

import type { Action } from '@zextras/carbonio-shell-ui';

/**
 * Copy of the widget contract owned by carbonio-dashboard-ui (src/types/widget.ts).
 * It is duplicated on purpose: whether the dashboard will export it is still to be decided.
 */

/** Action type the dashboard reads to discover the widgets exposed by the modules */
export const DASHBOARD_WIDGET_ACTION_TYPE = 'dashboard-widget';

/** Version of the contract between the dashboard and the modules exposing widgets */
export const DASHBOARD_WIDGET_CONTRACT_VERSION = 3;

/** Size expressed in grid cells */
export type WidgetSize = { columns: number; rows: number };

/** Opaque, versioned configuration: the dashboard only stores it */
export type SerializedWidgetConfig = { v: number; data: string };

export type WidgetProps<TConfig> = {
	config: TConfig;
	size: WidgetSize;
};

/**
 * The settings component is a controlled form: it shows `config`, the draft being edited, and
 * reports every edit through `onChange`. The dashboard owns the draft and the modal footer,
 * so Save stores the draft and Cancel discards it: the component has no buttons of its own.
 */
export type WidgetSettingsProps<TConfig> = {
	config: TConfig;
	onChange: (config: TConfig) => void;
};

export interface DashboardWidgetAction<TConfig = unknown> extends Action {
	/** Unique id of the widget (e.g. `carbonio-calendars-ui:today-appointments`) */
	id: string;
	contractVersion: number;
	description?: string;
	/** Size, in grid cells, the widget has when it is added to the dashboard */
	defaultSize: WidgetSize;
	Component: ComponentType<WidgetProps<TConfig>>;
	/** Missing when the widget has no settings */
	SettingsComponent?: ComponentType<WidgetSettingsProps<TConfig>>;
	defaultConfig: TConfig;
	serialize: (config: TConfig) => SerializedWidgetConfig;
	/** It must never throw: on invalid input it returns the default config */
	deserialize: (serialized: SerializedWidgetConfig | undefined) => TConfig;
}

/** Erases the config type so widgets with different configs can be registered together */
export const toWidgetAction = <TConfig>(
	widget: DashboardWidgetAction<TConfig>
): DashboardWidgetAction => widget as unknown as DashboardWidgetAction;
