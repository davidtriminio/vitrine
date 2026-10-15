import 'package:flutter/foundation.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import '../errors/app_error.dart';
import '../http/api_client.dart';

/// Session state (token persisted in secure storage) + login/logout.
class AuthStore extends ChangeNotifier {
  AuthStore(this._api, {FlutterSecureStorage? storage})
      : _storage = storage ?? const FlutterSecureStorage() {
    _api.bindToken(() => _token);
    _api.onUnauthorized = () {
      if (_token != null) logout();
    };
  }

  static const _tokenKey = 'vitrine.token';
  static const _userKey = 'vitrine.user';
  static const _expiryKey = 'vitrine.expires';

  final ApiClient _api;
  final FlutterSecureStorage _storage;

  String? _token;
  String? _username;
  bool _ready = false;
  bool _busy = false;
  AppError? _error;

  bool get isReady => _ready;
  bool get isAuthenticated => _token != null;
  bool get busy => _busy;
  String? get username => _username;
  AppError? get error => _error;

  Future<void> restore() async {
    try {
      final token = await _storage.read(key: _tokenKey);
      final expiry = DateTime.tryParse(await _storage.read(key: _expiryKey) ?? '');
      if (token != null && expiry != null && expiry.isAfter(DateTime.now())) {
        _token = token;
        _username = await _storage.read(key: _userKey);
      }
    } catch (_) {
      // Secure storage unavailable: start signed out.
    }
    _ready = true;
    notifyListeners();
  }

  Future<bool> login(String username, String password) async {
    _busy = true;
    _error = null;
    notifyListeners();
    try {
      final json = await _api.post('/api/v1/auth/login', {
        'username': username,
        'password': password,
      }) as Map<String, dynamic>;
      _token = json['token'] as String;
      _username = json['username'] as String;
      await _storage.write(key: _tokenKey, value: _token);
      await _storage.write(key: _userKey, value: _username);
      await _storage.write(key: _expiryKey, value: json['expiresAt'] as String);
      return true;
    } on AppError catch (e) {
      _error = e;
      return false;
    } finally {
      _busy = false;
      notifyListeners();
    }
  }

  Future<void> changePassword(String current, String next) async {
    await _api.post('/api/v1/auth/change-password', {
      'currentPassword': current,
      'newPassword': next,
    });
  }

  Future<void> logout() async {
    _token = null;
    _username = null;
    try {
      await _storage.deleteAll();
    } catch (_) {}
    notifyListeners();
  }
}
