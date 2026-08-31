using System.Text.Json;

namespace Vitrine.Infrastructure.Persistence;

/// <summary>Shared JSON options for value-converted columns (image lists, attributes, theme tokens).</summary>
internal static class JsonSerialization
{
    public static readonly JsonSerializerOptions Options = new(JsonSerializerDefaults.Web);
}
