import axios from 'axios';

const api = axios.create({
  baseURL: 'https://harvester-api-three.vercel.app',
  headers: {
    'Content-Type': 'application/json'
  }
});

export default api; 