import 'es.dart';

/// Looks a key up in the active locale table and substitutes `{param}` slots.
String tr(String key, {Map<String, String> params = const {}}) {
  var text = es[key] ?? key;
  params.forEach((name, value) => text = text.replaceAll('{$name}', value));
  return text;
}
