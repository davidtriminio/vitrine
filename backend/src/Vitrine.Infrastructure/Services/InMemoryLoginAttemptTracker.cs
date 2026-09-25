using System.Collections.Concurrent;
using Vitrine.Application.Abstractions;

namespace Vitrine.Infrastructure.Services;

/// <summary>
/// Process-local failed-attempt counter. After <see cref="MaxFailures"/> consecutive failures
/// the key is locked for <see cref="LockoutDuration"/>. Single-instance deployments only.
/// </summary>
public sealed class InMemoryLoginAttemptTracker : ILoginAttemptTracker
{
    private const int MaxFailures = 5;
    private static readonly TimeSpan LockoutDuration = TimeSpan.FromMinutes(15);

    private readonly ConcurrentDictionary<string, Entry> _entries = new();
    private readonly IClock _clock;

    public InMemoryLoginAttemptTracker(IClock clock) => _clock = clock;

    public TimeSpan? GetLockoutRemaining(string key)
    {
        if (!_entries.TryGetValue(key, out var entry) || entry.LockedUntil is not { } until)
        {
            return null;
        }

        var remaining = until - _clock.UtcNow;
        if (remaining > TimeSpan.Zero)
        {
            return remaining;
        }

        _entries.TryRemove(key, out _);
        return null;
    }

    public void RegisterFailure(string key) =>
        _entries.AddOrUpdate(
            key,
            _ => new Entry(1, null),
            (_, current) =>
            {
                var failures = current.Failures + 1;
                return failures >= MaxFailures
                    ? new Entry(0, _clock.UtcNow + LockoutDuration)
                    : new Entry(failures, null);
            });

    public void Reset(string key) => _entries.TryRemove(key, out _);

    private sealed record Entry(int Failures, DateTimeOffset? LockedUntil);
}
