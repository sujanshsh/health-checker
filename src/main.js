const cron = require('node-cron')
const axios = require('axios')
const { logger } = require('./logger')

const slackWebhooks = {}

function main(config) {
    logger.info('config', config)
    installSlackWebhookNotifications(config)
    installHealthChecksByStatusCode(config)
}

function installSlackWebhookNotifications(config) {
    for (let notification in config['notifications']) {
        const notificationConfig = config['notifications'][notification]
        if (notificationConfig.type !== 'slack-webhook') {
            continue
        }
        logger.info(`Installing slack webhook notification ${notification}`)
        slackWebhooks[notification] = {
            url: notificationConfig.url,
        }
    }
}

function installHealthChecksByStatusCode(config) {
    for (let project in config['health-checks']) {
        logger.info(`Installing health-checks for project ${project}`)
        installHealthChecksByStatusCodesOfProject(project, config['health-checks'][project])
    }
}

function slackWebhookNotificationHandler(notification, data) {
    logger.info(`Invoking slack webhook ${notification}`, data)
    axios
        .post(slackWebhooks[notification].url, {
            text: `Service ${data.name} is down!\n` + JSON.stringify(data),
        })
        .catch((err) => {
            logger.error('Failed to post to slack webhook: ' + err.message)
        })
}

function getSlackWebhookNotificationHandler() {
    return slackWebhookNotificationHandler
}

function installHealthChecksByStatusCodesOfProject(project, projectHealthChecks) {
    for (let healthCheck of projectHealthChecks) {
        logger.info(`Installing for health-check for service ${healthCheck.name}`, healthCheck)
        if (healthCheck['check-by'] === 'status-code') {
            cron.schedule('*/5 * * * *', getCheckByStatusCode({...healthCheck}, getSlackWebhookNotificationHandler))
        }
    }
}

function getCheckByStatusCode(checkerConfig, getNotificationHandler) {
    const cloneCheckerConfig = { ...checkerConfig }
    return async () => {
        try {
            const response = await axios.get(cloneCheckerConfig.url, { timeout: 4000 })

            logger.debug(`health checked of ${cloneCheckerConfig.name} status: up`, {
                url: cloneCheckerConfig.url,
                response: response.data,
                statusCode: response.status,
            })
        } catch (err) {
            logger.info(`health checked of ${cloneCheckerConfig.name} status: down`, {
                url: cloneCheckerConfig.url,
                response: err.response?.data,
                statusCode: err.response?.status,
                error: err.message,
            })
            const data = {
                name: cloneCheckerConfig.name,
                url: cloneCheckerConfig.url,
                statusCode: err.response?.status,
                response: err.response?.data,
                error: err.message
            }
            try {
                getNotificationHandler()(`${cloneCheckerConfig.notification}`, { ...data })
            } catch (err) {
                logger.error('Error in notificationHandler: ' + err.message)
            }
        }
    }
}

module.exports = {
    main,
}
