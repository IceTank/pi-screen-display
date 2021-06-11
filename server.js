const express = require('express');
const puppeteer = require('puppeteer-core');
const readline = require('readline');

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

const consoleCom = {
	exit: () => {
		console.log("Exiting Process");
		browser.close().then(process.exit());
	},
	page: (arg) => {
		var url = arg.toString();
		page.goto(url).then(() => {
			console.log(`Going to ${url}`);
		}).catch(() => {
			console.log(`Page opening Failed Invalig url: ${url}`);
			console.log(typeof url);
		});
	},
	exec: (args) => {
		var arg = args.join(' ');
		var returnarg = page.evaluate((arg) => {
			return eval(arg)
		}, arg).catch((err) => {
			console.log("exec failed");
		});
		returnarg.then((arg) => {console.log(arg)});
	},
	scrollUp: () => {
		page.evaluate(() => {
			window.scroll(0, (window.scrollY - 500) < 0 ? 0 : (window.scrollY - 500))
		})
	},
	scrollDown: () => {
		page.evaluate(() => {
			window.scroll(0, window.scrollY + 500)
		})
	},
	reload: () => {
		reloadPage(page);
	}
}

rl.on('line', (input) => {
	//console.log(`Received: ${input}`);
	var args = input.split(" ");
	if (consoleCom.hasOwnProperty(args[0])) {
		var command = args[0];
		args.shift();
		try {
			consoleCom[command](args);
		} catch(err) {
			console.log("Command Failed");
			console.log(err);
		}
	}
});

const app = express();
const PORT = 8080;

const StartingPage = 'http://rasp-sequitur.local';

var browser;
var page;

app.listen(PORT, () => {
	console.log(`Started Server on Port ${PORT}`);
});

app.use(express.static(__dirname + '/content'), () => {
	console.log("Something happend");
});

app.get('/', (req, res) => {
	console.log("Connection");
	console.log(req.url);
	res.send('Hallo World!');
});

function reloadPage(page) {
	return new Promise((resolve, reject) => {
		console.log('Reloading Page');
		page.reload().then(() => {
			resolve();
		})
	})
}

(async () => {
	browser = await puppeteer.launch({
		executablePath: '/usr/bin/chromium-browser',
		headless: false,
		args: ["--start-fullscreen","--disable-infobars"],
		defaultViewport: {
			width: 800,
			height: 480
		}
	});
	page = await browser.newPage();
	console.log("Browser ready");
	await page.goto(StartingPage);
})();
