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

        public CarsController(ApplicationDbContext context)
        {
            _context = context;
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
        public async Task<IActionResult> AddCar([FromBody] CreateCarDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

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
                ImageUrl = dto.ImageUrl,
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
        public async Task<IActionResult> UpdateCar(int id, Car updatedCar)
        {
            var car = await _context.Cars.FindAsync(id);

            if (car == null)
                return NotFound();

            car.Brand = updatedCar.Brand;
            car.Model = updatedCar.Model;
            car.Type = updatedCar.Type;
            car.Year = updatedCar.Year;
            car.FuelType = updatedCar.FuelType;
            car.Transmission = updatedCar.Transmission;
            car.Price = updatedCar.Price;
            car.Description = updatedCar.Description;
            car.ImageUrl = updatedCar.ImageUrl;
            car.IsActive = updatedCar.IsActive;

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

    }
}
