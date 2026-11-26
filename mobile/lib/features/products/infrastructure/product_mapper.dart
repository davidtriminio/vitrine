import '../domain/product.dart';

/// DTO -> domain model.
Product productFromDto(Map<String, dynamic> dto) {
  final price = dto['price'] as Map<String, dynamic>;
  final attributes = (dto['attributes'] as List<dynamic>? ?? const [])
      .cast<Map<String, dynamic>>()
      .map((a) => ProductAttribute(key: a['key'] as String, value: a['value'] as String))
      .toList();
  return Product(
    id: dto['id'] as String,
    name: dto['name'] as String,
    sku: dto['sku'] as String,
    description: (dto['description'] as String?) ?? '',
    categoryId: dto['categoryId'] as String,
    categoryName: (dto['categoryName'] as String?) ?? '',
    images: (dto['images'] as List<dynamic>? ?? const []).cast<String>(),
    attributes: attributes,
    basePrice: (price['basePrice'] as num).toDouble(),
    finalPrice: (price['finalPrice'] as num).toDouble(),
    hasDiscount: price['hasDiscount'] as bool,
    isActive: dto['isActive'] as bool,
  );
}

ProductPage productPageFromDto(Map<String, dynamic> dto) => ProductPage(
      items: (dto['items'] as List<dynamic>)
          .cast<Map<String, dynamic>>()
          .map(productFromDto)
          .toList(),
      page: dto['page'] as int,
      totalPages: dto['totalPages'] as int,
    );

/// Domain draft -> request DTO.
Map<String, dynamic> productDraftToDto(ProductDraft draft) => {
      'name': draft.name,
      'sku': draft.sku,
      'description': draft.description,
      'categoryId': draft.categoryId,
      'basePrice': draft.basePrice,
      'images': draft.images,
      'attributes': draft.attributes
          .map((a) => {'key': a.key, 'value': a.value})
          .toList(),
      'isActive': draft.isActive,
    };
