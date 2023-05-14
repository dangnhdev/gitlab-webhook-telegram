import * as express from 'express'
import * as functions from 'firebase-functions'
import fetch, {Response} from 'node-fetch'

const BOT_TOKEN = process.env.BOT_TOKEN
const CHAT_ID = process.env.CHAT_ID
const GITLAB_WEBHOOK_TOKEN = process.env.GITLAB_WEBHOOK_TOKEN

const app = express()
app.use(express.json())

app.use((request, response, next) => {
    const gitlabToken = request.headers['x-gitlab-token']
    if (gitlabToken && (gitlabToken != GITLAB_WEBHOOK_TOKEN)) {
        response.status(401).send('Wrong auth token')
        return
    }
    next()
})

app.post('/gitlabHook', async function (request, response) {
    if (request.headers['x-gitlab-event'] != 'Push Hook') {
        response.status(501).send('Not supported gitlab event')
        return
    }

    const message = generateMessage(request.body)
    const botResponse = await sendTelegramMessage(message)

    if (!botResponse.ok) {
        const responseBody = botResponse.body.read().toString()
        functions.logger.error(
            'Failed to send telegram message',
            responseBody
        )
        response.status(botResponse.status).end(JSON.stringify({
            telegram_response: responseBody,
            chat_message: message
        }))
        return
    }
    response.sendStatus(200)
    return

})

function generateMessage(pushInfo: any){
    const branchName = pushInfo.ref.split('/').pop()
    const introMessage = `<b>[<a href="${pushInfo.project.homepage}">${pushInfo.project.name}</a>]</b> <b>${pushInfo.user_name}</b>`

    //handle branch deleted
    if (pushInfo.after == '0000000000000000000000000000000000000000' && !pushInfo.checkout_sha){
        return `${introMessage} deleted branch ${branchName}`
    }

    if (pushInfo.before == '0000000000000000000000000000000000000000'){
        return `${introMessage} created branch ${branchName}`
    }

    //handle commit pushed event
    const message = `${introMessage} pushed ${pushInfo.total_commits_count} ${pushInfo.total_commits_count > 1? 'commits' : 'commit'} to branch ${branchName}\n`
    const commitMessage = pushInfo.commits.map(commit =>
        `• <a href="${commit.url}">${commit.message.trim()}</a>`.replace(/\n\n/gi, '\n')
    )
        .join('\n').trim()
    return message + commitMessage
}

function sendTelegramMessage(message: string): Promise<Response> {
    return fetch(
        `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
        {
            method: 'POST',
            body: JSON.stringify({
                chat_id: CHAT_ID,
                text: message,
                parse_mode: 'HTML', // MarkdownV2 need to escape so many characters, use HTML instead
                disable_web_page_preview: true,
            }),
            headers: {'Content-Type': 'application/json'},
        }
    )
}

export default app
