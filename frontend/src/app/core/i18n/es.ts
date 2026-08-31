/**
 * Spanish UI strings. Keys are English (feature.component.element); values are the
 * user-facing Spanish text. Adding a language = adding a sibling dictionary.
 */
export const es = {
  'app.brandFallback': 'Vitrine',
  'app.loading': 'Cargando…',

  'nav.catalog': 'Catálogo',
  'nav.admin': 'Administración',

  'catalog.title': 'Catálogo',
  'catalog.searchPlaceholder': 'Buscá productos',
  'catalog.allCategories': 'Todas',
  'catalog.onlyOnOffer': 'Solo ofertas',
  'catalog.empty': 'No encontramos productos con estos filtros.',
  'catalog.error': 'No pudimos cargar el catálogo. Intentá de nuevo.',
  'catalog.retry': 'Reintentar',
  'catalog.viewDetail': 'Ver detalle',

  'product.offerBadge': 'Oferta',
  'product.from': 'Antes',
  'product.notFound': 'Producto no encontrado.',
  'product.backToCatalog': 'Volver al catálogo',
  'product.characteristics': 'Características',
  'product.contactWhatsapp': 'Pedir por WhatsApp',
  'product.messageLabel': 'Mensaje personalizado',
  'product.messagePlaceholder': 'Escribí un mensaje para tu pedido…',

  'offer.discountPercent': '{value}% de descuento',
  'offer.discountAmount': 'L {value} de descuento',

  'admin.loginTitle': 'Ingresar',
  'admin.username': 'Usuario',
  'admin.password': 'Contraseña',
  'admin.login': 'Ingresar',
  'admin.loginError': 'Usuario o contraseña inválidos.',
  'admin.logout': 'Salir',
  'admin.products': 'Productos',
  'admin.newProduct': 'Nuevo producto',
  'admin.editProduct': 'Editar producto',
  'admin.name': 'Nombre',
  'admin.sku': 'SKU',
  'admin.description': 'Descripción',
  'admin.category': 'Categoría',
  'admin.basePrice': 'Precio base (L)',
  'admin.active': 'Activo',
  'admin.save': 'Guardar',
  'admin.cancel': 'Cancelar',
  'admin.saveError': 'No pudimos guardar. Revisá los datos.',
  'admin.status.active': 'Activo',
  'admin.status.inactive': 'Inactivo',
} as const;

export type TranslationKey = keyof typeof es;
