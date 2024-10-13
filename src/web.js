const express = require('express')
const { metricsRoute } = require('./metrics')
const { getHealthStatus } = require('./health')

const app = express()

app.use(express.json())

app.get('/', (_, res) => {
    res.json({
        version: '1.0.0',
        message: 'This is Health Checker Service.',
    })
})

app.use('/health-check', (_, res) => {
    const healthStatus = getHealthStatus()
    const statusCode = healthStatus.isHealthy ? 200 : 503
    res.status(statusCode).json(healthStatus)
})

app.use(metricsRoute)

module.exports = {
    app,
}
