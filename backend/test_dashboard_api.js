
try {
    const response = await fetch('http://localhost:5000/api/dashboard/summary');
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log('Dashboard Summary Data:', JSON.stringify(data, null, 2));
} catch (error) {
    console.error('Error fetching dashboard summary:', error);
}
