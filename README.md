**Common Command**
***
Start server locally:
```
npm run local-server
```
Tunnel to test request from Gitlab: 
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
