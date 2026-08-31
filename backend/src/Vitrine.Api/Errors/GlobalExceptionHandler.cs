using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Vitrine.Application.Common;
using Vitrine.Domain.Common;

namespace Vitrine.Api.Errors;

/// <summary>
/// Translates domain/application exceptions into RFC 7807 ProblemDetails responses,
/// so the whole API speaks a single, typed error contract to the frontend.
/// </summary>
public sealed class GlobalExceptionHandler : IExceptionHandler
{
    private const string TypeBase = "https://vitrine/errors/";

    private readonly IProblemDetailsService _problemDetailsService;
    private readonly ILogger<GlobalExceptionHandler> _logger;

    public GlobalExceptionHandler(IProblemDetailsService problemDetailsService, ILogger<GlobalExceptionHandler> logger)
    {
        _problemDetailsService = problemDetailsService;
        _logger = logger;
    }

    public async ValueTask<bool> TryHandleAsync(HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
    {
        var (status, title, type) = Map(exception);

        if (status >= StatusCodes.Status500InternalServerError)
        {
            _logger.LogError(exception, "Unhandled exception");
        }

        var problemDetails = new ProblemDetails
        {
            Status = status,
            Title = title,
            Type = type,
            Detail = status >= StatusCodes.Status500InternalServerError ? "An unexpected error occurred." : exception.Message
        };

        httpContext.Response.StatusCode = status;

        return await _problemDetailsService.TryWriteAsync(new ProblemDetailsContext
        {
            HttpContext = httpContext,
            Exception = exception,
            ProblemDetails = problemDetails
        });
    }

    private static (int Status, string Title, string Type) Map(Exception exception) => exception switch
    {
        NotFoundException => (StatusCodes.Status404NotFound, "Resource not found.", TypeBase + "not-found"),
        ConflictException => (StatusCodes.Status409Conflict, "Conflict.", TypeBase + "conflict"),
        AuthenticationFailedException => (StatusCodes.Status401Unauthorized, "Authentication failed.", TypeBase + "unauthorized"),
        DomainException => (StatusCodes.Status400BadRequest, "Validation failed.", TypeBase + "validation"),
        _ => (StatusCodes.Status500InternalServerError, "Server error.", TypeBase + "server")
    };
}
