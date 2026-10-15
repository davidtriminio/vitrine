import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../core/errors/app_error.dart';
import '../../../core/i18n/translator.dart';
import '../../../core/theme/app_tokens.dart';
import '../../../shared/widgets/common.dart';
import '../application/categories_store.dart';
import '../domain/category.dart';

class CategoriesPage extends StatelessWidget {
  const CategoriesPage({super.key});

  Future<void> _openForm(BuildContext context, [CatalogCategory? category]) async {
    final store = context.read<CategoriesStore>();
    final name = TextEditingController(text: category?.name ?? '');
    final slug = TextEditingController(text: category?.slug ?? '');
    final formKey = GlobalKey<FormState>();

    final saved = await showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      builder: (ctx) => Padding(
        padding: EdgeInsets.fromLTRB(
          20,
          20,
          20,
          20 + MediaQuery.of(ctx).viewInsets.bottom,
        ),
        child: Form(
          key: formKey,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(
                tr(category == null ? 'categories.new' : 'categories.edit'),
                style: Theme.of(ctx).textTheme.titleLarge,
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: name,
                decoration: InputDecoration(labelText: tr('categories.name')),
                validator: requiredValidator,
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: slug,
                decoration: InputDecoration(labelText: tr('categories.slug')),
                validator: requiredValidator,
              ),
              const SizedBox(height: 16),
              FilledButton(
                onPressed: () {
                  if (formKey.currentState!.validate()) Navigator.pop(ctx, true);
                },
                child: Text(tr('common.save')),
              ),
            ],
          ),
        ),
      ),
    );

    if (saved != true || !context.mounted) return;
    try {
      await store.save(
        id: category?.id,
        name: name.text.trim(),
        slug: slug.text.trim(),
      );
      if (context.mounted) showMessage(context, tr('common.saved'));
    } on AppError catch (e) {
      if (context.mounted) showMessage(context, e.message, isError: true);
    }
  }

  Future<void> _delete(BuildContext context, CatalogCategory category) async {
    final store = context.read<CategoriesStore>();
    if (!await confirmDelete(context, category.name) || !context.mounted) return;
    try {
      await store.remove(category.id);
      if (context.mounted) showMessage(context, tr('common.deleted'));
    } on AppError catch (e) {
      if (context.mounted) showMessage(context, e.message, isError: true);
    }
  }

  @override
  Widget build(BuildContext context) {
    final store = context.watch<CategoriesStore>();
    return Scaffold(
      appBar: AppBar(title: Text(tr('nav.categories'))),
      floatingActionButton: FloatingActionButton(
        tooltip: tr('categories.new'),
        onPressed: () => _openForm(context),
        child: const Icon(Icons.add),
      ),
      body: _body(context, store),
    );
  }

  Widget _body(BuildContext context, CategoriesStore store) {
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
        padding: const EdgeInsets.only(bottom: 88),
        itemCount: store.items.length,
        separatorBuilder: (_, _) => const Divider(height: 1),
        itemBuilder: (context, i) {
          final category = store.items[i];
          return ListTile(
            title: Text(category.name),
            subtitle: Text(category.slug),
            onTap: () => _openForm(context, category),
            trailing: IconButton(
              tooltip: tr('common.delete'),
              icon: Icon(Icons.delete_outline, color: context.tokens.danger),
              onPressed: () => _delete(context, category),
            ),
          );
        },
      ),
    );
  }
}
