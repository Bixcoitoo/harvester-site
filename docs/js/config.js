const config = {
    RECAPTCHA_SITE_KEY: '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI', // Chave de teste
    API_URL: window.location.hostname === 'localhost' 
        ? 'http://localhost:5001'
        : 'https://harvester-api-42f53e6844e5.herokuapp.com'
}; 