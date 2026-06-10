const fs = require('fs');

async function testUpload() {
  const formData = new FormData();
  const fileBlob = new Blob(['dummy content'], { type: 'text/plain' });
  formData.append('file', fileBlob, 'test.txt');

  try {
    const res = await fetch('http://localhost:8000/api/upload', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer test' // Might fail auth, let's see
      },
      body: formData
    });
    console.log(res.status, await res.text());
  } catch (e) {
    console.error(e);
  }
}

testUpload();
