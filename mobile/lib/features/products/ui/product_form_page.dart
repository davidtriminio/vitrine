import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:provider/provider.dart';

import '../../../core/errors/app_error.dart';
import '../../../core/i18n/translator.dart';
import '../../../core/theme/app_tokens.dart';
import '../../../shared/widgets/common.dart';
import '../../categories/application/categories_store.dart';
import '../application/products_store.dart';
import '../domain/product.dart';

class ProductFormPage extends StatefulWidget {
  const ProductFormPage({super.key, this.product});

  final Product? product;

  @override
  State<ProductFormPage> createState() => _ProductFormPageState();
}

class _ProductFormPageState extends State<ProductFormPage> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _name;
  late final TextEditingController _sku;
  late final TextEditingController _description;
  late final TextEditingController _price;
  late List<String> _images;
  String? _categoryId;
  late bool _isActive;
  bool _saving = false;
  bool _uploading = false;

  bool get _isEdit => widget.product != null;

  @override
  void initState() {
    super.initState();
    final p = widget.product;
    _name = TextEditingController(text: p?.name ?? '');
    _sku = TextEditingController(text: p?.sku ?? '');
    _description = TextEditingController(text: p?.description ?? '');
    _price = TextEditingController(text: p == null ? '' : p.basePrice.toString());
    _images = [...?p?.images];
    _categoryId = p?.categoryId;
    _isActive = p?.isActive ?? true;
    if (!_isEdit) _suggestSku();
  }

  @override
  void dispose() {
    _name.dispose();
    _sku.dispose();
    _description.dispose();
    _price.dispose();
    super.dispose();
  }

  Future<void> _suggestSku() async {
    try {
      final sku = await context.read<ProductsStore>().repository.nextSku();
      if (mounted && _sku.text.isEmpty) _sku.text = sku;
    } on AppError {
      // The admin can still type the SKU manually.
    }
  }

  Future<void> _addImage(ImageSource source) async {
    final repo = context.read<ProductsStore>().repository;
    final picked = await ImagePicker().pickImage(
      source: source,
      maxWidth: 1600,
      imageQuality: 85,
    );
    if (picked == null || !mounted) return;
    setState(() => _uploading = true);
    try {
      final url = await repo.uploadImage(picked.path);
      if (mounted) setState(() => _images = [..._images, url]);
    } on AppError catch (e) {
      if (mounted) showMessage(context, e.message, isError: true);
    } finally {
      if (mounted) setState(() => _uploading = false);
    }
  }

  void _pickSource() {
    showModalBottomSheet<void>(
      context: context,
      builder: (ctx) => SafeArea(
        child: Wrap(
          children: [
            ListTile(
              leading: const Icon(Icons.photo_camera_outlined),
              title: Text(tr('products.camera')),
              onTap: () {
                Navigator.pop(ctx);
                _addImage(ImageSource.camera);
              },
            ),
            ListTile(
              leading: const Icon(Icons.photo_library_outlined),
              title: Text(tr('products.gallery')),
              onTap: () {
                Navigator.pop(ctx);
                _addImage(ImageSource.gallery);
              },
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate() || _categoryId == null) return;
    final store = context.read<ProductsStore>();
    final navigator = Navigator.of(context);
    setState(() => _saving = true);
    try {
      await store.save(
        id: widget.product?.id,
        draft: ProductDraft(
          name: _name.text.trim(),
          sku: _sku.text.trim(),
          description: _description.text.trim(),
          categoryId: _categoryId!,
          basePrice: double.parse(_price.text.trim().replaceAll(',', '.')),
          images: _images,
          attributes: widget.product?.attributes ?? const [],
          isActive: _isActive,
        ),
      );
      navigator.pop();
    } on AppError catch (e) {
      if (mounted) showMessage(context, e.message, isError: true);
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final categories = context.watch<CategoriesStore>().items;
    final t = context.tokens;
    return Scaffold(
      appBar: AppBar(
        title: Text(tr(_isEdit ? 'products.edit' : 'products.new')),
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            Text(tr('products.images'), style: Theme.of(context).textTheme.titleSmall),
            const SizedBox(height: 8),
            SizedBox(
              height: 96,
              child: ListView(
                scrollDirection: Axis.horizontal,
                children: [
                  for (final url in _images)
                    Padding(
                      padding: const EdgeInsets.only(right: 8),
                      child: Stack(
                        children: [
                          ImageThumb(url: url, size: 96),
                          Positioned(
                            top: 0,
                            right: 0,
                            child: InkWell(
                              onTap: () => setState(() => _images = [..._images]..remove(url)),
                              child: Container(
                                decoration: BoxDecoration(
                                  color: t.fg,
                                  shape: BoxShape.circle,
                                ),
                                padding: const EdgeInsets.all(2),
                                child: Icon(Icons.close, size: 16, color: t.surface),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  InkWell(
                    onTap: _uploading ? null : _pickSource,
                    borderRadius: BorderRadius.circular(10),
                    child: Container(
                      width: 96,
                      height: 96,
                      decoration: BoxDecoration(
                        color: t.surface2,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: t.muted),
                      ),
                      child: _uploading
                          ? const Center(child: CircularProgressIndicator())
                          : Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(Icons.add_a_photo_outlined, color: t.fgMuted),
                                const SizedBox(height: 4),
                                Text(
                                  tr('products.addImage'),
                                  style: TextStyle(fontSize: 12, color: t.fgMuted),
                                  textAlign: TextAlign.center,
                                ),
                              ],
                            ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _name,
              decoration: InputDecoration(labelText: tr('products.name')),
              validator: requiredValidator,
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _sku,
              decoration: InputDecoration(labelText: tr('products.sku')),
              validator: requiredValidator,
            ),
            const SizedBox(height: 12),
            DropdownButtonFormField<String>(
              initialValue: categories.any((c) => c.id == _categoryId) ? _categoryId : null,
              decoration: InputDecoration(
                labelText: tr('products.category'),
                helperText: categories.isEmpty ? tr('products.noCategories') : null,
              ),
              items: [
                for (final c in categories)
                  DropdownMenuItem(value: c.id, child: Text(c.name)),
              ],
              onChanged: (v) => setState(() => _categoryId = v),
              validator: (v) => v == null ? tr('common.required') : null,
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _price,
              keyboardType: const TextInputType.numberWithOptions(decimal: true),
              decoration: InputDecoration(labelText: tr('products.price')),
              validator: (v) {
                if (v == null || v.trim().isEmpty) return tr('common.required');
                final n = double.tryParse(v.trim().replaceAll(',', '.'));
                return n == null || n < 0 ? tr('common.invalidNumber') : null;
              },
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _description,
              minLines: 3,
              maxLines: 6,
              decoration: InputDecoration(labelText: tr('products.description')),
            ),
            SwitchListTile(
              contentPadding: EdgeInsets.zero,
              title: Text(tr('products.isActive')),
              value: _isActive,
              onChanged: (v) => setState(() => _isActive = v),
            ),
            const SizedBox(height: 8),
            FilledButton(
              onPressed: _saving || _uploading ? null : _save,
              child: _saving
                  ? const SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : Text(tr('common.save')),
            ),
          ],
        ),
      ),
    );
  }
}
