import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import axios from "axios";
import InfiniteScroll from "react-infinite-scroller";

import "../App.css";
import Result from "./Result.js";

class SearchBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      query: "",
      subreddit: "",
      results: [],
      highlighting: [],
      size: 0,
      hasMoreItems: true,
      start: 0,
      end: 10,
      shouldHide: true
    };
    this.fetchResults = this.fetchResults.bind(this);
  }

  // showItems() {
  //   var items = [];

  //   if (this.state.size > 0) {
  //     this.setState({ end: this.state.end + 10 });

  //     for (var i = this.state.start; i < this.state.end; i++) {
  //       items.push(
  //         <li key={i}>
  //           {this.state.results[i].title} {i}
  //         </li>
  //       );
  //     }
  //     this.setState({ start: this.state.start + 11 });
  //   }

  //   // let items = this.state.results.map((res, i) => (
  //   //   <Result key={i++} result={res} highlighting={this.state.highlighting} />
  //   // ));

  //   return items;
  // }

  // loadMore() {
  //   if (this.state.end === this.state.size) {
  //     this.setState({ hasMoreItems: false });
  //   } else {
  //     setTimeout(() => {
  //       this.setState({ items: this.state.items + 10 });
  //     }, 2000);
  //   }
  // }

  renderNumbers() {
    let text;
    if (this.state.size === 0) {
      text = "Enter a new query!";
    } else {
      text = this.state.size + " results found.";
    }
    return (
        <h2>{text}</h2>
    );
  }

  renderResults() {
    return this.state.results.map((res, i) => (
      <Result key={i++} result={res} highlighting={this.state.highlighting} />
    ));
  }

  createURL() {

    let url = "";

    // if this is our first time through
    let start = this.state.start;
    let end = this.state.end;

    // only a query
    if (this.state.subreddit === "" && this.state.query !== "") {
      // http://localhost:8983/solr/corereddit/select?defType=edismax&hl.simple.post=%3C%2Fem%3E&hl.simple.pre=%3Cem%3E&hl=on&q=subreddit%3Anews%20AND%20title%3A%22breaking%20news%22&rows=10&sort=num_comments%20desc&start=0&stopwords=true&usePhraseHighLighter=true
      url =
        "http://localhost:8983/solr/corereddit/select?defType=edismax&hl.simple.post=%3C%2Fem%3E&hl.simple.pre=%3Cem%3E&hl=on&q=title%3A" +
        encodeURIComponent(this.state.query) +
        "%20OR%20subreddit%3A%22" +
        encodeURIComponent(this.state.query) +
        "%22%20OR%20selftext%3A%22" +
        encodeURIComponent(this.state.query) +
        "%20news%22&rows=20&sort=num_comments%20desc&start=" +
        start +
        "&stopwords=true&usePhraseHighLighter=true";
    }

    // only a subreddit
    if (this.state.query === "" && this.state.subreddit !== "") {
      this.state.subreddit = this.state.subreddit.replace(/\s/g, "");
      //http://localhost:8983/solr/corereddit/select?defType=edismax&hl.fl=selftext&hl.simple.post=%3C%2Fem%3E&hl.simple.pre=%3Cem%3E&hl=on&q=subreddit%3Aassassinscreed&rows=10&sort=num_comments%20desc&start=0&stopwords=true&usePhraseHighLighter=true
      url =
        "http://localhost:8983/solr/corereddit/select?defType=edismax&hl.fl=selftext&hl.simple.post=%3C%2Fem%3E&hl.simple.pre=%3Cem%3E&hl=on&q=subreddit%3A" +
        encodeURIComponent(this.state.subreddit) +
        "&rows=20&sort=num_comments%20desc&start="+
        start +
        "&stopwords=true&usePhraseHighLighter=true";
    }

    // both
    if (this.state.query !== "" && this.state.subreddit !== "") {
      this.state.subreddit = this.state.subreddit.replace(/\s/g, "");
      //http://localhost:8983/solr/corereddit/select?defType=edismax&hl.fl=selftext&hl.simple.post=%3C%2Fem%3E&hl.simple.pre=%3Cem%3E&hl=on&q=subreddit%3Aassassinscreed%5E1.5%20AND%20title%3A%22assassins%20creed%22%20OR%20selftext%3A%22assassins%20creed%22&rows=10&sort=num_comments%20desc&start=0&stopwords=true&usePhraseHighLighter=true
      url =
        "http://localhost:8983/solr/corereddit/select?defType=edismax&hl.fl=selftext&hl.simple.post=%3C%2Fem%3E&hl.simple.pre=%3Cem%3E&hl=on&q=subreddit%3A" +
        encodeURIComponent(this.state.subreddit) +
        "%5E1.5%20OR%20title%3A%22" +
        encodeURIComponent(this.state.query) +
        "%22%20OR%20selftext%3A%22" +
        encodeURIComponent(this.state.query) +
        "%22&rows=20&sort=num_comments%20desc&start=" +
        start 
        + "&stopwords=true&usePhraseHighLighter=true";
    }

    this.state.start += 10;

    // there are more results to be found?
    if (this.state.start > this.state.numFound) {
      this.state.hasMoreItems = false;
    } else {
      this.state.shouldHide = false;
    }

    return url;
  }

  onChange = e => {
    this.setState({ [e.target.id]: e.target.value });
  };

  onSubmit = e => {
    e.preventDefault();

    this.fetchResults();
    document.getElementById("query-form").reset();
    this.state.query = "";
    this.state.subreddit = "";
  };

  fetchResults() {
    let url = this.createURL();

    fetch(url)
      .then(response => response.json())
      .then(contents =>
        this.setState({
          results: contents.response.docs,
          highlighting: contents.highlighting,
          size: contents.response.numFound,
          end: contents.response.numFound
        })
      )
      .catch(e => console.log(e));

    console.log(this.state.results);
  }

  // load next page of results
  // nextPage() {
  //   this.fetchResults();
  // }

  render() {
    return (
      <div>
        <div className="container">
          <div className="row">
            <div
              className="col-lg-10 col-xl-9 mx-auto"
              style={{ padding: "100px" }}
            >
              <form id="query-form" className="form-signin" noValidate onSubmit={this.onSubmit}>
                <div className="form-label-group">
                  <label htmlFor="name">Query</label>

                  <input
                    onChange={this.onChange}
                    value={this.state.query}
                    id="query"
                    type="text"
                  />
                </div>
                <div className="form-label-group">
                  <label htmlFor="name">Subreddit</label>
                  <input
                    onChange={this.onChange}
                    value={this.state.subreddit}
                    id="subreddit"
                    type="text"
                  />
                </div>
                <div className="form-label-group">
                  <button
                    style={{
                      width: "150px",
                      borderRadius: "3px",
                      letterSpacing: "1.5px",
                      marginTop: "1rem"
                    }}
                    type="submit"
                    className="btn btn-lg btn-primary btn-block text-uppercase"
                  >
                    Submit
                  </button>
                </div>
              </form>
                <h3 className="search-header">{this.renderNumbers()}</h3>
            </div>
          </div>
        </div>

        <div className="row">{this.renderResults()}</div>

        <div className="col-lg-10 col-xl-9 mx-auto">
          <div className={this.state.shouldHide ? 'hidden' : ''}>
            <button
              style={{
                width: "150px",
                borderRadius: "3px",
                letterSpacing: "1.5px",
                marginTop: "1rem"
              }}
              type="submit"
              className="btn btn-lg btn-primary btn-block text-uppercase"
              onClick={this.fetchResults}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default SearchBar;