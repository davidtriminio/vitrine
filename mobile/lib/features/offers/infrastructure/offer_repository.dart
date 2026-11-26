import '../../../core/http/api_client.dart';
import '../domain/offer.dart';

DiscountKind _kindFromDto(String raw) =>
    raw.toLowerCase() == 'fixedamount' ? DiscountKind.fixedAmount : DiscountKind.percentage;

String _kindToDto(DiscountKind kind) =>
    kind == DiscountKind.fixedAmount ? 'FixedAmount' : 'Percentage';

/// DTO -> domain model.
Offer offerFromDto(Map<String, dynamic> dto) => Offer(
      id: dto['id'] as String,
      name: dto['name'] as String,
      kind: _kindFromDto(dto['discountType'] as String),
      value: (dto['value'] as num).toDouble(),
      categoryIds: (dto['categoryIds'] as List<dynamic>).cast<String>(),
      productIds: (dto['productIds'] as List<dynamic>).cast<String>(),
      startsAt: DateTime.parse(dto['startsAt'] as String),
      endsAt: DateTime.parse(dto['endsAt'] as String),
      isActive: dto['isActive'] as bool,
      iconName: dto['iconName'] as String?,
      bannerTitle: dto['bannerTitle'] as String?,
      bannerSubtitle: dto['bannerSubtitle'] as String?,
      bannerBackgroundColor: dto['bannerBackgroundColor'] as String?,
      bannerImageUrl: dto['bannerImageUrl'] as String?,
      detailBackgroundImageUrl: dto['detailBackgroundImageUrl'] as String?,
      detailBackgroundImageOpacity:
          (dto['detailBackgroundImageOpacity'] as num?)?.toDouble(),
    );

/// Domain model -> request DTO.
Map<String, dynamic> offerToDto(Offer o) => {
      'name': o.name,
      'discountType': _kindToDto(o.kind),
      'value': o.value,
      'categoryIds': o.categoryIds,
      'productIds': o.productIds,
      'startsAt': o.startsAt.toUtc().toIso8601String(),
      'endsAt': o.endsAt.toUtc().toIso8601String(),
      'isActive': o.isActive,
      'iconName': o.iconName,
      'bannerTitle': o.bannerTitle,
      'bannerSubtitle': o.bannerSubtitle,
      'bannerBackgroundColor': o.bannerBackgroundColor,
      'bannerImageUrl': o.bannerImageUrl,
      'detailBackgroundImageUrl': o.detailBackgroundImageUrl,
      'detailBackgroundImageOpacity': o.detailBackgroundImageOpacity,
    };

class OfferRepository {
  OfferRepository(this._api);

  final ApiClient _api;

  Future<List<Offer>> list() async {
    final json = await _api.get('/api/v1/offers') as List<dynamic>;
    return json.cast<Map<String, dynamic>>().map(offerFromDto).toList();
  }

  Future<void> create(Offer offer) => _api.post('/api/v1/offers', offerToDto(offer));

  Future<void> update(Offer offer) =>
      _api.put('/api/v1/offers/${offer.id}', offerToDto(offer));

  Future<void> delete(String id) => _api.delete('/api/v1/offers/$id');
}
