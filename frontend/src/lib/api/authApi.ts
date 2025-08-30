import { api } from './api';

const authApi = api.auth;

export const login = async (username: string, password: string, recaptchaToken: string) => {
  const response = await authApi.signin.$post({
    json: { username, password, recaptchaToken },
  });
  return response.json();
};
