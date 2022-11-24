import * as functions from 'firebase-functions'
import app from './app'

// if you change function name here, change it in firebase.json too
export const gitlabHookFunction = functions
	.region('asia-southeast1')
	.https.onRequest(app)
