using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
namespace Blazor_GIS_App.Data
{
    public class AppDbContext : DbContext
    {

        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)

        {

        }
        public DbSet<Employee> Employees { get; set; }
    }
}
