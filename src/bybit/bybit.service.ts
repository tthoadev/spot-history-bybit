import { Injectable } from '@nestjs/common';
import * as ccxt from 'ccxt';
import { Cron } from '@nestjs/schedule';
import { GoogleSheetService } from 'src/google-sheet/google-sheet.service';

@Injectable()
export class BybitService {
  private bybit: ccxt.bybit;

  constructor(private readonly googleSheetService: GoogleSheetService) {
    this.bybit = new ccxt.bybit({
      apiKey: process.env.BYBIT_API_KEY,
      secret: process.env.BYBIT_API_SECRET,
    });
  }

  @Cron('*/1 * * * *')
  async handleCron() {
    console.log('Running cron job for multiple symbols.');

    const spreadsheetId = process.env.SPREAD_SHEET_ID;

    const sheetNames =
      await this.googleSheetService.getSheetNames(spreadsheetId);

    for (const symbol of sheetNames) {
      console.log(`Processing symbol: ${symbol}`);
      try {
        await this.getAndUploadOrderHistory(symbol, spreadsheetId, symbol);
      } catch (error) {
        console.error(`Error processing symbol ${symbol}:`, error);
      }
    }
  }

  async getAndUploadOrderHistory(
    symbol: string,
    spreadsheetId: string,
    sheetName: string,
  ) {
    try {
      await this.bybit.loadMarkets();

      const openOrders = await this.bybit.fetchOpenOrders(symbol);
      const closedOrders = await this.bybit.fetchClosedOrders(symbol);
      // const canceledOrders = await this.bybit.fetchCanceledOrders(symbol);

      const orders = [...openOrders, ...closedOrders];

      const mappedData = orders.map((order) => [
        order.id, // Order ID
        order.symbol, // Symbol (e.g., BTC/USDT)
        order.type, // Type (limit, market, etc.)
        order.side, // Side (buy, sell)
        order.status, // Status (open, closed, canceled)
        order.price, // Price
        order.amount, // Amount
        order.filled, // Filled
        order.cost, // Cost
        order.timestamp, // Timestamp
      ]);

      await this.googleSheetService.clearSheetData(spreadsheetId, sheetName);

      const newDataWithHeader = [
        // [
        //   'Order ID',
        //   'Symbol',
        //   'Type',
        //   'Side',
        //   'Status',
        //   'Price',
        //   'Amount',
        //   'Filled',
        //   'Cost',
        //   'Timestamp',
        // ],
        ...mappedData,
      ];

      await this.googleSheetService.appendData(
        spreadsheetId,
        sheetName,
        newDataWithHeader,
      );

      console.log(`New orders uploaded successfully for ${symbol}.`);
    } catch (error) {
      console.error(
        `Error fetching or uploading order history for ${symbol}:`,
        error,
      );
      throw error;
    }
  }
}
