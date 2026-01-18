
const API_URL = 'http://localhost:5000/api';

async function runTest() {
    try {
        console.log('1. Adding Supplier...');
        const supplierRes = await fetch(`${API_URL}/suppliers`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'Test Supplier', phone: '1234567890' })
        });
        const supplier = await supplierRes.json();
        console.log('Supplier Added:', supplier._id);

        console.log('2. Adding Purchase...');
        const purchaseRes = await fetch(`${API_URL}/purchases`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                date: new Date(),
                productName: 'Test Product',
                quantity: 10,
                unitPrice: 100,
                totalPrice: 1000,
                supplier: supplier._id,
                paidAmount: 500,
                remainingAmount: 500
            })
        });
        const purchase = await purchaseRes.json();
        console.log('Purchase Added:', purchase._id);

        console.log('3. Fetching Dashboard Summary...');
        const dashboardRes = await fetch(`${API_URL}/dashboard/summary`);
        const dashboard = await dashboardRes.json();

        console.log('Dashboard Stats:');
        console.log('- Total Purchases:', dashboard.purchases.total);
        console.log('- Suppliers Count:', dashboard.counts.suppliers);

        if (dashboard.purchases.total === 1000 && dashboard.counts.suppliers >= 1) {
            console.log('SUCCESS: Dashboard updated correctly!');
        } else {
            console.error('FAILURE: Dashboard stats did not update as expected.');
        }

    } catch (error) {
        console.error('Test Failed:', error);
    }
}

runTest();
