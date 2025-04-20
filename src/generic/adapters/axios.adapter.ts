import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { TelegramService } from 'src/telegram/telegram.service';

export interface HttpAdapter {
  get<T>(url: string): Promise<T | null>;
}

@Injectable()
export class AxiosAdapter implements HttpAdapter {
  private readonly axiosInstance: AxiosInstance;
  private readonly maxRetries: number;

  constructor(private readonly telegramService: TelegramService) {
    this.axiosInstance = axios.create({
      timeout: 10000,
    });
    this.maxRetries = 3;
  }

  async get<T>(url: string, retries: number = 0): Promise<T | null> {
    try {
      const { data } = await this.axiosInstance.get<T>(url);
      return data;
    } catch (error) {
      const responseData = error?.response?.data;

      console.error(
        `Request failed - GET AXIOS, retrying (${retries + 1}/${this.maxRetries})`,
      );
      console.log('Request failed - GET AXIOS: error:', error);

      if (retries < this.maxRetries) {
        return this.get(url, retries + 1);
      }

      console.log(
        `Failed to fetch - GET AXIOS data after ${this.maxRetries} retries`,
      );

      await this.telegramService.sendMessage({
        title: `🚨 GET Request Failed - ${process.env.ENVIROMENT}`,
        content: `Request to ${url} failed after ${this.maxRetries} retries.`,
        error: error.message,
        payload: { url },
      });

      return responseData;
    }
  }

  async post<T>(
    url: string,
    body: unknown,
    headers: unknown,
    retries: number = 0,
  ): Promise<T | null> {
    try {
      const { data } = await this.axiosInstance.post<T>(url, body, headers);
      return data;
    } catch (error) {
      const responseData = error.response?.data;

      console.error(
        `Request failed - POST AXIOS, retrying (${retries + 1}/${this.maxRetries})`,
      );
      console.log('Request failed - POST AXIOS: error:', error);

      if (retries < this.maxRetries) {
        return this.post(url, body, headers, retries + 1);
      }

      console.log(
        `Failed to fetch - POST AXIOS data after ${this.maxRetries} retries`,
      );

      const allTxt =
        responseData?.error?.map((err) => err?.txt).join(', ') || undefined;

      await this.telegramService.sendMessage({
        title: `🚨 POST Request Failed - ${process.env.ENVIROMENT}`,
        content: `Request to ${url} failed after ${this.maxRetries} retries.`,
        error: allTxt || error?.message || 'Error desconocido',
        payload: { url, body },
      });

      return responseData;
    }
  }
}
