import fetch from 'node-fetch';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import type {
  SplitserConfig,
  CreateExpenseRequest,
  ListQueryParams,
  SplitserList,
  Expense
} from './types.js';

const CONFIG_DIR = join(homedir(), '.splitser');
const CONFIG_FILE = join(CONFIG_DIR, 'config.json');

export class SplitserClient {
  private baseUrl = 'https://app.splitser.com/api';
  private config: SplitserConfig | null = null;
  private sessionCookie: string | null = null;

  constructor() {
    this.loadConfig();
  }

  /**
   * Initialize the client with credentials
   */
  async init(email: string, password: string): Promise<void> {
    this.config = { email, password };
    await this.signIn();
    this.saveConfig();
  }

  /**
   * Load saved configuration from disk
   */
  private loadConfig(): void {
    try {
      if (existsSync(CONFIG_FILE)) {
        const data = readFileSync(CONFIG_FILE, 'utf-8');
        this.config = JSON.parse(data);
        this.sessionCookie = this.config?.sessionCookie || null;
      }
    } catch (error) {
      console.warn('Could not load config:', error);
    }
  }

  /**
   * Save configuration to disk
   */
  private saveConfig(): void {
    try {
      if (!existsSync(CONFIG_DIR)) {
        mkdirSync(CONFIG_DIR, { recursive: true });
      }
      
      const configToSave = {
        ...this.config,
        sessionCookie: this.sessionCookie
      };
      
      writeFileSync(CONFIG_FILE, JSON.stringify(configToSave, null, 2));
      console.log(`Configuration saved to ${CONFIG_FILE}`);
    } catch (error) {
      console.error('Could not save config:', error);
    }
  }

  /**
   * Get common headers for API requests
   */
  private getHeaders(includeAuth: boolean = true): Record<string, string> {
    const headers: Record<string, string> = {
      'accept': 'application/json',
      'accept-language': 'en',
      'accept-version': '11',
      'cache-control': 'no-cache',
      'content-type': 'application/json',
      'origin': 'https://app.splitser.com',
      'x-app-react': 'true',
      'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    };

    if (includeAuth && this.sessionCookie) {
      headers['cookie'] = `_wbw_rails_session=${this.sessionCookie}`;
    }

    return headers;
  }

  /**
   * Sign in and obtain session cookie
   */
  async signIn(): Promise<void> {
    if (!this.config) {
      throw new Error('Client not initialized. Call init() first.');
    }

    const response = await fetch(`${this.baseUrl}/users/sign_in`, {
      method: 'POST',
      headers: this.getHeaders(false),
      body: JSON.stringify({
        user: {
          email: this.config.email,
          password: this.config.password
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Sign in failed: ${response.status} ${response.statusText}`);
    }

    // Extract session cookie from Set-Cookie header
    const cookies = response.headers.raw()['set-cookie'];
    if (cookies) {
      const sessionCookie = cookies.find(c => c.startsWith('_wbw_rails_session='));
      if (sessionCookie) {
        this.sessionCookie = sessionCookie.split(';')[0].replace('_wbw_rails_session=', '');
        this.saveConfig();
      }
    }

    console.log('Successfully signed in to Splitser');
  }

  /**
   * Get lists with optional filtering and pagination
   */
  async getLists(params?: ListQueryParams): Promise<SplitserList[]> {
    const queryParams = new URLSearchParams();
    
    if (params?.page !== undefined) {
      queryParams.append('page', params.page.toString());
    }
    if (params?.per_page !== undefined) {
      queryParams.append('per_page', params.per_page.toString());
    }
    if (params?.filter?.archived !== undefined) {
      queryParams.append('filter[archived]', params.filter.archived.toString());
    }

    const url = `${this.baseUrl}/lists?${queryParams.toString()}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders()
    });

    if (!response.ok) {
      throw new Error(`Get lists failed: ${response.status} ${response.statusText}`);
    }

    return await response.json() as SplitserList[];
  }

  /**
   * Create a new expense in a list
   */
  async createExpense(listId: string, expense: Expense): Promise<any> {
    const response = await fetch(`${this.baseUrl}/lists/${listId}/expenses`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ expense })
    });

    if (!response.ok) {
      throw new Error(`Create expense failed: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Upload an image for an expense
   */
  async uploadExpenseImage(expenseId: string, imagePath: string): Promise<any> {
    const FormData = (await import('form-data')).default;
    const fs = await import('fs');
    
    const form = new FormData();
    form.append('image', fs.createReadStream(imagePath));

    const headers = this.getHeaders();
    delete headers['content-type']; // Let form-data set the content-type with boundary

    const response = await fetch(`${this.baseUrl}/expenses/${expenseId}/image`, {
      method: 'PATCH',
      headers: {
        ...headers,
        'cookie': `_wbw_rails_session=${this.sessionCookie}`
      },
      body: form as any
    });

    if (!response.ok) {
      throw new Error(`Upload image failed: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Helper to create money amount object
   */
  static createAmount(dollars: number, currency: string = 'USD') {
    return {
      fractional: Math.round(dollars * 100),
      currency
    };
  }

  /**
   * Helper to generate UUID v4
   */
  static generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}
