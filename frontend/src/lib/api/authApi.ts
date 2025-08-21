import { api } from './api';

const authApi = api.auth;

export const login = async (username: string, password: string) => {
  const response = await authApi.login.$post({
    json: { username, password },
  });
  return response.json();
};
