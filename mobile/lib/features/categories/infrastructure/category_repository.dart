import '../../../core/http/api_client.dart';
import '../domain/category.dart';

CatalogCategory categoryFromDto(Map<String, dynamic> dto) => CatalogCategory(
      id: dto['id'] as String,
      name: dto['name'] as String,
      slug: dto['slug'] as String,
    );

class CategoryRepository {
  CategoryRepository(this._api);

  final ApiClient _api;

  Future<List<CatalogCategory>> list() async {
    final json = await _api.get('/api/v1/categories') as List<dynamic>;
    return json.cast<Map<String, dynamic>>().map(categoryFromDto).toList();
  }

  Future<void> create(String name, String slug) =>
      _api.post('/api/v1/categories', {'name': name, 'slug': slug});

  Future<void> update(String id, String name, String slug) =>
      _api.put('/api/v1/categories/$id', {'name': name, 'slug': slug});

  Future<void> delete(String id) => _api.delete('/api/v1/categories/$id');
}
