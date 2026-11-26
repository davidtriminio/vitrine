import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../core/errors/app_error.dart';
import '../../../core/i18n/translator.dart';
import '../../../core/theme/app_tokens.dart';
import '../../../shared/widgets/common.dart';
import '../application/offers_store.dart';
import '../domain/offer.dart';
import 'offer_form_page.dart';

class OffersPage extends StatelessWidget {
  const OffersPage({super.key});

  void _open(BuildContext context, [Offer? offer]) {
    Navigator.of(context).push<void>(
      MaterialPageRoute(builder: (_) => OfferFormPage(offer: offer)),
    );
  }

  Future<void> _delete(BuildContext context, Offer offer) async {
    final store = context.read<OffersStore>();
    if (!await confirmDelete(context, offer.name) || !context.mounted) return;
    try {
      await store.remove(offer.id);
      if (context.mounted) showMessage(context, tr('common.deleted'));
    } on AppError catch (e) {
      if (context.mounted) showMessage(context, e.message, isError: true);
    }
  }

  @override
  Widget build(BuildContext context) {
    final store = context.watch<OffersStore>();
    return Scaffold(
      appBar: AppBar(title: Text(tr('nav.offers'))),
      floatingActionButton: FloatingActionButton(
        tooltip: tr('offers.new'),
        onPressed: () => _open(context),
        child: const Icon(Icons.add),
      ),
      body: _body(context, store),
    );
  }

  Widget _body(BuildContext context, OffersStore store) {
    if (store.loading && store.items.isEmpty) {
      return const Center(child: CircularProgressIndicator());
    }
    if (store.error != null && store.items.isEmpty) {
      return ErrorView(error: store.error!, onRetry: store.load);
    }
    if (store.items.isEmpty) return const EmptyView();
    final now = DateTime.now();
    final t = context.tokens;
    return RefreshIndicator(
      onRefresh: store.load,
      child: ListView.separated(
        padding: const EdgeInsets.only(bottom: 88),
        itemCount: store.items.length,
        separatorBuilder: (_, _) => const Divider(height: 1),
        itemBuilder: (context, i) {
          final o = store.items[i];
          final running = o.isRunning(now);
          final label = o.kind == DiscountKind.percentage
              ? '${o.value.toStringAsFixed(o.value % 1 == 0 ? 0 : 1)}%'
              : formatLps(o.value);
          return ListTile(
            leading: CircleAvatar(
              backgroundColor: running ? t.accent : t.muted,
              child: Icon(Icons.local_offer_outlined, color: t.surface),
            ),
            title: Text(o.name),
            subtitle: Text(
              '$label · ${formatDate(o.startsAt)} – ${formatDate(o.endsAt)}'
              ' · ${tr(o.isActive ? 'common.active' : 'common.inactive')}',
            ),
            onTap: () => _open(context, o),
            onLongPress: () => _delete(context, o),
          );
        },
      ),
    );
  }
}
