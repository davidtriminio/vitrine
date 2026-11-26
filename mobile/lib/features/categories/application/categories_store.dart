import 'package:flutter/foundation.dart';

import '../../../core/errors/app_error.dart';
import '../domain/category.dart';
import '../infrastructure/category_repository.dart';

class CategoriesStore extends ChangeNotifier {
  CategoriesStore(this._repo);

  final CategoryRepository _repo;

  List<CatalogCategory> _items = const [];
  bool _loading = false;
  AppError? _error;

  List<CatalogCategory> get items => _items;
  bool get loading => _loading;
  AppError? get error => _error;

  Future<void> load() async {
    _loading = true;
    _error = null;
    notifyListeners();
    try {
      _items = await _repo.list();
    } on AppError catch (e) {
      _error = e;
    } finally {
      _loading = false;
      notifyListeners();
    }
  }

  Future<void> save({String? id, required String name, required String slug}) async {
    if (id == null) {
      await _repo.create(name, slug);
    } else {
      await _repo.update(id, name, slug);
    }
    await load();
  }

  Future<void> remove(String id) async {
    await _repo.delete(id);
    await load();
  }
}
