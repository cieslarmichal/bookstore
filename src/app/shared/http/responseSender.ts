import { Response } from 'express';

export class ResponseSender {
  public static sendJsonDataWithCode(
    response: Response,
    data: any,
    statusCode: number,
  ): void {
    const json = this.transformDataToJson(data);

    response.setHeader('Content-Type', 'application/json');

    response.status(statusCode).send(json);
  }

  public static sendJsonData(response: Response, data: any): void {
    this.sendJsonDataWithCode(response, data, 200);
  }

  public static sendEmpty(response: Response): void {
    response.send();
  }

  private static transformDataToJson(data: any): string {
    return JSON.stringify(data, (key, value) => {
      if (value !== null) return value;
    });
  }
}
