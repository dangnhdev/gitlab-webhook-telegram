import * as express from 'express'
import * as functions from 'firebase-functions'
import fetch, {Response} from 'node-fetch'

const BOT_TOKEN = process.env.BOT_TOKEN
const CHAT_ID = process.env.CHAT_ID
const GITLAB_WEBHOOK_TOKEN = process.env.GITLAB_WEBHOOK_TOKEN
const app = express()
app.use(express.json())

app.post('/gitlabHook', async function (request, response) {
	if (!(request.headers['x-gitlab-token'] == GITLAB_WEBHOOK_TOKEN)) {
		response.status(401).send('Wrong auth token')
		return
	}
	if (request.headers['x-gitlab-event'] == 'Push Hook') {
		const pushInfo = request.body
		// prettier-ignore
		const message = `*\\[[${pushInfo.project.name}](${pushInfo.project.homepage})\\] ${pushInfo.user_name}* pushed ${pushInfo.total_commits_count} commits\n`
		// prettier-ignore
		const commitMessage = `${pushInfo.commits.map((commit) => `• [${commit.message.trim()}](${commit.url})`).join('\n')}`.trim()
		const botResponse = await sendTelegramMessage(message + commitMessage)

		if (!botResponse.ok) {
			const responseBody = botResponse.body.read()
			functions.logger.error(
				'Failed to send telegram message',
				responseBody
			)
			response.status(botResponse.status).end(responseBody)
			return
		}
		response.sendStatus(200)
		return
	}

	response.status(501).send('Not supported gitlab event')
})

function sendTelegramMessage(message: string): Promise<Response> {
	return fetch(
		`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
		{
			method: 'POST',
			body: JSON.stringify({
				chat_id: CHAT_ID,
				text: message,
				parse_mode: 'MarkdownV2',
				disable_web_page_preview: true,
			}),
			headers: { 'Content-Type': 'application/json' },
		}
	)
}
export default app
