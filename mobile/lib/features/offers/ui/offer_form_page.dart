import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../core/errors/app_error.dart';
import '../../../core/i18n/translator.dart';
import '../../../shared/widgets/common.dart';
import '../../categories/application/categories_store.dart';
import '../../products/application/products_store.dart';
import '../application/offers_store.dart';
import '../domain/offer.dart';

class OfferFormPage extends StatefulWidget {
  const OfferFormPage({super.key, this.offer});

  final Offer? offer;

  @override
  State<OfferFormPage> createState() => _OfferFormPageState();
}

class _OfferFormPageState extends State<OfferFormPage> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _name;
  late final TextEditingController _value;
  late final TextEditingController _bannerTitle;
  late final TextEditingController _bannerSubtitle;
  late DiscountKind _kind;
  late DateTime _startsAt;
  late DateTime _endsAt;
  late bool _isActive;
  late Set<String> _categoryIds;
  late Set<String> _productIds;
  bool _saving = false;
  String? _targetError;
  String? _rangeError;

  bool get _isNew => widget.offer == null;

  @override
  void initState() {
    super.initState();
    final o = widget.offer;
    final now = DateTime.now();
    _name = TextEditingController(text: o?.name ?? '');
    _value = TextEditingController(text: o == null ? '' : o.value.toString());
    _bannerTitle = TextEditingController(text: o?.bannerTitle ?? '');
    _bannerSubtitle = TextEditingController(text: o?.bannerSubtitle ?? '');
    _kind = o?.kind ?? DiscountKind.percentage;
    _startsAt = o?.startsAt.toLocal() ?? now;
    _endsAt = o?.endsAt.toLocal() ?? now.add(const Duration(days: 7));
    _isActive = o?.isActive ?? true;
    _categoryIds = {...?o?.categoryIds};
    _productIds = {...?o?.productIds};
  }

  @override
  void dispose() {
    _name.dispose();
    _value.dispose();
    _bannerTitle.dispose();
    _bannerSubtitle.dispose();
    super.dispose();
  }

  Future<void> _pickDate({required bool start}) async {
    final initial = start ? _startsAt : _endsAt;
    final picked = await showDatePicker(
      context: context,
      initialDate: initial,
      firstDate: DateTime(2020),
      lastDate: DateTime(2100),
    );
    if (picked == null) return;
    setState(() {
      if (start) {
        _startsAt = DateTime(picked.year, picked.month, picked.day);
      } else {
        _endsAt = DateTime(picked.year, picked.month, picked.day, 23, 59, 59);
      }
    });
  }

  Future<void> _save() async {
    final valid = _formKey.currentState!.validate();
    setState(() {
      _targetError = _categoryIds.isEmpty && _productIds.isEmpty
          ? tr('offers.needTarget')
          : null;
      _rangeError = _endsAt.isAfter(_startsAt) ? null : tr('offers.invalidRange');
    });
    if (!valid || _targetError != null || _rangeError != null) return;

    final store = context.read<OffersStore>();
    final navigator = Navigator.of(context);
    final base = widget.offer;
    final value = double.parse(_value.text.trim().replaceAll(',', '.'));
    final title = _bannerTitle.text.trim();
    final subtitle = _bannerSubtitle.text.trim();
    final offer = base == null
        ? Offer(
            id: '',
            name: _name.text.trim(),
            kind: _kind,
            value: value,
            categoryIds: _categoryIds.toList(),
            productIds: _productIds.toList(),
            startsAt: _startsAt,
            endsAt: _endsAt,
            isActive: _isActive,
            bannerTitle: title.isEmpty ? null : title,
            bannerSubtitle: subtitle.isEmpty ? null : subtitle,
          )
        : base.copyWith(
            name: _name.text.trim(),
            kind: _kind,
            value: value,
            categoryIds: _categoryIds.toList(),
            productIds: _productIds.toList(),
            startsAt: _startsAt,
            endsAt: _endsAt,
            isActive: _isActive,
            bannerTitle: title,
            bannerSubtitle: subtitle,
          );

    setState(() => _saving = true);
    try {
      await store.save(offer, isNew: _isNew);
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
    final products = context.watch<ProductsStore>().items;
    final scheme = Theme.of(context).colorScheme;
    return Scaffold(
      appBar: AppBar(title: Text(tr(_isNew ? 'offers.new' : 'offers.edit'))),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            TextFormField(
              controller: _name,
              decoration: InputDecoration(labelText: tr('offers.name')),
              validator: requiredValidator,
            ),
            const SizedBox(height: 12),
            SegmentedButton<DiscountKind>(
              segments: [
                ButtonSegment(
                  value: DiscountKind.percentage,
                  label: Text(tr('offers.percentage')),
                ),
                ButtonSegment(
                  value: DiscountKind.fixedAmount,
                  label: Text(tr('offers.fixedAmount')),
                ),
              ],
              selected: {_kind},
              onSelectionChanged: (s) => setState(() => _kind = s.first),
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _value,
              keyboardType: const TextInputType.numberWithOptions(decimal: true),
              decoration: InputDecoration(
                labelText: tr('offers.value'),
                suffixText: _kind == DiscountKind.percentage ? '%' : 'LPS',
              ),
              validator: (v) {
                if (v == null || v.trim().isEmpty) return tr('common.required');
                final n = double.tryParse(v.trim().replaceAll(',', '.'));
                if (n == null || n <= 0) return tr('common.invalidNumber');
                if (_kind == DiscountKind.percentage && n > 100) {
                  return tr('common.invalidNumber');
                }
                return null;
              },
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    icon: const Icon(Icons.event),
                    label: Text('${tr('offers.startsAt')}: ${formatDate(_startsAt)}'),
                    onPressed: () => _pickDate(start: true),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: OutlinedButton.icon(
                    icon: const Icon(Icons.event_available),
                    label: Text('${tr('offers.endsAt')}: ${formatDate(_endsAt)}'),
                    onPressed: () => _pickDate(start: false),
                  ),
                ),
              ],
            ),
            if (_rangeError != null)
              Padding(
                padding: const EdgeInsets.only(top: 6),
                child: Text(_rangeError!, style: TextStyle(color: scheme.error)),
              ),
            SwitchListTile(
              contentPadding: EdgeInsets.zero,
              title: Text(tr('offers.isActive')),
              value: _isActive,
              onChanged: (v) => setState(() => _isActive = v),
            ),
            const SizedBox(height: 4),
            Text(tr('offers.categories'), style: Theme.of(context).textTheme.titleSmall),
            Wrap(
              spacing: 8,
              children: [
                for (final c in categories)
                  FilterChip(
                    label: Text(c.name),
                    selected: _categoryIds.contains(c.id),
                    onSelected: (on) => setState(
                      () => on ? _categoryIds.add(c.id) : _categoryIds.remove(c.id),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 12),
            Text(tr('offers.products'), style: Theme.of(context).textTheme.titleSmall),
            Wrap(
              spacing: 8,
              children: [
                for (final p in products)
                  FilterChip(
                    label: Text(p.name),
                    selected: _productIds.contains(p.id),
                    onSelected: (on) => setState(
                      () => on ? _productIds.add(p.id) : _productIds.remove(p.id),
                    ),
                  ),
              ],
            ),
            if (_targetError != null)
              Padding(
                padding: const EdgeInsets.only(top: 6),
                child: Text(_targetError!, style: TextStyle(color: scheme.error)),
              ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _bannerTitle,
              decoration: InputDecoration(labelText: tr('offers.bannerTitle')),
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _bannerSubtitle,
              decoration: InputDecoration(labelText: tr('offers.bannerSubtitle')),
            ),
            const SizedBox(height: 20),
            FilledButton(
              onPressed: _saving ? null : _save,
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
