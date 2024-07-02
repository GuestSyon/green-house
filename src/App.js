import React, { Component } from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainComponent from './components/Main';
// import Scene from './Scene';
class App extends Component {
	render() {
		return (
			<BrowserRouter>
				<Routes>
					{/* <Route path="/" element={<Layout />}></Route> */}
					<Route index element={<MainComponent />} />
					{/* <Route path="dashboard" element={<MainComponent />} /> */}
				</Routes>
			</BrowserRouter>
		);
	}
}

export default App;
