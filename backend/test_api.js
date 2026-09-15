const FormData = require('form-data');
const fs = require('fs');
const axios = require('axios');

async function testUpload() {
  try {
    const form = new FormData();
    // Create a dummy text file instead of PDF just to see if it hits the parse error fallback
    fs.writeFileSync('dummy.pdf', 'dummy content for pdf');
    form.append('resume', fs.createReadStream('dummy.pdf'));

    const response = await axios.post('http://127.0.0.1:5000/api/upload-resume', form, {
      headers: form.getHeaders(),
    });
    console.log(response.data);
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
}
testUpload();
