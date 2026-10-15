/// API base URL, overridable at build time with `--dart-define=VITRINE_API=...`.
class AppConfig {
  const AppConfig._();

  static const String apiBaseUrl = String.fromEnvironment(
    'VITRINE_API',
    defaultValue: 'http://10.0.2.2:5044',
  );
}
