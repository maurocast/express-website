/***/
/** 
const button = document.getElementById('testButton');

button.addEventListener('click', async () => {
    const result = document.getElementById('result');

    result.textContent = 'Connecting to server...';

    try {
        const response = await fetch('/api/status');

        if (!response.ok) {
            throw new Error('Server returned an error');
        }

        const data = await response.json();

        result.textContent = data.message;

    } catch (error) {
        result.textContent = 'Could not connect to server.';
        console.error(error);
    }
});
*/