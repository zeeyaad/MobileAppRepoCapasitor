import axios from 'axios';

async function testImage() {
    try {
        const url = 'http://localhost:3000/uploads/personal_photo-1771834501837-89984212.png';
        console.log(`Checking image: ${url}`);
        const res = await axios.get(url, { responseType: 'arraybuffer' });
        console.log('Status:', res.status);
        console.log('Content-Type:', res.headers['content-type']);
        console.log('Size:', res.data.byteLength);
    } catch (err) {
        console.error('Error fetching image:', err.message);
    }
}

testImage();
