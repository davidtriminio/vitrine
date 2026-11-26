import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';

import '../../core/errors/app_error.dart';
import '../../core/i18n/translator.dart';
import '../../core/theme/app_tokens.dart';

/// Shows a transient message at the bottom of the screen.
void showMessage(BuildContext context, String message, {bool isError = false}) {
  final messenger = ScaffoldMessenger.of(context);
  messenger
    ..hideCurrentSnackBar()
    ..showSnackBar(SnackBar(
      content: Text(message),
      backgroundColor: isError ? context.tokens.danger : null,
    ));
}

Future<bool> confirmDelete(BuildContext context, String name) async {
  final result = await showDialog<bool>(
    context: context,
    builder: (ctx) => AlertDialog(
      content: Text(tr('common.confirmDelete', params: {'name': name})),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(ctx, false),
          child: Text(tr('common.cancel')),
        ),
        FilledButton(
          style: FilledButton.styleFrom(backgroundColor: ctx.tokens.danger),
          onPressed: () => Navigator.pop(ctx, true),
          child: Text(tr('common.delete')),
        ),
      ],
    ),
  );
  return result ?? false;
}

class ErrorView extends StatelessWidget {
  const ErrorView({super.key, required this.error, required this.onRetry});

  final AppError error;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) => Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.error_outline, size: 40, color: context.tokens.danger),
              const SizedBox(height: 12),
              Text(error.message, textAlign: TextAlign.center),
              const SizedBox(height: 12),
              OutlinedButton(onPressed: onRetry, child: Text(tr('common.retry'))),
            ],
          ),
        ),
      );
}

class EmptyView extends StatelessWidget {
  const EmptyView({super.key});

  @override
  Widget build(BuildContext context) => Center(
        child: Text(
          tr('common.empty'),
          style: TextStyle(color: context.tokens.fgMuted),
        ),
      );
}

/// Square network thumbnail with a neutral placeholder.
class ImageThumb extends StatelessWidget {
  const ImageThumb({super.key, required this.url, this.size = 56});

  final String? url;
  final double size;

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    final placeholder = Container(
      width: size,
      height: size,
      color: t.surface2,
      child: Icon(Icons.image_outlined, color: t.fgMuted),
    );
    return ClipRRect(
      borderRadius: BorderRadius.circular(10),
      child: url == null || url!.isEmpty
          ? placeholder
          : CachedNetworkImage(
              imageUrl: url!,
              width: size,
              height: size,
              fit: BoxFit.cover,
              errorWidget: (_, _, _) => placeholder,
              placeholder: (_, _) => placeholder,
            ),
    );
  }
}

String formatLps(num value) => 'L ${value.toStringAsFixed(2)}';

String formatDate(DateTime date) {
  final d = date.toLocal();
  String two(int n) => n.toString().padLeft(2, '0');
  return '${two(d.day)}/${two(d.month)}/${d.year}';
}

String? requiredValidator(String? value) =>
    value == null || value.trim().isEmpty ? tr('common.required') : null;
