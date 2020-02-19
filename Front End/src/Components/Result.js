import React, { Component } from "react";
import '../App.css';

class Result extends Component {
  constructor(props) {
    super(props);
  }

  truncate(str, no_words) {
    return str.split(" ").splice(0,no_words).join(" ");
  }

  createMarkup() {
    let text;
    if (this.props.highlighting[this.props.result.id].hasOwnProperty("selftext")) {
      text = this.props.highlighting[this.props.result.id].selftext;
    } else if (this.props.result.hasOwnProperty("selftext")) {
      text = this.props.result.selftext;
    } else {
      text = this.props.result.title;
    }
    // let text = this.props.highlighting[this.props.result.id].hasOwnProperty("selftext") ? this.props.highlighting[this.props.result.id].selftext : this.props.result.selftext[0].substring(0, 20) ;
    // console.log(this.props.highlighting[this.props.result.id]);
  return {__html: text};
  }
  
  render() {

    return (

      <div className="container-special">

    <section class="col-xs-12 col-sm-6 col-md-12">
    <article className="search-result row">

      <div class="col-xs-12 col-sm-12 col-md-2 meta-search">
        <ul className="meta-search overflow-hidden">
          <li><span>u/{this.props.result.author[0].substring(0, 9)}</span></li>
          <li> <span>Comments: {this.props.result.num_comments}</span></li>
          <li> <span>Upvotes: {this.props.result.score}</span></li>
          <li> <span>Gilded: {this.props.result.gilded}</span></li>
          <li> <span>Sub: {this.props.result.subreddit}</span></li>
        </ul>
      </div>
      <div class="col-xs-12 col-sm-12 col-md-8">
        <h3><a href={this.props.result.url} title="" className="text-overflow ellipsis">{this.props.result.title}</a></h3>
        <div className="container-special" dangerouslySetInnerHTML={this.createMarkup()} />
      </div>
    </article>   

  </section>
</div>
    );
  }
}
export default Result;