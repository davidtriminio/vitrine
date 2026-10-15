import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../core/auth/auth_store.dart';
import '../../../core/errors/app_error.dart';
import '../../../core/i18n/translator.dart';
import '../../../shared/widgets/common.dart';

class AccountPage extends StatefulWidget {
  const AccountPage({super.key});

  @override
  State<AccountPage> createState() => _AccountPageState();
}

class _AccountPageState extends State<AccountPage> {
  final _formKey = GlobalKey<FormState>();
  final _current = TextEditingController();
  final _next = TextEditingController();
  final _confirm = TextEditingController();
  bool _saving = false;

  @override
  void dispose() {
    _current.dispose();
    _next.dispose();
    _confirm.dispose();
    super.dispose();
  }

  Future<void> _change() async {
    if (!_formKey.currentState!.validate()) return;
    final auth = context.read<AuthStore>();
    setState(() => _saving = true);
    try {
      await auth.changePassword(_current.text, _next.text);
      if (!mounted) return;
      _current.clear();
      _next.clear();
      _confirm.clear();
      showMessage(context, tr('account.changed'));
    } on AppError catch (e) {
      if (mounted) showMessage(context, e.message, isError: true);
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthStore>();
    return Scaffold(
      appBar: AppBar(title: Text(tr('nav.account'))),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          ListTile(
            contentPadding: EdgeInsets.zero,
            leading: const Icon(Icons.account_circle_outlined, size: 40),
            title: Text(tr('account.signedInAs')),
            subtitle: Text(auth.username ?? ''),
          ),
          const Divider(),
          Text(
            tr('account.changePassword'),
            style: Theme.of(context).textTheme.titleMedium,
          ),
          const SizedBox(height: 12),
          Form(
            key: _formKey,
            child: Column(
              children: [
                TextFormField(
                  controller: _current,
                  obscureText: true,
                  decoration: InputDecoration(labelText: tr('account.current')),
                  validator: requiredValidator,
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: _next,
                  obscureText: true,
                  decoration: InputDecoration(labelText: tr('account.new')),
                  validator: (v) => (v ?? '').length < 8 ? tr('account.tooShort') : null,
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: _confirm,
                  obscureText: true,
                  decoration: InputDecoration(labelText: tr('account.confirm')),
                  validator: (v) => v != _next.text ? tr('account.mismatch') : null,
                ),
                const SizedBox(height: 16),
                SizedBox(
                  width: double.infinity,
                  child: FilledButton(
                    onPressed: _saving ? null : _change,
                    child: Text(tr('common.save')),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
          OutlinedButton.icon(
            icon: const Icon(Icons.logout),
            label: Text(tr('account.logout')),
            onPressed: auth.logout,
          ),
        ],
      ),
    );
  }
}
