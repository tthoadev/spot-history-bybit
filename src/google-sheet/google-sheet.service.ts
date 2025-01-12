import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import { sheets_v4 } from 'googleapis/build/src/apis/sheets';

@Injectable()
export class GoogleSheetService {
  private sheets: sheets_v4.Sheets;

  constructor() {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    this.sheets = google.sheets({ version: 'v4', auth });
  }

  async getSheetNames(spreadsheetId: string): Promise<string[]> {
    try {
      const response = await this.sheets.spreadsheets.get({
        spreadsheetId,
      });

      const sheetNames = response.data.sheets?.map(
        (sheet) => sheet.properties?.title || '',
      );

      return sheetNames || [];
    } catch (error) {
      console.error('Error getting sheet names:', error);
      throw error;
    }
  }

  async appendData(spreadsheetId: string, sheetName: string, data: any[]) {
    try {
      const range = `${sheetName}!A1`;
      const resource = {
        values: data,
      };

      await this.sheets.spreadsheets.values.append({
        spreadsheetId,
        range,
        valueInputOption: 'RAW',
        requestBody: resource,
      });

      console.log(`Data appended successfully to sheet: ${sheetName}`);
    } catch (error) {
      console.error(`Error appending data to sheet ${sheetName}:`, error);
      throw error;
    }
  }

  async getData(spreadsheetId: string, sheetName: string): Promise<string[]> {
    try {
      const range = `${sheetName}!A:A`;
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
      });

      const rows = response.data.values || [];
      return rows.map((row) => row[0]);
    } catch (error) {
      console.error(`Error fetching data from sheet ${sheetName}:`, error);
      throw error;
    }
  }

  async clearSheetData(spreadsheetId: string, sheetName: string) {
    try {
      const range = `${sheetName}!A2:Z`;

      await this.sheets.spreadsheets.values.clear({
        spreadsheetId,
        range,
      });

      console.log(`Sheet ${sheetName} cleared successfully.`);
    } catch (error) {
      console.error(`Error clearing data in sheet ${sheetName}:`, error);
      throw error;
    }
  }
}
