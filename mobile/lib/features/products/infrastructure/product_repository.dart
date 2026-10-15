import '../../../core/http/api_client.dart';
import '../domain/product.dart';
import 'product_mapper.dart';

class ProductRepository {
  ProductRepository(this._api);

  final ApiClient _api;

  Future<ProductPage> list({int page = 1, int pageSize = 20, String? search}) async {
    final json = await _api.get('/api/v1/products/all', query: {
      'page': '$page',
      'pageSize': '$pageSize',
      if (search != null && search.isNotEmpty) 'search': search,
    }) as Map<String, dynamic>;
    return productPageFromDto(json);
  }

  Future<String> nextSku() async {
    final json = await _api.get('/api/v1/products/next-sku') as Map<String, dynamic>;
    return json['sku'] as String;
  }

  Future<void> create(ProductDraft draft) =>
      _api.post('/api/v1/products', productDraftToDto(draft));

  Future<void> update(String id, ProductDraft draft) =>
      _api.put('/api/v1/products/$id', productDraftToDto(draft));

  Future<void> delete(String id) => _api.delete('/api/v1/products/$id');

  /// Uploads an image file and returns its absolute public URL.
  Future<String> uploadImage(String filePath) async {
    final json = await _api.upload('/api/v1/uploads/image', filePath)
        as Map<String, dynamic>;
    return (json['url'] ?? json['Url']) as String;
  }
}
