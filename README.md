# Gitlab Webhook to Telegram Example

### Step to run this project
***
- Create a Telegram bot. Get the bot token and chat id of the chat you want to send notification to.
- Duplicate and rename .env.example file in the **functions** folder to .env
- Fill the BOT_TOKEN and CHAT_ID.
- Deploy to firebase functions with `firebase deploy` or run this project locally with `npm start local-server`. 
  See [Useful Command](#useful-command) section if you need a way to get the public link.
  - **Note**: If you deploy to firebase, you will get the function link as `http://domain/gitlabHookFunction`. 
  The `gitlabHookFunction` is the functionName as you set in `index.ts` file, but
  the actual HTTP endpoint to receive gitlab hook was defined in `app.ts` file, in this case is ``https://domain/gitlabHook``
- Go to Gitlab project > Setting > Webhook and fill the link above. Select Push Event and press **Add Webhook**.
- After the webhook was created, press Test > Push Event to test the code.

### Useful Command
***
**Start server locally:**
```
npm run local-server
```

Create a public link to request from Gitlab directly to your local server use [localhost.run](https://localhost.run) service: 
```
ssh -R 80:localhost:3000 localhost.run
```

**Firebase:** 

Start firebase function locally:
```
firebase emulators:start --only functions
```

Deploy:

```
firebase deploy
```
