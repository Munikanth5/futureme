// Script to verify backend routes locally
const http = require('http');

function postJSON(path, data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            data: JSON.parse(body)
          });
        } catch (e) {
          reject(new Error(`Failed to parse response body as JSON: ${body}`));
        }
      });
    });

    req.on('error', (e) => reject(e));
    req.write(postData);
    req.end();
  });
}

async function run() {
  console.log('🧪 Starting API Verification Tests...\n');

  try {
    console.log('1. Testing POST /api/generate-futureme ...');
    const genRes = await postJSON('/api/generate-futureme', {
      name: 'Nitish',
      age: '23',
      goal: 'Build a successful AI startup',
      struggle: 'Lack of consistency',
      oneYearVision: 'Running a profitable AI company',
      tone: 'Brutally Honest'
    });

    console.log(`Status Code: ${genRes.statusCode}`);
    console.log('Response JSON:', JSON.stringify(genRes.data, null, 2));

    if (genRes.statusCode === 200 && genRes.data.success && genRes.data.data.futureIdentity) {
      console.log('✅ POST /api/generate-futureme passed!\n');
    } else {
      throw new Error('Endpoint /api/generate-futureme response is malformed');
    }

    console.log('2. Testing POST /api/chat-futureme ...');
    const chatRes = await postJSON('/api/chat-futureme', {
      userProfile: {
        name: 'Nitish',
        age: '23',
        goal: 'Build a successful AI startup',
        struggle: 'Lack of consistency',
        oneYearVision: 'Running a profitable AI company',
        tone: 'Brutally Honest'
      },
      chatHistory: [
        { role: 'user', message: 'Will I actually make it?' },
        { role: 'futureme', message: 'Only if your daily actions stop negotiating with your dreams.' }
      ],
      question: 'What should I focus on this week?'
    });

    console.log(`Status Code: ${chatRes.statusCode}`);
    console.log('Response JSON:', JSON.stringify(chatRes.data, null, 2));

    if (chatRes.statusCode === 200 && chatRes.data.success && chatRes.data.reply) {
      console.log('✅ POST /api/chat-futureme passed!\n');
      console.log('🎉 All API verification checks completed successfully!');
    } else {
      throw new Error('Endpoint /api/chat-futureme response is malformed');
    }

  } catch (error) {
    console.error('❌ Verification check failed:', error);
    process.exit(1);
  }
}

run();
