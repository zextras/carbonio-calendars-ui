/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createGlobalStyle } from 'styled-components';

export default createGlobalStyle`
	.rbc-addons-dnd-resizable{
		width: 100%;
	}
	.rbc-calendar {
		color: ${({ theme }) => theme.palette.text.regular};
		font-family: ${({ theme }) => theme.fonts.default};
		font-size: ${({ theme }) => theme.sizes.font.medium};
		font-weight: ${({ theme }) => theme.fonts.weight.regular};
		& * {
			outline: none !important;
		}
	}

	.rbc-btn {
		color: inherit;
		font: inherit;
		margin: 0; }

	button.rbc-btn {
		overflow: visible;
		text-transform: none;
		-webkit-appearance: button;
		cursor: pointer; }

	button[disabled].rbc-btn {
		cursor: not-allowed; }

	button.rbc-input::-moz-focus-inner {
		border: 0;
		padding: 0; }

	.rbc-calendar {
		box-sizing: border-box;
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: stretch; }

	.rbc-calendar *,
	.rbc-calendar *:before,
	.rbc-calendar *:after {
		box-sizing: inherit; }

	.rbc-abs-full, .rbc-row-bg {
		overflow: hidden;
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0; }

	.rbc-ellipsis, .rbc-event-label, .rbc-row-segment .rbc-event-content, .rbc-show-more {
		display: block;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap; }

	.rbc-rtl {
		direction: rtl; }

	.rbc-off-range {
		color:${({ theme }) => theme.palette.text.disabled}; }

	.rbc-off-range-bg {
		background: ${({ theme }) => theme.palette.gray5.regular}; }

	.rbc-header {
		overflow: hidden;
		flex: 1 0 0;
		text-overflow: ellipsis;
		white-space: nowrap;
		padding: 0 0.1875rem;
		text-align: center;
		vertical-align: middle;
		font-weight: bold;
		font-size: 90%;
		min-height: 0;
		border-bottom: 0.0625rem solid ${({ theme }) => theme.palette.gray3.regular}; }
		.rbc-header + .rbc-header {
			border-left: 0.0625rem solid ${({ theme }) => theme.palette.gray3.regular}; }
		.rbc-rtl .rbc-header + .rbc-header {
			border-left-width: 0;
			border-right: 0.0625rem solid ${({ theme }) => theme.palette.gray3.regular}; }
		.rbc-header > a, .rbc-header > a:active, .rbc-header > a:visited {
			color: inherit;
			text-decoration: none; }

	.rbc-row-content {
		position: relative;
		user-select: none;
		-webkit-user-select: none;
		z-index: 4; }

	.rbc-today {
		background-color: ${({ theme }) => theme.palette.highlight.regular};
		color: ${({ theme }) => theme.palette.primary.regular};
		font-weight: bold; }


	.rbc-toolbar {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		align-items: center;
		margin-bottom: 0.625rem;
		font-size: 1rem;
		padding: 0.5rem;
		background-color: ${({ theme }) => theme.palette.gray5.regular}; }
		.rbc-toolbar .rbc-toolbar-label {
			flex-grow: 1;
			padding: 0 0.625rem;
			text-align: center; }
		.rbc-toolbar button {
			color: ${({ theme }) => theme.palette.primary.regular};
			display: inline-block;
			margin: 0;
			text-align: center;
			vertical-align: middle;
			background: none;
			border: 0.0625rem solid ${({ theme }) => theme.palette.primary.regular};
			padding: .375rem 1rem;
			border-radius: 0.125rem;
			line-height: normal;
			white-space: nowrap; }
			.rbc-toolbar button:active, .rbc-toolbar button.rbc-active {
				background-image: none;
			//	box-shadow: inset 0 0.1875rem 0.3125rem rgba(0, 0, 0, 0.125);
				background-color: ${({ theme }) => theme.palette.highlight.regular};
				border-color: ${({ theme }) => theme.palette.primary.active};
			}
			.rbc-toolbar button:active:hover, .rbc-toolbar button:active:focus, .rbc-toolbar button.rbc-active:hover, .rbc-toolbar button.rbc-active:focus {
				color:${({ theme }) => theme.palette.primary.focus};
				background-color: ${({ theme }) => theme.palette.transparent.focus};
				border-color: ${({ theme }) => theme.palette.primary.focus};
			}
			.rbc-toolbar button:focus {
				color: ${({ theme }) => theme.palette.primary.focus};
				background-color: ${({ theme }) => theme.palette.transparent.focus};
				border-color: ${({ theme }) => theme.palette.primary.focus};
			}
			.rbc-toolbar button:hover {
				color: ${({ theme }) => theme.palette.primary.hover};
				background-color: ${({ theme }) => theme.palette.transparent.hover};
				border-color: ${({ theme }) => theme.palette.primary.hover};
			}

	.rbc-btn-group {
		display: inline-block;
		height: 2rem;
		white-space: nowrap; }
		.rbc-btn-group > button {
			height: 2rem;
			text-transform: uppercase;
			font-size: 0.875rem; }
		.rbc-btn-group > button:first-child:not(:last-child) {
			border-top-right-radius: 0;
			border-bottom-right-radius: 0; }
		.rbc-btn-group > button:last-child:not(:first-child) {
			border-top-left-radius: 0;
			border-bottom-left-radius: 0; }
		.rbc-rtl .rbc-btn-group > button:first-child:not(:last-child) {
			border-radius: 0.125rem;
			border-top-left-radius: 0;
			border-bottom-left-radius: 0; }
		.rbc-rtl .rbc-btn-group > button:last-child:not(:first-child) {
			border-radius: 0.125rem;
			border-top-right-radius: 0;
			border-bottom-right-radius: 0; }
		.rbc-btn-group > button:not(:first-child):not(:last-child) {
			border-radius: 0; }
		.rbc-btn-group button + button {
			margin-left: -0.0625rem; }
		.rbc-rtl .rbc-btn-group button + button {
			margin-left: 0;
			margin-right: -0.0625rem; }
		.rbc-btn-group + .rbc-btn-group,
		.rbc-btn-group + button {
			margin-left: 0.625rem; }


	.rbc-row {
		display: flex;
		flex-direction: row; }

	.rbc-row-segment {
		padding: 0 0.0625rem 0.0625rem 0.0625rem; }

  .rbc-day-bg.rbc-selected-cell {
    background-color: ${({ primaryCalendar, summaryViewOpen, action }) =>
			!summaryViewOpen && !action ? primaryCalendar?.color?.background : 'inherit'} !important;
    border: 0.0625rem solid ${({ primaryCalendar, summaryViewOpen, action }) =>
			!summaryViewOpen && !action ? primaryCalendar?.color?.color : 'inherit'} !important;}

	.rbc-show-more {
		background-color: ${({ theme }) => theme.palette.transparent.active};
		z-index: 4;
		font-weight: bold;
		font-size: 85%;
		height: auto;
		line-height: normal; }

	.rbc-month-view {
		position: relative;
		border: 0.0625rem solid ${({ theme }) => theme.palette.gray3.regular};
		display: flex;
		flex-direction: column;
		flex: 1 0 0;
		width: 100%;
		user-select: none;
		-webkit-user-select: none;
		height: 100%; }

	.rbc-month-header {
		display: flex;
		flex-direction: row; }

	.rbc-month-row {
		display: flex;
		position: relative;
		flex-direction: column;
		flex: 1 0 0;
		flex-basis: 0;
		overflow: hidden;
		height: 100%; }
		.rbc-month-row + .rbc-month-row {
			border-top: 0.0625rem solid ${({ theme }) => theme.palette.gray3.regular}; }

	.rbc-date-cell {
		flex: 1 1 0;
		min-width: 0;
		padding-right: 0.3125rem;
		text-align: right; }
		.rbc-date-cell.rbc-now {
			font-weight: bold; }
		.rbc-date-cell > a, .rbc-date-cell > a:active, .rbc-date-cell > a:visited {
			color: inherit;
			text-decoration: none; }
	.rbc-row-bg {
		display: flex;
		flex-direction: row;
		flex: 1 0 0;
		overflow: hidden;
	}
	.rbc-day-bg {
		cursor: pointer;
		flex: 1 0 0; }
		.rbc-day-bg + .rbc-day-bg {
			border-left: 0.0625rem solid ${({ theme }) => theme.palette.gray3.regular}; }
		.rbc-rtl .rbc-day-bg + .rbc-day-bg {
			border-left-width: 0;
			border-right: 0.0625rem solid ${({ theme }) => theme.palette.gray3.regular}; }

	.rbc-overlay {
		position: absolute;
		z-index: 5;
		border: 0.0625rem solid ${({ theme }) => theme.palette.gray3.regular};
		background-color: #fff;
		box-shadow: 0 0.3125rem 0.9375rem rgba(0, 0, 0, 0.25);
		padding: 0.625rem; }
		.rbc-overlay > * + * {
			margin-top: 0.0625rem; }

	.rbc-overlay-header {
		border-bottom: 0.0625rem solid ${({ theme }) => theme.palette.gray3.regular};
		margin: -0.625rem -0.625rem 0.3125rem -0.625rem;
		padding: 0.125rem 0.625rem; }

	.rbc-agenda-view {
		display: flex;
		flex-direction: column;
		flex: 1 0 0;
		overflow: auto; }
		.rbc-agenda-view table.rbc-agenda-table {
			width: 100%;
			border: 0.0625rem solid ${({ theme }) => theme.palette.gray3.regular};
			border-spacing: 0;
			border-collapse: collapse; }
			.rbc-agenda-view table.rbc-agenda-table tbody > tr > td {
				padding: 0.3125rem 0.625rem;
				vertical-align: top; }
			.rbc-agenda-view table.rbc-agenda-table .rbc-agenda-time-cell {
				padding-left: 0.9375rem;
				padding-right: 0.9375rem;
				text-transform: lowercase; }
			.rbc-agenda-view table.rbc-agenda-table tbody > tr > td + td {
				border-left: 0.0625rem solid ${({ theme }) => theme.palette.gray3.regular}; }
			.rbc-rtl .rbc-agenda-view table.rbc-agenda-table tbody > tr > td + td {
				border-left-width: 0;
				border-right: 0.0625rem solid ${({ theme }) => theme.palette.gray3.regular}; }
			.rbc-agenda-view table.rbc-agenda-table tbody > tr + tr {
				border-top: 0.0625rem solid ${({ theme }) => theme.palette.gray3.regular}; }
			.rbc-agenda-view table.rbc-agenda-table thead > tr > th {
				padding: 0.1875rem 0.3125rem;
				text-align: left;
				border-bottom: 0.0625rem solid ${({ theme }) => theme.palette.gray3.regular}; }
				.rbc-rtl .rbc-agenda-view table.rbc-agenda-table thead > tr > th {
					text-align: right; }

	.rbc-agenda-time-cell {
		text-transform: lowercase; }
		.rbc-agenda-time-cell .rbc-continues-after:after {
			content: ' »'; }
		.rbc-agenda-time-cell .rbc-continues-prior:before {
			content: '« '; }

	.rbc-agenda-date-cell,
	.rbc-agenda-time-cell {
		white-space: nowrap; }

	.rbc-agenda-event-cell {
		width: 100%; }

	.rbc-time-column {
		display: flex;
		flex-direction: column;
		min-height: 100%; }
		.rbc-time-column .rbc-timeslot-group {
			flex: 1; }

	.rbc-timeslot-group {
		border-bottom: 0.0625rem solid ${({ theme }) => theme.palette.gray6.regular};
		min-height: 5rem;
		display: flex;
		flex-flow: column nowrap; }

	.rbc-time-gutter,
	.rbc-header-gutter {
		flex: none; }

	.rbc-label {
		padding: 0 0.3125rem; }

	.rbc-day-slot {
		position: relative; }
		.rbc-day-slot .rbc-events-container {
			bottom: 0;
			left: 0;
			position: absolute;
			right: 0;
			margin-right: 0.625rem;
			top: 0; }
			.rbc-day-slot .rbc-events-container.rbc-rtl {
				left: 0.625rem;
				right: 0; }
		.rbc-day-slot .rbc-event {
			border: 0.0625rem solid ${({ theme }) => theme.palette.gray3.regular};
			display: flex;
			max-height: 100%;
			min-height: 1.25rem;
			flex-flow: column wrap;
			align-items: flex-start;
			overflow: hidden;
			position: absolute; }
		.rbc-day-slot .rbc-event-label {
			flex: none;
			padding-right: 0.3125rem;
			width: auto; }
		.rbc-day-slot .rbc-event-content {
			width: 100%;
			flex: 1 1 0;
			word-wrap: break-word;
			line-height: 1;
			height: 100%;
			min-height: 1em; }
		.rbc-day-slot .rbc-time-slot {
			border-top: 0.0625rem solid ${({ theme }) => theme.palette.gray5.regular}; }

	.rbc-time-view-resources .rbc-time-gutter,
	.rbc-time-view-resources .rbc-time-header-gutter {
		position: sticky;
		left: 0;
		background-color: ${({ theme }) => theme.palette.gray6.regular};
		border-right: 0.0625rem solid ${({ theme }) => theme.palette.gray3.regular};
		z-index: 10;
		margin-right: -0.0625rem; }

	.rbc-time-view-resources .rbc-time-header {
		overflow: hidden; }

	.rbc-time-view-resources .rbc-time-header-content {
		min-width: auto;
		flex: 1 0 0; }

	.rbc-time-view-resources .rbc-time-header-cell-single-day {
		display: none; }

	.rbc-time-view-resources .rbc-day-slot {
		min-width: 8.75rem; }

	.rbc-time-view-resources .rbc-header,
	.rbc-time-view-resources .rbc-day-bg {
		width: 8.75rem;
		flex: 1 1 0; }

	.rbc-time-header-content + .rbc-time-header-content {
		margin-left: -0.0625rem; }

	.rbc-time-slot {
		flex: 1 0 0; }
		.rbc-time-slot.rbc-now {
			font-weight: bold; }

	.rbc-day-header {
		text-align: center; }
	.rbc-allday-cell {
    cursor: ${({ summaryViewOpen, action }) =>
			!summaryViewOpen && !action ? 'pointer' : 'inherit'};
	}
  .rbc-day-slot.rbc-time-column {
    cursor: ${({ summaryViewOpen, action }) =>
			!summaryViewOpen && !action ? 'pointer' : 'inherit'};
  }
	.rbc-slot-selection {
		color: ${({ primaryCalendar }) => primaryCalendar?.color?.color};
		background-color: ${({ primaryCalendar }) => primaryCalendar?.color?.background};
		border: 0.0625rem solid ${({ primaryCalendar }) => primaryCalendar?.color?.color} !important;
		z-index: 10;
		position: absolute;
		font-size: ${({ theme }) => theme.sizes.font.medium};
		width: 100%;
		padding: ${({ theme }) => `${theme.sizes.padding.small} ${theme.sizes.padding.extrasmall}`};
		border-radius : 0.25rem;
	}

  .rbc-day-slot.rbc-time-column.rbc-slot-selecting {
		cursor: ns-resize; }

	.rbc-time-view {
		display: flex;
		flex-direction: column;
		flex: 1;
		width: 100%;
		border: 0.0625rem solid ${({ theme }) => theme.palette.gray3.regular};
		min-height: 0; }
		.rbc-time-view .rbc-time-gutter {
			white-space: nowrap; }
		.rbc-time-view .rbc-allday-cell {
			box-sizing: content-box;
			width: 100%;
			height: 100%;
			position: relative; }
		.rbc-time-view .rbc-allday-cell + .rbc-allday-cell {
			border-left: 0.0625rem solid ${({ theme }) => theme.palette.gray3.regular}; }
		.rbc-time-view .rbc-allday-events {
			position: relative;
			z-index: 4; }
		.rbc-time-view .rbc-row {
			box-sizing: border-box;
			min-height: 1.25rem; }

	.rbc-time-header {
		display: flex;
		flex: 0 0 auto;
		flex-direction: row; }
		.rbc-time-header.rbc-overflowing {
			border-right: 0.0625rem solid ${({ theme }) => theme.palette.gray3.regular}; }
		.rbc-rtl .rbc-time-header.rbc-overflowing {
			border-right-width: 0;
			border-left: 0.0625rem solid ${({ theme }) => theme.palette.gray3.regular}; }
		.rbc-time-header > .rbc-row:first-child {
			border-bottom: 0.0625rem solid ${({ theme }) => theme.palette.gray3.regular}; }
		.rbc-time-header > .rbc-row.rbc-row-resource {
			border-bottom: 0.0625rem solid ${({ theme }) => theme.palette.gray3.regular}; }

	.rbc-time-header-cell-single-day {
		display: none; }

	.rbc-time-header-content {
		flex: 1;
		display: flex;
		min-width: 0;
		flex-direction: column;
		border-left: 0.0625rem solid ${({ theme }) => theme.palette.gray3.regular}; }
		.rbc-rtl .rbc-time-header-content {
			border-left-width: 0;
			border-right: 0.0625rem solid ${({ theme }) => theme.palette.gray3.regular}; }
		.rbc-time-header-content > .rbc-row.rbc-row-resource {
			border-bottom: 0.0625rem solid ${({ theme }) => theme.palette.gray3.regular};
			flex-shrink: 0; }

	.rbc-time-content {
		display: flex;
		flex: 1 0 0;
		align-items: flex-start;
		width: 100%;
		border-top: 0.125rem solid ${({ theme }) => theme.palette.gray3.regular};
		overflow-y: auto;
		position: relative; }
		.rbc-time-content > .rbc-time-gutter {
			flex: none; }
		.rbc-time-content > * + * > * {
			border-left: 0.0625rem solid ${({ theme }) => theme.palette.gray6.regular}; }
		.rbc-rtl .rbc-time-content > * + * > * {
			border-left-width: 0;
			border-right: 0.0625rem solid ${({ theme }) => theme.palette.gray6.regular}; }
		.rbc-time-content > .rbc-day-slot {
			width: 100%;
			user-select: none;
			-webkit-user-select: none; }

	.rbc-current-time-indicator {
		position: absolute;
		z-index: 3;
		left: 0;
		right: 0;
		height: 0.125rem;
		background-color: ${({ theme }) => theme.palette.primary.regular};
		pointer-events: none; }

  .rbc-addons-dnd .rbc-addons-dnd-row-body {
    position: relative; }

  .rbc-addons-dnd .rbc-addons-dnd-drag-row {
    position: absolute;
    top: 0;
    left: 0;
    right: 0; }

  .rbc-addons-dnd .rbc-addons-dnd-over {
    background-color: rgba(0, 0, 0, 0.3); }

  .rbc-addons-dnd .rbc-event {
    transition: opacity 150ms; }
  .rbc-addons-dnd .rbc-event:hover .rbc-addons-dnd-resize-ns-icon, .rbc-addons-dnd .rbc-event:hover .rbc-addons-dnd-resize-ew-icon {
    display: block; }

  .rbc-addons-dnd .rbc-addons-dnd-dragged-event {
    opacity: 0; }
	
  .rbc-addons-dnd.rbc-addons-dnd-is-dragging .rbc-event:not(.rbc-addons-dnd-dragged-event):not(.rbc-addons-dnd-drag-preview) {
    opacity: .50; }

  .rbc-addons-dnd .rbc-addons-dnd-resizable {
    position: relative;
    width: 100%;
    height: 100%; }

  .rbc-addons-dnd .rbc-addons-dnd-resize-ns-anchor {
    width: 100%;
    text-align: center;
    position: absolute; }
  .rbc-addons-dnd .rbc-addons-dnd-resize-ns-anchor:first-child {
    z-index: 20;
    top: 0; }
  .rbc-addons-dnd .rbc-addons-dnd-resize-ns-anchor:last-child {
    z-index: 20;
    bottom: 0; }
  .rbc-addons-dnd .rbc-addons-dnd-resize-ns-anchor .rbc-addons-dnd-resize-ns-icon {
    display: none;
    border-top: 0.1875rem double;
    margin: 0 auto;
    width: 0.625rem;
    cursor: ns-resize; }

  .rbc-addons-dnd .rbc-addons-dnd-resize-ew-anchor {
    position: absolute;
    top: 0.25rem;
    bottom: 0; }
  .rbc-addons-dnd .rbc-addons-dnd-resize-ew-anchor:first-child {
		z-index: 20;
    left: 0; }
  .rbc-addons-dnd .rbc-addons-dnd-resize-ew-anchor:last-child {
    z-index: 20;
    right: 0; }
  .rbc-addons-dnd .rbc-addons-dnd-resize-ew-anchor .rbc-addons-dnd-resize-ew-icon {
    display: none;
    border-left: 0.1875rem double;
    margin-top: auto;
    margin-bottom: auto;
    height: 0.625rem;
    cursor: ew-resize; }
	`;
