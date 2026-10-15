# Vitrine Admin (Flutter)

Mobile admin app for the Vitrine API: manage products (with camera/gallery
photos), categories and offers, and change the admin password. The public
storefront stays in the web app; customers do not install anything.

## Run

```bash
flutter pub get
flutter run --dart-define=VITRINE_API=http://10.0.2.2:5044   # Android emulator -> host API
```

## Quality gates

```bash
flutter analyze
flutter test
```

## Structure

`lib/core` (config, http, auth, i18n `es.dart`, theme tokens) and
`lib/features/<feature>/{domain,application,infrastructure,ui}`.
State uses `provider` + `ChangeNotifier`; DTO -> model mapping lives in
`infrastructure`; UI text comes from `core/i18n/es.dart`; colors from
`context.tokens`.
