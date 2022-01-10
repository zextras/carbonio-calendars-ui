/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { Component } from 'react';
import moment from 'moment';
import { add as datesAdd } from 'date-arithmetic';
import TimeGrid from 'react-big-calendar/lib/TimeGrid';
import { reduce } from 'lodash';
import { Navigate } from 'react-big-calendar';

let schedule = [];
export default class WorkView extends Component {
	// eslint-disable-next-line class-methods-use-this
	constructor(props) {
		super(props);
		schedule = props.workingSchedule;
		this.state = {};
	}

	static getDerivedStateFromProps(props) {
		const { date, workingSchedule } = props;

		const min = '0000';
		const max = '2300';

		schedule = workingSchedule;
		return {
			minHour: Number(min?.split('').splice(0, 2).join('')),
			minMins: Number(min?.split('').splice(2, 4).join('')),
			maxHour: Number(max?.split('').splice(0, 2).join('')),
			maxMins: Number(max?.split('').splice(2, 4).join('')),
			range: WorkView.range(date)
		};
	}

	render() {
		return (
			<TimeGrid
				{...this.props}
				range={this.state.range}
				max={new Date(0, 0, 0, this.state.maxHour, this.state.maxMins, 0)}
				min={new Date(0, 0, 0, this.state.minHour, this.state.minMins, 0)}
			/>
		);
	}
}

WorkView.range = (date) => {
	const current = moment(date).day();
	const d = moment(date).set({ hour: 0, minute: 0, second: 0 });
	const range = reduce(
		schedule,
		(acc, day, i) => {
			if (day.working) {
				acc.push(datesAdd(d, i - current, 'day'));
			}
			return acc;
		},
		[]
	);
	return range;
};

WorkView.navigate = (date, action) => {
	switch (action) {
		case Navigate.PREVIOUS:
			return datesAdd(date, -7, 'day');

		case Navigate.NEXT:
			return datesAdd(date, 7, 'day');

		default:
			return date;
	}
};

WorkView.title = (date) => {
	const startDate = moment(date).day() === 1 ? moment(date) : moment(date).day(0);
	const endDate = datesAdd(startDate, 6, 'day');
	const isMonthSame = moment(startDate).format('MMMM') === moment(endDate).format('MMMM');
	const title = isMonthSame
		? `${moment(startDate).format('MMMM DD')} - ${moment(endDate).format('DD')}`
		: ` ${moment(startDate).format('MMMM DD')} - ${moment(endDate).format('MMMM DD')}`;
	return title;
};
