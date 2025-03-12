import axios from 'axios';


const apiClient = axios.create({
    baseURL: 'http://localhost:8000/',
    withCredentials: true,  // Ensure cookies are sent with each request
  });

export default apiClient