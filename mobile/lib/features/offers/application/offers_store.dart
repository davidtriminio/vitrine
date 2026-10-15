import 'package:flutter/foundation.dart';

import '../../../core/errors/app_error.dart';
import '../domain/offer.dart';
import '../infrastructure/offer_repository.dart';

class OffersStore extends ChangeNotifier {
  OffersStore(this._repo);

  final OfferRepository _repo;

  List<Offer> _items = const [];
  bool _loading = false;
  AppError? _error;

  List<Offer> get items => _items;
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

  /// Creates the offer when [isNew], otherwise updates it.
  Future<void> save(Offer offer, {required bool isNew}) async {
    if (isNew) {
      await _repo.create(offer);
    } else {
      await _repo.update(offer);
    }
    await load();
  }

  Future<void> remove(String id) async {
    await _repo.delete(id);
    await load();
  }
}
