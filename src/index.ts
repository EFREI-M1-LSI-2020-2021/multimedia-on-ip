require("dotenv").config();
import { SessionsClient } from '@google-cloud/dialogflow';
import { v4 } from 'uuid';
const RainbowSDK = require('rainbow-node-sdk');

const options = {
  rainbow: {
    host: "sandbox"
  },
  credentials: {
    login: process.env.LOGIN,
    password: process.env.PASSWORD
  },
  application: {
    appID: process.env.ID,
    appSecret: process.env.APP_SECRET
  },
  logs: {
    enableConsoleLogs: true,              
    enableFileLogs: false,                
    file: {
      path: '/var/tmp/rainbowsdk/',
      level: 'debug'                    
    }
  },
  im: {
    sendReadReceipt: true   
  }
}

const projectId = process.env.PROJECT_ID;
const credentials_file_path = './small_talk.json';
const sessionId = v4();

const rainbowSDK = new RainbowSDK(options);

rainbowSDK.start().then( () => {
  console.log("Started...");
});

rainbowSDK.events.on('rainbow_onmessagereceived', async (msg) => {
  const response = await runSample(projectId, msg.content);
  rainbowSDK.im.sendMessageToJid(response, msg.fromJid);
});

async function runSample(projectId: string, query: string) {
  const languageCode = "en-US";

  const sessionClient = new SessionsClient({
    projectId,
    keyFilename: credentials_file_path,
  });

  const sessionPath = sessionClient.projectAgentSessionPath(projectId, sessionId);

  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: query,
        languageCode: languageCode,
      },
    },
  };

  const responses = await sessionClient.detectIntent(request);

  const result = responses[0].queryResult;

  console.log(`Query: ${result.queryText}`);
  console.log(`Response: ${result.fulfillmentText}`);

  return result.fulfillmentText;
}
