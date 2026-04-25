
import axios from 'axios';
import * as fs from 'fs';

async function testApi() {
    try {
        const res = await axios.get('http://localhost:3000/api/register/team-member/details/22');
        fs.writeFileSync('api-response.json', JSON.stringify(res.data, null, 2));
        console.log('Output written to api-response.json');
    } catch (err: any) {
        fs.writeFileSync('api-response.json', JSON.stringify(err.response?.data || { error: err.message }, null, 2));
    }
}

testApi();
