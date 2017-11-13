const express = require('express');
const rq = require('request-promise');
const { parseString } = require('xml2js');
const app = express();

const parseXML = async (str) => new Promise((resolve, reject) => {
	parseString(str, (err, result) => {
		if (err) {
			reject(err);
		} else {
			resolve(result);
		}
	});
});

app.get('/search', (req, res) => {
	const { query: { zipcode } } = req;

	(async () => {
		const replaced = zipcode.replace('-', '');
		const {
			results: [{ address1, address2, address3 }]
		} = JSON.parse(await rq(`http://zipcloud.ibsnet.co.jp/api/search?zipcode=${replaced}`));
		const encoded = encodeURIComponent(`${address1}${address2}${address3}`);
		const xml = await rq(`http://www.geocoding.jp/api/?q=${encoded}`);
		const {
			result: {
				coordinate: [{ lat: [lat], lng: [lng] }]
			}
		} = await parseXML(xml);
		res.json({ lat, lng });
	})().catch((err) => {
		console.error(err);
		res.sendStatus(500);
	});
});

app.listen(3000);
