import 'package:flutter/material.dart';

import 'app_tokens.dart';

ThemeData buildTheme(AppTokens t) {
  final scheme = ColorScheme.fromSeed(seedColor: t.primaryStrong).copyWith(
    primary: t.primaryStrong,
    onPrimary: Colors.white,
    surface: t.surface,
    onSurface: t.fg,
    error: t.danger,
  );
  return ThemeData(
    useMaterial3: true,
    colorScheme: scheme,
    scaffoldBackgroundColor: t.surface,
    extensions: [t],
    appBarTheme: AppBarTheme(
      backgroundColor: t.surface,
      foregroundColor: t.fg,
      elevation: 0,
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: t.surface2,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(color: t.muted),
      ),
    ),
    navigationBarTheme: NavigationBarThemeData(
      backgroundColor: t.surface2,
      indicatorColor: t.primary,
    ),
  );
}
