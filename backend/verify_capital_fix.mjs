
const API_URL = 'http://localhost:5000/api';

async function verifyCapitalSummary() {
    try {
        console.log('Fetching Capital Summary...');
        const response = await fetch(`${API_URL}/capital/summary`);
        const data = await response.json();

        console.log('Response Status:', response.status);
        console.log('Data:', JSON.stringify(data, null, 2));

        if (data.totalFunding !== undefined && data.totalCapital !== undefined) {
            console.log('SUCCESS: API structure is correct.');
        } else {
            console.error('FAILURE: API structure missing required fields.');
        }

    } catch (error) {
        console.error('Test Failed:', error);
    }
}

verifyCapitalSummary();
