import {
	Card,
	CardContent,
	FormControl,
	MenuItem,
	Select,
} from "@material-ui/core";
import React, { useEffect, useState } from "react";
import "./App.css";
import InfoBox from "./components/InfoBox/InfoBox";
import Map from "./components/Map/Map";
import Table from "./components/Table/Table";
import { sortData } from "./utils/utils";

function App() {
	const [countries, setCountries] = useState([]);
	const [country, setCountry] = useState("worldwide");
	const [countryInfo, setCountryInfo] = useState({});
	const [tableData, setTableData] = useState([]);

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
				: `https://disease.sh/v3/covid-19/countries/${countryCode}?strict=true`;

		await fetch(url)
			.then((res) => res.json())
			.then((data) => {
				setCountry(countryCode);

				// all of the data from the country response
				setCountryInfo(data);
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
						title="Covid-19 Cases"
						total={countryInfo.cases}
						cases={countryInfo.todayCases}
					/>
					<InfoBox
						title="Recovered"
						total={countryInfo.recovered}
						cases={countryInfo.todayRecovered}
					/>
					<InfoBox
						title="Deaths"
						total={countryInfo.deaths}
						cases={countryInfo.todayDeaths}
					/>
				</div>
				{/* Map */}
				<Map />
			</div>
			<Card className="app__right">
				<CardContent>
					<h3>Live Cases by Country</h3>
					<Table countries={tableData} />
					<h3>World Wide New Cases</h3>
					{/* Graph */}
				</CardContent>
			</Card>
		</div>
	);
}

export default App;
