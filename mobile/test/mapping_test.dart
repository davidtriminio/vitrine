import 'package:flutter_test/flutter_test.dart';
import 'package:vitrine_admin/features/offers/domain/offer.dart';
import 'package:vitrine_admin/features/offers/infrastructure/offer_repository.dart';
import 'package:vitrine_admin/features/products/infrastructure/product_mapper.dart';

void main() {
  test('maps a product DTO to the domain model', () {
    final product = productFromDto({
      'id': 'p1',
      'name': 'Ramo',
      'sku': '001',
      'description': null,
      'categoryId': 'c1',
      'categoryName': 'Flores',
      'images': ['http://x/a.jpg'],
      'attributes': [
        {'key': 'color', 'value': 'rojo'}
      ],
      'price': {
        'currency': 'LPS',
        'basePrice': 100,
        'finalPrice': 80.5,
        'savings': 19.5,
        'hasDiscount': true,
      },
      'isActive': true,
    });

    expect(product.description, '');
    expect(product.finalPrice, 80.5);
    expect(product.hasDiscount, isTrue);
    expect(product.firstImage, 'http://x/a.jpg');
    expect(product.attributes.single.key, 'color');
  });

  test('offer DTO round trip keeps discount kind and presentation fields', () {
    final dto = {
      'id': 'o1',
      'name': 'Verano',
      'discountType': 'FixedAmount',
      'value': 25,
      'categoryIds': ['c1'],
      'productIds': <String>[],
      'startsAt': '2026-01-01T00:00:00Z',
      'endsAt': '2026-02-01T00:00:00Z',
      'isActive': true,
      'iconName': 'sun',
      'bannerTitle': 'Hola',
    };

    final offer = offerFromDto(dto);
    expect(offer.kind, DiscountKind.fixedAmount);

    final out = offerToDto(offer);
    expect(out['discountType'], 'FixedAmount');
    expect(out['iconName'], 'sun');
    expect(out['bannerTitle'], 'Hola');
  });
}
