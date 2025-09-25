import { PricingService } from '@/domain/services/pricing-service';
import { env } from '@/shared/config/env';

export class RandomPricingService implements PricingService {
  calculatePrice(): number {
    let { min, max } = env.pricing;

    if (min <= 0) {
      min = 0.01;
    }

    if (max < min) {
      max = min;
    }

    const price = Math.random() * (max - min) + min;

    return Number(price.toFixed(2));
  }
}

export const randomPricingService = new RandomPricingService();
