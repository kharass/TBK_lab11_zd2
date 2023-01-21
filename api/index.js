const express = require('express');
const Prometheus = require('prom-client')
const app = express();

const register = new Prometheus.Registry();
Prometheus.collectDefaultMetrics({register});

const httpRequestTimer = new Prometheus.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'code'],
    buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10] // 0.1 to 10 seconds
});

// Register the histogram
register.registerMetric(httpRequestTimer);

app.listen(8050, '0.0.0.0', () => {
    console.log('Application listening at 0.0.0.0:8050');
})

app.get('/', (req, res) => {
    const end = httpRequestTimer.startTimer();
    const route = req.route.path;

    res.send('<a href="/add/5/5">Dodawanie (5 + 5)</a><br>' +
        '<a href="/mul/5/5">Mnożenie (5 * 5)</a><br>' +
        '<a href="/div/25/5">Dzielenie (25 / 5)</a><br>' +
        '<a href="/div/25/0">Dzielenie (25 / 0)</a><br>');

    end({ route, code: res.statusCode, method: req.method });
});

app.get('/add/:a/:b', (req, res) => {
    const end = httpRequestTimer.startTimer();
    const route = req.route.path;

    let result = (parseInt(req.params['a']) + parseInt(req.params['b'])).toString();
    res.send(result);

    end({ route, code: res.statusCode, method: req.method });
});

app.get('/mul/:a/:b', (req, res) => {
    const end = httpRequestTimer.startTimer();
    const route = req.route.path;

    let result = (parseInt(req.params['a']) * parseInt(req.params['b'])).toString();
    res.send(result);

    end({ route, code: res.statusCode, method: req.method });
});

app.get('/div/:a/:b', (req, res) => {
    const end = httpRequestTimer.startTimer();
    const route = req.route.path;

    let result;

    if (parseInt(req.params['b']) !== 0) {
        result = (parseInt(req.params['a']) / parseInt(req.params['b'])).toString();
    } else {
        result = 'Nie można dzielić przez 0!';
    }
    res.send(result);

    end({ route, code: res.statusCode, method: req.method });
});

app.get('/metrics', async (req, res) => {
    res.setHeader('Content-Type', register.contentType);
    res.send(await register.metrics());
})