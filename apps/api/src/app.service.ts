import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'OTTO System API — Inspired by unity. Driven by security.';
  }
}
