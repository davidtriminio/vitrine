import 'package:flutter/material.dart';

/// Semantic color tokens. Widgets read these, never raw colors, so a rebrand
/// only changes this table (or the brand overrides from `/api/v1/settings`).
@immutable
class AppTokens extends ThemeExtension<AppTokens> {
  const AppTokens({
    required this.surface,
    required this.surface2,
    required this.muted,
    required this.fg,
    required this.fgMuted,
    required this.primary,
    required this.primaryStrong,
    required this.primaryFg,
    required this.accent,
    required this.danger,
  });

  final Color surface;
  final Color surface2;
  final Color muted;
  final Color fg;
  final Color fgMuted;
  final Color primary;
  final Color primaryStrong;
  final Color primaryFg;
  final Color accent;
  final Color danger;

  static const AppTokens base = AppTokens(
    surface: Color(0xFFFAF7F5),
    surface2: Color(0xFFF2EBE7),
    muted: Color(0xFFDBD4D1),
    fg: Color(0xFF2C2724),
    fgMuted: Color(0xFF6B615C),
    primary: Color(0xFFF099BE),
    primaryStrong: Color(0xFFC85688),
    primaryFg: Color(0xFF2C2724),
    accent: Color(0xFF8DA33C),
    danger: Color(0xFFB3261E),
  );

  /// Applies brand overrides (`#rrggbb` keyed by kebab-case token name).
  AppTokens withOverrides(Map<String, String> overrides) {
    Color pick(String key, Color fallback) {
      final raw = overrides[key];
      if (raw == null) return fallback;
      final hex = raw.replaceFirst('#', '');
      if (hex.length != 6) return fallback;
      final value = int.tryParse('FF$hex', radix: 16);
      return value == null ? fallback : Color(value);
    }

    return AppTokens(
      surface: pick('surface', surface),
      surface2: pick('surface-2', surface2),
      muted: pick('muted', muted),
      fg: pick('fg', fg),
      fgMuted: pick('fg-muted', fgMuted),
      primary: pick('primary', primary),
      primaryStrong: pick('primary-strong', primaryStrong),
      primaryFg: pick('primary-fg', primaryFg),
      accent: pick('accent', accent),
      danger: danger,
    );
  }

  @override
  AppTokens copyWith() => this;

  @override
  AppTokens lerp(ThemeExtension<AppTokens>? other, double t) => this;
}

extension AppTokensContext on BuildContext {
  AppTokens get tokens => Theme.of(this).extension<AppTokens>() ?? AppTokens.base;
}
