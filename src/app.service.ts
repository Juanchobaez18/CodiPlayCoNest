import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(myVar): string {
    return myVar;
  }
}
