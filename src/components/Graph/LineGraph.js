import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import numeral from "numeral";

import "./LineGraph.css";

const options = {
	legend: {
		display: false,
	},
	elements: {
		point: {
			radius: 0,
		},
	},
	maintainAspectRatio: false,
	tooltips: {
		mode: "index",
		intersect: false,
		callbacks: {
			label: function (tooltipItem, data) {
				return numeral(tooltipItem.value).format("+0,0");
			},
		},
	},
	scales: {
		xAxes: [
			{
				type: "time",
				time: {
					format: "MM/DD/YYYY",
					tooltipFormat: "11",
				},
			},
		],
		yAxes: [
			{
				gridLines: {
					display: false,
				},
				ticks: {
					callback: function (value, index, values) {
						return numeral(value).format("0a");
					},
				},
			},
		],
	},
};

const buildChartData = (data, casesType) => {
	const chartData = [];
	let lastDataPoint;

	for (let date in data.cases) {
		if (lastDataPoint) {
			const newDataPoint = {
				x: date,
				y: data[casesType][date] - lastDataPoint,
			};
			chartData.push(newDataPoint);
		}

		lastDataPoint = data[casesType][date];
	}

	return chartData;
};

const LineGraph = ({ casesType }) => {
	const [data, setData] = useState({});

	useEffect(() => {
		const fetchData = async () => {
			await fetch("https://disease.sh/v3/covid-19/historical/all?lastdays=120")
				.then((res) => res.json())
				.then((data) => {
					const chartData = buildChartData(data, casesType);

					setData(chartData);
				})
				.catch((err) => console.error(err.message));
		};

		fetchData();
	}, [casesType]);

	return (
		<div className="graph">
			{data?.length > 0 && (
				<Line
					data={{
						datasets: [
							{
								backgroundColor: "rgba(204, 16, 52, 0.5)",
								borderColor: "#CC1034",
								data: data,
							},
						],
					}}
					options={options}
				/>
			)}
		</div>
	);
};

export default LineGraph;
