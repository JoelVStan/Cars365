using Cars365.API.Data;
using Cars365.API.DTOs;
using Cars365.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Cars365.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CarsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IWebHostEnvironment _env;

        public CarsController(ApplicationDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        [HttpGet("dashboard-stats")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetDashboardStats()
        {
            var totalCars = await _context.Cars.CountAsync(c => !c.IsDeleted);
            var activeCars = await _context.Cars.CountAsync(c => !c.IsDeleted && c.IsActive);
            var inactiveCars = await _context.Cars.CountAsync(c => !c.IsDeleted && !c.IsActive);

            return Ok(new
            {
                totalCars,
                activeCars,
                inactiveCars
            });
        }


        // GET: api/cars
        [HttpGet]
        [AllowAnonymous] // later we can restrict if needed
        public async Task<IActionResult> GetCars()
        {
            var cars = await _context.Cars
                .Where(c => !c.IsDeleted && c.IsActive)
                .OrderByDescending(c => c.CreatedAt)
                .ToListAsync();

            return Ok(cars);
        }

        // GET: api/cars/{id}
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetCar(int id)
        {
            var car = await _context.Cars
                .FirstOrDefaultAsync(c => c.Id == id && !c.IsDeleted && c.IsActive);

            if (car == null)
                return NotFound();

            return Ok(car);
        }

        // POST: api/cars
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> AddCar([FromForm] CreateCarDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (dto.Image == null || dto.Image.Length == 0)
                return BadRequest("Image is required");

            // Ensure uploads folder exists
            var uploadPath = Path.Combine(_env.WebRootPath, "uploads");
            if (!Directory.Exists(uploadPath))
                Directory.CreateDirectory(uploadPath);

            // Create unique file name
            var fileName = $"{Guid.NewGuid()}{Path.GetExtension(dto.Image.FileName)}";
            var filePath = Path.Combine(uploadPath, fileName);

            // Save image
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await dto.Image.CopyToAsync(stream);
            }

            var car = new Car
            {
                Brand = dto.Brand,
                Model = dto.Model,
                Type = dto.Type,
                Year = dto.Year,
                FuelType = dto.FuelType,
                Transmission = dto.Transmission,
                Price = dto.Price,
                Description = dto.Description,
                ImageUrl = $"/uploads/{fileName}", // ✅ stored path
                IsActive = dto.IsActive,
                CreatedAt = DateTime.UtcNow
            };

            _context.Cars.Add(car);
            await _context.SaveChangesAsync();

            return Ok(car);
        }

        // PUT: api/cars/{id}
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateCar(int id, [FromForm] CreateCarDto dto)
        {
            var car = await _context.Cars.FindAsync(id);
            if (car == null)
                return NotFound();

            car.Brand = dto.Brand;
            car.Model = dto.Model;
            car.Type = dto.Type;
            car.Year = dto.Year;
            car.FuelType = dto.FuelType;
            car.Transmission = dto.Transmission;
            car.Price = dto.Price;
            car.Description = dto.Description;
            car.IsActive = dto.IsActive;

            // ✅ Update image ONLY if new one is uploaded
            if (dto.Image != null)
            {
                var uploadsFolder = Path.Combine("wwwroot", "uploads", "cars");
                Directory.CreateDirectory(uploadsFolder);

                // ✅ Always generate NEW filename
                var fileName = $"{Guid.NewGuid()}{Path.GetExtension(dto.Image.FileName)}";
                var filePath = Path.Combine(uploadsFolder, fileName);

                using var stream = new FileStream(filePath, FileMode.Create);
                await dto.Image.CopyToAsync(stream);

                // ✅ Update ImageUrl
                car.ImageUrl = $"/uploads/cars/{fileName}";
            }


            await _context.SaveChangesAsync();
            return Ok(car);
        }


        // DELETE: api/cars/{id}
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteCar(int id)
        {
            var car = await _context.Cars.FindAsync(id);

            if (car == null || car.IsDeleted)
                return NotFound();

            car.IsDeleted = true;
            await _context.SaveChangesAsync();

            return Ok("Car deleted successfully");
        }

        [HttpPatch("{id}/toggle-active")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ToggleCarActive(int id)
        {
            var car = await _context.Cars.FindAsync(id);

            if (car == null)
                return NotFound();

            car.IsActive = !car.IsActive;
            await _context.SaveChangesAsync();

            return Ok(new
            {
                car.Id,
                car.IsActive
            });
        }

        [HttpGet("admin")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllCarsForAdmin()
        {
            var cars = await _context.Cars
                .Where(c => !c.IsDeleted) // 👈 IMPORTANT
                .OrderByDescending(c => c.CreatedAt)
                .ToListAsync();

            return Ok(cars);
        }



    }
}
