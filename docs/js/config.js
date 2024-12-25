const configs = {
    development: {
        API_URL: 'http://localhost:8080/api/v1',
        RECAPTCHA_SITE_KEY: '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'
    },
    staging: {
        API_URL: 'https://harvester-api.herokuapp.com/api/v1',
        RECAPTCHA_SITE_KEY: '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'
    },
    production: {
        API_URL: 'https://api.harvesterdownloader.site/api/v1',
        RECAPTCHA_SITE_KEY: '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'
    }
};

const ENV = process.env.NODE_ENV || 'development';
export const { API_URL, RECAPTCHA_SITE_KEY } = configs[ENV]; 