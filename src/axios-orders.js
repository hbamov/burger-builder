import axios from 'axios';

const instance = axios.create({
    baseURL: 'https://burger-builder-2a165.firebaseio.com/'
});

export default instance;