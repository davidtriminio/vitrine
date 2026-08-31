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
  'offer.viewProducts': 'Ver productos',

  'promotion.products': 'Productos en promoción',
  'promotion.empty': 'No hay productos en esta promoción.',
  'promotion.back': 'Volver al catálogo',

  'sidebar.offers': 'Ofertas',
  'sidebar.noOffers': 'No hay ofertas activas.',

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

  'admin.offers': 'Ofertas',
  'admin.newOffer': 'Nueva oferta',
  'admin.editOffer': 'Editar oferta',
  'admin.offerName': 'Nombre de la oferta',
  'admin.discountType': 'Tipo de descuento',
  'admin.discountPercentage': 'Porcentaje',
  'admin.discountFixed': 'Monto fijo',
  'admin.value': 'Valor',
  'admin.scope': 'Alcance',
  'admin.scopeProduct': 'Producto',
  'admin.scopeCategory': 'Categoría',
  'admin.target': 'Aplica a',
  'admin.startsAt': 'Inicio',
  'admin.endsAt': 'Fin',
  'admin.bannerTitle': 'Título del banner',
  'admin.bannerSubtitle': 'Subtítulo del banner',
  'admin.bannerColor': 'Color de fondo (hex)',
  'admin.bannerImage': 'Imagen del banner (URL)',
  'admin.offerDates': 'Vigencia',
} as const;

export type TranslationKey = keyof typeof es;
