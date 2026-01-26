using Cars365.API.Data;
using Cars365.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Cars365.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "User")]
    public class WishlistController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public WishlistController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost("{carId}")]
        public async Task<IActionResult> AddToWishlist(int carId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var exists = await _context.Wishlists
                .AnyAsync((Wishlist w) => w.UserId == userId && w.CarId == carId);

            if (exists)
                return BadRequest("Already in wishlist");

            var wishlist = new Wishlist
            {
                UserId = userId!,
                CarId = carId
            };

            _context.Wishlists.Add(wishlist);
            await _context.SaveChangesAsync();

            return Ok("Added to wishlist");
        }

        [HttpDelete("{carId}")]
        public async Task<IActionResult> RemoveFromWishlist(int carId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var item = await _context.Wishlists
                .FirstOrDefaultAsync(w => w.UserId == userId && w.CarId == carId);

            if (item == null)
                return NotFound();

            _context.Wishlists.Remove(item);
            await _context.SaveChangesAsync();

            return Ok("Removed from wishlist");
        }

        [HttpGet]
        public async Task<IActionResult> GetWishlist()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var wishlist = await _context.Wishlists
                .Include(w => w.Car)
                .Where(w => w.UserId == userId)
                .Select(w => new
                {
                    w.Car.Id,
                    w.Car.Brand,
                    w.Car.Model,
                    w.Car.Price,
                    w.Car.ImageUrl
                })
                .ToListAsync();

            return Ok(wishlist);
        }

    }
}
