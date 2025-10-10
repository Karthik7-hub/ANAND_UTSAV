import axios from 'axios';

const API_BASE_URL = 'https://anandnihal.onrender.com';

// Create a reusable Axios instance
const getApiClient = (token) => {
    return axios.create({
        baseURL: API_BASE_URL,
        headers: { Authorization: `Bearer ${token}` },
    });
};

export const fetchConversations = async (token) => {
    const { data } = await getApiClient(token).get('/convo/');
    return data || [];
};

export const fetchMessages = async (conversationId, token) => {
    const { data } = await getApiClient(token).get(`/message/${conversationId}`);
    return data || [];
};

export const sendMessage = async (payload, token) => {
    const { data } = await getApiClient(token).post('/message/', payload);
    return data;
};

export const markConversationAsRead = async (conversationId, token) => {
    await getApiClient(token).put(`/convo/read/${conversationId}`);
};