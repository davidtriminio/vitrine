enum DiscountKind { percentage, fixedAmount }

class Offer {
  const Offer({
    required this.id,
    required this.name,
    required this.kind,
    required this.value,
    required this.categoryIds,
    required this.productIds,
    required this.startsAt,
    required this.endsAt,
    required this.isActive,
    this.iconName,
    this.bannerTitle,
    this.bannerSubtitle,
    this.bannerBackgroundColor,
    this.bannerImageUrl,
    this.detailBackgroundImageUrl,
    this.detailBackgroundImageOpacity,
  });

  final String id;
  final String name;
  final DiscountKind kind;
  final double value;
  final List<String> categoryIds;
  final List<String> productIds;
  final DateTime startsAt;
  final DateTime endsAt;
  final bool isActive;
  final String? iconName;
  final String? bannerTitle;
  final String? bannerSubtitle;
  final String? bannerBackgroundColor;
  final String? bannerImageUrl;
  final String? detailBackgroundImageUrl;
  final double? detailBackgroundImageOpacity;

  bool isRunning(DateTime now) =>
      isActive && !now.isBefore(startsAt) && !now.isAfter(endsAt);

  /// Copy used by the editor; presentation fields not edited on mobile are kept.
  Offer copyWith({
    String? name,
    DiscountKind? kind,
    double? value,
    List<String>? categoryIds,
    List<String>? productIds,
    DateTime? startsAt,
    DateTime? endsAt,
    bool? isActive,
    String? bannerTitle,
    String? bannerSubtitle,
  }) =>
      Offer(
        id: id,
        name: name ?? this.name,
        kind: kind ?? this.kind,
        value: value ?? this.value,
        categoryIds: categoryIds ?? this.categoryIds,
        productIds: productIds ?? this.productIds,
        startsAt: startsAt ?? this.startsAt,
        endsAt: endsAt ?? this.endsAt,
        isActive: isActive ?? this.isActive,
        iconName: iconName,
        bannerTitle: bannerTitle ?? this.bannerTitle,
        bannerSubtitle: bannerSubtitle ?? this.bannerSubtitle,
        bannerBackgroundColor: bannerBackgroundColor,
        bannerImageUrl: bannerImageUrl,
        detailBackgroundImageUrl: detailBackgroundImageUrl,
        detailBackgroundImageOpacity: detailBackgroundImageOpacity,
      );
}
