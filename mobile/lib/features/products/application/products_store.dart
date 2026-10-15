import 'package:flutter/foundation.dart';

import '../../../core/errors/app_error.dart';
import '../domain/product.dart';
import '../infrastructure/product_repository.dart';

class ProductsStore extends ChangeNotifier {
  ProductsStore(this._repo);

  final ProductRepository _repo;

  List<Product> _items = const [];
  int _page = 0;
  bool _hasMore = false;
  bool _loading = false;
  String _search = '';
  AppError? _error;

  List<Product> get items => _items;
  bool get hasMore => _hasMore;
  bool get loading => _loading;
  String get search => _search;
  AppError? get error => _error;

  ProductRepository get repository => _repo;

  Future<void> load({String? search}) async {
    if (search != null) _search = search;
    _page = 0;
    _items = const [];
    await _loadNext();
  }

  Future<void> loadMore() async {
    if (_loading || !_hasMore) return;
    await _loadNext();
  }

  Future<void> _loadNext() async {
    _loading = true;
    _error = null;
    notifyListeners();
    try {
      final result = await _repo.list(page: _page + 1, search: _search);
      _items = [..._items, ...result.items];
      _page = result.page;
      _hasMore = result.hasMore;
    } on AppError catch (e) {
      _error = e;
    } finally {
      _loading = false;
      notifyListeners();
    }
  }

  Future<void> save({String? id, required ProductDraft draft}) async {
    if (id == null) {
      await _repo.create(draft);
    } else {
      await _repo.update(id, draft);
    }
    await load();
  }

  Future<void> remove(String id) async {
    await _repo.delete(id);
    await load();
  }
}
