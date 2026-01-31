using Cars365.API.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using System.Reflection.Emit;

namespace Cars365.API.Data
{
    public class ApplicationDbContext : IdentityDbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<Car> Cars => Set<Car>();
        public DbSet<Wishlist> Wishlists => Set<Wishlist>();
        public DbSet<CarImage> CarImages => Set<CarImage>();
        public DbSet<CarBrand> CarBrands => Set<CarBrand>();
        public DbSet<CarModel> CarModels => Set<CarModel>();
        public DbSet<UserProfile> UserProfiles { get; set; }
        public DbSet<TestDriveRequest> TestDriveRequests => Set<TestDriveRequest>();




        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.Entity<Wishlist>()
                .HasIndex(w => new { w.UserId, w.CarId })
                .IsUnique();

            builder.Entity<CarImage>()
                .HasOne(ci => ci.Car)
                .WithMany(c => c.Images)
                .HasForeignKey(ci => ci.CarId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<CarBrand>()
                .HasIndex(b => b.Name)
                .IsUnique();

            builder.Entity<CarModel>()
                .HasIndex(m => new { m.Name, m.CarBrandId })
                .IsUnique();

            builder.Entity<Car>()
                .HasOne(c => c.CarBrand)
                .WithMany()
                .HasForeignKey(c => c.CarBrandId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<Car>()
                .HasOne(c => c.CarModel)
                .WithMany()
                .HasForeignKey(c => c.CarModelId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<TestDriveRequest>()
                .HasOne(t => t.Car)
                .WithMany()
                .HasForeignKey(t => t.CarId)
                .OnDelete(DeleteBehavior.Restrict);

        }
    }
    
}
