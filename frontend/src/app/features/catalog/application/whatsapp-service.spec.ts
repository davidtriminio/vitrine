import { describe, expect, it } from 'vitest';
import { Product } from '../domain/catalog-models';
import { WhatsappService } from './whatsapp-service';

function buildProduct(): Product {
  return {
    id: 'p1',
    name: 'Ramo primaveral',
    sku: 'FLR-001',
    description: '',
    categoryId: 'c1',
    categoryName: 'Ramos',
    images: ['https://img/1.jpg'],
    attributes: [{ key: 'Color', value: 'Rosa' }],
    price: {
      currency: 'LPS',
      basePrice: 850,
      finalPrice: 722.5,
      savings: 127.5,
      hasDiscount: true,
      appliedOffer: null,
    },
    isActive: true,
  };
}

describe('WhatsappService', () => {
  const service = new WhatsappService();

  it('builds a wa.me link to the given number', () => {
    const link = service.buildLink('50499998888', buildProduct(), '');
    expect(link.startsWith('https://wa.me/50499998888?text=')).toBe(true);
  });

  it('includes name, sku, attributes and the custom note', () => {
    const link = service.buildLink('50499998888', buildProduct(), 'Para el sábado');
    const text = decodeURIComponent(link.split('text=')[1]);
    expect(text).toContain('Ramo primaveral (FLR-001)');
    expect(text).toContain('Color: Rosa');
    expect(text).toContain('Para el sábado');
  });
});
