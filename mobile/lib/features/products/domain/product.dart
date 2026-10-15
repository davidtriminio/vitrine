class ProductAttribute {
  const ProductAttribute({required this.key, required this.value});

  final String key;
  final String value;
}

class Product {
  const Product({
    required this.id,
    required this.name,
    required this.sku,
    required this.description,
    required this.categoryId,
    required this.categoryName,
    required this.images,
    required this.attributes,
    required this.basePrice,
    required this.finalPrice,
    required this.hasDiscount,
    required this.isActive,
  });

  final String id;
  final String name;
  final String sku;
  final String description;
  final String categoryId;
  final String categoryName;
  final List<String> images;
  final List<ProductAttribute> attributes;
  final double basePrice;
  final double finalPrice;
  final bool hasDiscount;
  final bool isActive;

  String? get firstImage => images.isEmpty ? null : images.first;
}

/// Editable product payload (create or update).
class ProductDraft {
  const ProductDraft({
    required this.name,
    required this.sku,
    required this.description,
    required this.categoryId,
    required this.basePrice,
    required this.images,
    required this.attributes,
    required this.isActive,
  });

  final String name;
  final String sku;
  final String description;
  final String categoryId;
  final double basePrice;
  final List<String> images;
  final List<ProductAttribute> attributes;
  final bool isActive;
}

class ProductPage {
  const ProductPage({
    required this.items,
    required this.page,
    required this.totalPages,
  });

  final List<Product> items;
  final int page;
  final int totalPages;

  bool get hasMore => page < totalPages;
}
