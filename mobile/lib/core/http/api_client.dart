import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:http/http.dart' as http;

import '../config/app_config.dart';
import '../errors/app_error.dart';
import '../i18n/translator.dart';

typedef TokenProvider = String? Function();

/// Thin JSON client: bearer auth, ProblemDetails -> [AppError].
class ApiClient {
  ApiClient({http.Client? client, String? baseUrl})
      : _client = client ?? http.Client(),
        _baseUrl = baseUrl ?? AppConfig.apiBaseUrl;

  final http.Client _client;
  final String _baseUrl;
  TokenProvider? _token;

  /// Called when the server answers 401 (session expired).
  void Function()? onUnauthorized;

  void bindToken(TokenProvider token) => _token = token;

  Uri _uri(String path, [Map<String, String>? query]) =>
      Uri.parse('$_baseUrl$path').replace(queryParameters: query);

  Map<String, String> get _headers {
    final token = _token?.call();
    return {
      'Accept': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  Future<dynamic> get(String path, {Map<String, String>? query}) =>
      _send(() => _client.get(_uri(path, query), headers: _headers));

  Future<dynamic> post(String path, Object? body) => _send(() => _client.post(
        _uri(path),
        headers: {..._headers, 'Content-Type': 'application/json'},
        body: jsonEncode(body),
      ));

  Future<dynamic> put(String path, Object? body) => _send(() => _client.put(
        _uri(path),
        headers: {..._headers, 'Content-Type': 'application/json'},
        body: jsonEncode(body),
      ));

  Future<dynamic> delete(String path) =>
      _send(() => _client.delete(_uri(path), headers: _headers));

  /// Uploads a file as multipart/form-data under the `file` field.
  Future<dynamic> upload(String path, String filePath) => _send(() async {
        final request = http.MultipartRequest('POST', _uri(path))
          ..headers.addAll(_headers)
          ..files.add(await http.MultipartFile.fromPath('file', filePath));
        return http.Response.fromStream(await _client.send(request));
      });

  Future<dynamic> _send(Future<http.Response> Function() call) async {
    final http.Response response;
    try {
      response = await call().timeout(const Duration(seconds: 30));
    } on SocketException {
      throw AppError(tr('common.noConnection'));
    } on TimeoutException {
      throw AppError(tr('common.noConnection'));
    } on http.ClientException {
      throw AppError(tr('common.noConnection'));
    }

    if (response.statusCode >= 200 && response.statusCode < 300) {
      if (response.body.isEmpty) return null;
      return jsonDecode(utf8.decode(response.bodyBytes));
    }
    if (response.statusCode == 401) onUnauthorized?.call();
    throw _toError(response);
  }

  AppError _toError(http.Response response) {
    try {
      final json = jsonDecode(utf8.decode(response.bodyBytes));
      if (json is Map<String, dynamic>) {
        final errors = <String, List<String>>{};
        final raw = json['errors'];
        if (raw is Map<String, dynamic>) {
          raw.forEach((key, value) {
            if (value is List) errors[key] = value.map((e) => '$e').toList();
          });
        }
        final detail = '${json['detail'] ?? json['title'] ?? ''}';
        if (detail.isNotEmpty) {
          return AppError(detail, status: response.statusCode, fieldErrors: errors);
        }
      }
    } on FormatException {
      // fall through to the generic message
    }
    return AppError(
      response.statusCode == 401
          ? tr('common.sessionExpired')
          : 'Error ${response.statusCode}',
      status: response.statusCode,
    );
  }
}
