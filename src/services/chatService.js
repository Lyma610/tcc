import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

export const chatService = {
  async sendMessage(chatId, message) {
    const response = await axios.post(`${API_URL}/messages`, {
      chatId,
      text: message,
      sender: 'user',
      timestamp: new Date()
    });
    return response.data;
  },

  async getMessages(chatId) {
    const response = await axios.get(`${API_URL}/messages/${chatId}`);
    return response.data;
  },

  async getLastMessages() {
    const response = await axios.get(`${API_URL}/chats/last-messages`);
    return response.data;
  }
};