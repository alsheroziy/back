import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as requestIp from 'request-ip';
import * as geoip from 'geoip-lite';
import axios from 'axios';

@Injectable()
export class GeoLocationMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    const ip = requestIp.getClientIp(req) || '';

    console.log('Client IP:', ip);

    if (ip.startsWith('::1') || ip.startsWith('127.') || ip === '') {
      req['country'] = 'Localhost';
      return next();
    }

    // Local geoip-lite lookup
    const geo = geoip.lookup(ip);

    console.log('Country:', geo);
    if (geo && geo.country) {
      req['country'] = geo.country; // Misol uchun: "UZ", "RU"
      return next();
    }

    // Agar geoip-lite topa olmasa: fallback external API
    try {
      const { data } = await axios.get(`https://ipapi.co/${ip}/json/`);

      if (data && data.country_code) {
        req['country'] = data.country_code; // Misol: "UZ"
      } else {
        req['country'] = 'Unknown';
      }
    } catch (error) {
      console.error('Fallback IP lookup error:', error.message);
      req['country'] = 'Unknown';
    }

    next();
  }
}
