import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'RTN AXIOME API — Un accès. Toute l’usine.';
  }
}
