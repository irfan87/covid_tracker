import {
	Card,
	CardContent,
	FormControl,
	MenuItem,
	Select,
} from "@material-ui/core";
import React, { useEffect, useState } from "react";
import "./App.css";
import LineGraph from "./components/Graph/LineGraph";
import InfoBox from "./components/InfoBox/InfoBox";
import Map from "./components/Map/Map";
import Table from "./components/Table/Table";
import { prettyPrintStat, sortData } from "./utils/utils";

import "leaflet/dist/leaflet.css";

function App() {
	const [countries, setCountries] = useState([]);
	const [country, setCountry] = useState("worldwide");
	const [countryInfo, setCountryInfo] = useState({});
	const [tableData, setTableData] = useState([]);
	const [mapCenter, setMapCenter] = useState({ lat: 2.5, lng: 112.5 });
	const [mapZoom, setMapZoom] = useState(4);
	const [mapCountries, setMapCountries] = useState([]);
	const [casesType, setCasesType] = useState("cases");

	// get the countries to preview into the dropdown menu
	useEffect(() => {
		const getCountries = async () => {
			await fetch("https://disease.sh/v3/covid-19/countries")
				.then((res) => res.json())
				.then((data) => {
					const countries = data.map((country) => ({
						name: country.country,
						value: country.countryInfo.iso2,
					}));

					const sortedData = sortData(data);
					setTableData(sortedData);
					setMapCountries(data);
					setCountries(countries);
				})
				.catch((err) => console.error(err.message));
		};

		getCountries();
	}, []);

	// fetch the adta for the world wide
	useEffect(() => {
		fetch("https://disease.sh/v3/covid-19/all")
			.then((res) => res.json())
			.then((data) => {
				setCountryInfo(data);
			})
			.catch((err) => console.error(err.message));
	}, []);

	const onCountryChange = async (e) => {
		const countryCode = e.target.value;
		setCountry(countryCode);

		const url =
			countryCode === "worldwide"
				? "https://disease.sh/v3/covid-19/all"
				: `https://disease.sh/v3/covid-19/countries/${countryCode}`;

		await fetch(url)
			.then((res) => res.json())
			.then((data) => {
				setCountry(countryCode);

				// all of the data from the country response
				setCountryInfo(data);

				// change the selected country into the map
				setMapCenter([data.countryInfo.lat, data.countryInfo.long]);

				setMapZoom(4);
			})
			.catch((err) => console.error(err.message));
	};

	return (
		<div className="app">
			<div className="app__left">
				<div className="app__header">
					<h1>Covid-19 Tracker</h1>
					<FormControl className="app__dropdown">
						<Select
							variant="outlined"
							value={country}
							onChange={onCountryChange}
						>
							<MenuItem value="worldwide">World Wide</MenuItem>
							{/* loop through all the countries and 'em as a MenuItem */}
							{countries.map((country) => (
								<MenuItem value={country.value} key={country.name}>
									{country.name}
								</MenuItem>
							))}
						</Select>
					</FormControl>
				</div>
				<div className="app__stats">
					<InfoBox
						active={casesType === "cases"}
						isRed
						onClick={(e) => setCasesType("cases")}
						title="Covid-19 Cases"
						total={prettyPrintStat(countryInfo.cases)}
						cases={prettyPrintStat(countryInfo.todayCases)}
					/>
					<InfoBox
						active={casesType === "recovered"}
						onClick={(e) => setCasesType("recovered")}
						title="Recovered"
						total={prettyPrintStat(countryInfo.recovered)}
						cases={prettyPrintStat(countryInfo.todayRecovered)}
					/>
					<InfoBox
						active={casesType === "deaths"}
						isRed
						onClick={(e) => setCasesType("deaths")}
						title="Deaths"
						total={prettyPrintStat(countryInfo.deaths)}
						cases={prettyPrintStat(countryInfo.todayDeaths)}
					/>
				</div>
				{/* Map */}
				<Map
					casesType={casesType}
					countries={mapCountries}
					center={mapCenter}
					zoom={mapZoom}
				/>
			</div>
			<Card className="app__right">
				<CardContent>
					<h3>Live Cases by Country</h3>
					<Table countries={tableData} />
					<h3 className="app__graphTitle">Worldwide new {casesType}</h3>
					{/* Graph */}
					<LineGraph className="app__graph" casesType={casesType} />
				</CardContent>
			</Card>
		</div>
	);
}

export default App;
