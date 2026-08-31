import { Injectable } from '@angular/core';
import { Product } from '../domain/catalog-models';

/**
 * Builds a wa.me deep link with a pre-filled order message (product name, SKU/id,
 * characteristics, image and the customer's custom note). The destination number is
 * the brand's configurable WhatsApp number — never hardcoded.
 */
@Injectable({ providedIn: 'root' })
export class WhatsappService {
  buildLink(whatsappNumber: string, product: Product, customMessage: string): string {
    const lines: string[] = [];
    lines.push(`Hola, me interesa este producto:`);
    lines.push(`• ${product.name} (${product.sku})`);

    for (const attribute of product.attributes) {
      lines.push(`• ${attribute.key}: ${attribute.value}`);
    }

    lines.push(`• Precio: L ${product.price.finalPrice.toFixed(2)}`);

    if (product.images.length > 0) {
      lines.push(product.images[0]);
    }

    const note = customMessage.trim();
    if (note.length > 0) {
      lines.push('');
      lines.push(note);
    }

    const text = encodeURIComponent(lines.join('\n'));
    return `https://wa.me/${whatsappNumber}?text=${text}`;
  }
}
