import React, {Component} from "react";
import styles from './comments.module.scss';

export default class Comments extends Component {

  componentDidMount () {
      let script = document.createElement("script");
      let anchor = document.getElementById("inject-comments-for-uterances");
      script.setAttribute("src", "https://utteranc.es/client.js");
      script.setAttribute("crossorigin","anonymous");
      script.async = true;
      script.setAttribute("repo", "Guilhermecheng/spacetravelling");
      script.setAttribute("issue-term", "pathname");
      script.setAttribute( "theme", "photon-dark");
      anchor.appendChild(script);
  }

  render() {
    return (
      <div className={styles.commentBox}>
        <div id="inject-comments-for-uterances"></div>
      </div>
    );
  }
}