import { Injectable } from '@nestjs/common';

@Injectable()
export class EventsService {
  processEvent(data: any): any {
    // Xử lý logic sự kiện tại đây
    return { status: 'success', receivedData: data };
  }
}