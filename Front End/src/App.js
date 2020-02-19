import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import logo from './logo.svg';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import Navbar from "./Components/Navbar";
import Title from "./Components/Title";
import SearchBar from "./Components/SearchBar";
import List from "./Components/List";


class App extends Component {
  render() {
    return (
        <Router>
          <div className="App">
            <Navbar />
            <Title />
            <SearchBar />
          </div>
        </Router>
    );
  }
}

export default App;
