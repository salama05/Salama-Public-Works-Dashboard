
const API_URL = 'http://localhost:5000/api';

async function seedAndVerify() {
    try {
        console.log('1. Seeding Capital...');
        await fetch(`${API_URL}/capital`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                openingBalance: 1000,
                openingDate: new Date(),
                currency: 'DZD'
            })
        });

        console.log('2. Seeding Funding...');
        await fetch(`${API_URL}/funding`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                date: new Date(),
                amount: 500,
                paymentMethod: 'cash',
                notes: 'Test Funding'
            })
        });

        console.log('3. Fetching Summary...');
        const response = await fetch(`${API_URL}/capital/summary`);
        const data = await response.json();

        console.log('Summary:', JSON.stringify(data, null, 2));

        // Expect: 1000 (opening) + 500 (funding) = 1500 totalCapital
        // funding = 500
        if (data.totalFunding === 500 && data.totalCapital === 1500) {
            console.log('SUCCESS: Aggregation worked correctly.');
        } else {
            console.error('FAILURE: Calculation incorrect.');
        }

    } catch (error) {
        console.error('Test Failed:', error);
    }
}

seedAndVerify();
