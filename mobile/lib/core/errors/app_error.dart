/// Normalized application error (ProblemDetails or transport failure).
class AppError implements Exception {
  const AppError(this.message, {this.status, this.fieldErrors = const {}});

  final String message;
  final int? status;
  final Map<String, List<String>> fieldErrors;

  bool get isUnauthorized => status == 401;

  @override
  String toString() => message;
}
