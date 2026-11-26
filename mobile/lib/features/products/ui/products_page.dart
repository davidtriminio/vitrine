import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../core/errors/app_error.dart';
import '../../../core/i18n/translator.dart';
import '../../../core/theme/app_tokens.dart';
import '../../../shared/widgets/common.dart';
import '../application/products_store.dart';
import '../domain/product.dart';
import 'product_form_page.dart';

class ProductsPage extends StatefulWidget {
  const ProductsPage({super.key});

  @override
  State<ProductsPage> createState() => _ProductsPageState();
}

class _ProductsPageState extends State<ProductsPage> {
  final _scroll = ScrollController();
  final _search = TextEditingController();

  @override
  void initState() {
    super.initState();
    _scroll.addListener(() {
      if (_scroll.position.extentAfter < 300) {
        context.read<ProductsStore>().loadMore();
      }
    });
  }

  @override
  void dispose() {
    _scroll.dispose();
    _search.dispose();
    super.dispose();
  }

  Future<void> _open([Product? product]) => Navigator.of(context).push<void>(
        MaterialPageRoute(builder: (_) => ProductFormPage(product: product)),
      );

  Future<void> _delete(Product product) async {
    final store = context.read<ProductsStore>();
    if (!await confirmDelete(context, product.name) || !mounted) return;
    try {
      await store.remove(product.id);
      if (mounted) showMessage(context, tr('common.deleted'));
    } on AppError catch (e) {
      if (mounted) showMessage(context, e.message, isError: true);
    }
  }

  @override
  Widget build(BuildContext context) {
    final store = context.watch<ProductsStore>();
    return Scaffold(
      appBar: AppBar(title: Text(tr('nav.products'))),
      floatingActionButton: FloatingActionButton(
        tooltip: tr('products.new'),
        onPressed: _open,
        child: const Icon(Icons.add),
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 4, 16, 8),
            child: TextField(
              controller: _search,
              textInputAction: TextInputAction.search,
              decoration: InputDecoration(
                hintText: tr('common.search'),
                prefixIcon: const Icon(Icons.search),
              ),
              onSubmitted: (value) => store.load(search: value.trim()),
            ),
          ),
          Expanded(child: _body(store)),
        ],
      ),
    );
  }

  Widget _body(ProductsStore store) {
    if (store.loading && store.items.isEmpty) {
      return const Center(child: CircularProgressIndicator());
    }
    if (store.error != null && store.items.isEmpty) {
      return ErrorView(error: store.error!, onRetry: store.load);
    }
    if (store.items.isEmpty) return const EmptyView();
    return RefreshIndicator(
      onRefresh: store.load,
      child: ListView.separated(
        controller: _scroll,
        padding: const EdgeInsets.only(bottom: 88),
        itemCount: store.items.length + (store.hasMore ? 1 : 0),
        separatorBuilder: (_, _) => const Divider(height: 1),
        itemBuilder: (context, i) {
          if (i >= store.items.length) {
            return const Padding(
              padding: EdgeInsets.all(16),
              child: Center(child: CircularProgressIndicator()),
            );
          }
          final p = store.items[i];
          final t = context.tokens;
          return ListTile(
            leading: ImageThumb(url: p.firstImage),
            title: Text(p.name, maxLines: 1, overflow: TextOverflow.ellipsis),
            subtitle: Text(
              '${p.sku} · ${p.categoryName}'
              '${p.isActive ? '' : ' · ${tr('common.inactive')}'}',
              style: TextStyle(color: p.isActive ? t.fgMuted : t.danger),
            ),
            trailing: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(
                  formatLps(p.finalPrice),
                  style: const TextStyle(fontWeight: FontWeight.w600),
                ),
                if (p.hasDiscount)
                  Text(
                    formatLps(p.basePrice),
                    style: TextStyle(
                      color: t.fgMuted,
                      decoration: TextDecoration.lineThrough,
                      fontSize: 12,
                    ),
                  ),
              ],
            ),
            onTap: () => _open(p),
            onLongPress: () => _delete(p),
          );
        },
      ),
    );
  }
}
