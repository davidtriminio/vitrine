import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'core/auth/auth_store.dart';
import 'core/http/api_client.dart';
import 'core/i18n/translator.dart';
import 'core/theme/app_theme.dart';
import 'core/theme/app_tokens.dart';
import 'features/account/ui/account_page.dart';
import 'features/auth/ui/login_page.dart';
import 'features/categories/application/categories_store.dart';
import 'features/categories/infrastructure/category_repository.dart';
import 'features/categories/ui/categories_page.dart';
import 'features/offers/application/offers_store.dart';
import 'features/offers/infrastructure/offer_repository.dart';
import 'features/offers/ui/offers_page.dart';
import 'features/products/application/products_store.dart';
import 'features/products/infrastructure/product_repository.dart';
import 'features/products/ui/products_page.dart';

class VitrineAdminApp extends StatelessWidget {
  const VitrineAdminApp({super.key, this.api});

  /// Injectable for tests.
  final ApiClient? api;

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        Provider<ApiClient>(create: (_) => api ?? ApiClient()),
        ChangeNotifierProvider<AuthStore>(
          create: (c) => AuthStore(c.read<ApiClient>())..restore(),
        ),
      ],
      child: MaterialApp(
        title: tr('app.title'),
        debugShowCheckedModeBanner: false,
        theme: buildTheme(AppTokens.base),
        home: const _AuthGate(),
      ),
    );
  }
}

class _AuthGate extends StatelessWidget {
  const _AuthGate();

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthStore>();
    if (!auth.isReady) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }
    if (!auth.isAuthenticated) return const LoginPage();
    // Keyed by session so every login starts with fresh stores.
    return const _AdminScope(key: ValueKey('admin'));
  }
}

class _AdminScope extends StatelessWidget {
  const _AdminScope({super.key});

  @override
  Widget build(BuildContext context) {
    final api = context.read<ApiClient>();
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(
          create: (_) => CategoriesStore(CategoryRepository(api))..load(),
        ),
        ChangeNotifierProvider(
          create: (_) => ProductsStore(ProductRepository(api))..load(),
        ),
        ChangeNotifierProvider(
          create: (_) => OffersStore(OfferRepository(api))..load(),
        ),
      ],
      child: const _HomeShell(),
    );
  }
}

class _HomeShell extends StatefulWidget {
  const _HomeShell();

  @override
  State<_HomeShell> createState() => _HomeShellState();
}

class _HomeShellState extends State<_HomeShell> {
  int _index = 0;

  static const _pages = <Widget>[
    ProductsPage(),
    CategoriesPage(),
    OffersPage(),
    AccountPage(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(index: _index, children: _pages),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _index,
        onDestinationSelected: (i) => setState(() => _index = i),
        destinations: [
          NavigationDestination(
            icon: const Icon(Icons.inventory_2_outlined),
            label: tr('nav.products'),
          ),
          NavigationDestination(
            icon: const Icon(Icons.category_outlined),
            label: tr('nav.categories'),
          ),
          NavigationDestination(
            icon: const Icon(Icons.local_offer_outlined),
            label: tr('nav.offers'),
          ),
          NavigationDestination(
            icon: const Icon(Icons.person_outline),
            label: tr('nav.account'),
          ),
        ],
      ),
    );
  }
}
