import Document, { Head, Html, Main, NextScript } from 'next/document';
import { repoName } from '../services/prismic';

export default class MyDocument extends Document {
	render() {
		return (
			<Html>
				<Head>
					<link rel="preconnect" href="https://fonts.googleapis.com" />
					<link rel="preconnect" href="https://fonts.gstatic.com"  />
					<link href="https://fonts.googleapis.com/css2?family=Forum&family=Inter:wght@400;600;700&family=Roboto:wght@700;900&display=swap" rel="stylesheet" />
					<script async defer src={`//static.cdn.prismic.io/prismic.js?repo=${repoName}&new=true`} />
				</Head>

				<body>
					<Main />
					<NextScript />
				</body>
			</Html>
    	)
  	}
}
