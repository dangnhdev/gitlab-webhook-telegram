import * as dotenv from 'dotenv'
dotenv.config()

import app from './app'

app.listen(3000, () => {
	console.log('[server]: Server is running at https://localhost:3000')
})
