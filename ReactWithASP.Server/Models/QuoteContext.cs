using Microsoft.EntityFrameworkCore;

namespace ReactWithASP.Server.Models;

public class QuoteContext : DbContext
{
    public QuoteContext(DbContextOptions<QuoteContext> options)
        : base(options) { }

    public DbSet<QuoteItem> QuoteItems { get; set; } = null!;
}
