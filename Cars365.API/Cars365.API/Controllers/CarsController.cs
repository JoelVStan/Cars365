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
            .Include(c => c.Images)
            .Where(c => c.Id == id && !c.IsDeleted && c.IsActive)
            .Select(c => new
            {
                c.Id,
                c.Brand,
                c.Model,
                c.Type,
                c.Year,
                c.FuelType,
                c.Transmission,
                c.Price,
                c.Description,
                c.ImageUrl,
                c.IsActive,
                c.CreatedAt,

                // 🔹 Vehicle details
                c.KmsDriven,
                c.Ownership,
                c.RegistrationCode,
                c.RegistrationYear,
                c.EngineCC,
                c.InsuranceTill,
                c.HasSpareKey,

                // 🔹 Images
                Images = c.Images
                    .OrderBy(i => i.SortOrder)
                    .Select(i => new
                    {
                        i.Id,
                        i.ImageUrl,
                        i.IsPrimary,
                        i.SortOrder
                    })
            })
            .FirstOrDefaultAsync();

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
                RegistrationYear = dto.RegistrationYear,

                FuelType = dto.FuelType,
                Transmission = dto.Transmission,

                KmsDriven = dto.KmsDriven,
                Ownership = dto.Ownership,
                RegistrationCode = dto.RegistrationCode,
                EngineCC = dto.EngineCC,
                InsuranceTill = dto.InsuranceTill,
                HasSpareKey = dto.HasSpareKey ?? false,

                Price = dto.Price,
                Description = dto.Description,
                ImageUrl = $"/uploads/{fileName}",
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
            car.Year = dto.Year;
            car.RegistrationYear = dto.RegistrationYear;
            car.KmsDriven = dto.KmsDriven;
            car.Ownership = dto.Ownership;
            car.RegistrationCode = dto.RegistrationCode;
            car.EngineCC = dto.EngineCC;
            car.InsuranceTill = dto.InsuranceTill;
            car.HasSpareKey = dto.HasSpareKey ?? false;

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

        [HttpPost("{carId}/images")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UploadCarImages(int carId, [FromForm] List<IFormFile> images)
        {
            if (images == null || images.Count == 0)
                return BadRequest("No images uploaded");

            var car = await _context.Cars.FindAsync(carId);
            if (car == null || car.IsDeleted)
                return NotFound("Car not found");

            // Folder: wwwroot/uploads/cars/{carId}
            var uploadRoot = Path.Combine(
                _env.WebRootPath,
                "uploads",
                "cars",
                carId.ToString()
            );

            if (!Directory.Exists(uploadRoot))
                Directory.CreateDirectory(uploadRoot);

            // Get current max sort order
            var maxSortOrder = await _context.CarImages
                .Where(ci => ci.CarId == carId)
                .Select(ci => (int?)ci.SortOrder)
                .MaxAsync() ?? 0;

            var newImages = new List<CarImage>();

            foreach (var image in images)
            {
                if (image.Length == 0) continue;

                var fileName = $"{Guid.NewGuid()}{Path.GetExtension(image.FileName)}";
                var filePath = Path.Combine(uploadRoot, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await image.CopyToAsync(stream);
                }

                newImages.Add(new CarImage
                {
                    CarId = carId,
                    ImageUrl = $"/uploads/cars/{carId}/{fileName}",
                    SortOrder = ++maxSortOrder
                });
            }

            // If no primary image yet → mark first as primary
            if (!await _context.CarImages.AnyAsync(ci => ci.CarId == carId && ci.IsPrimary))
            {
                var first = newImages.FirstOrDefault();
                if (first != null)
                    first.IsPrimary = true;
            }

            _context.CarImages.AddRange(newImages);
            await _context.SaveChangesAsync();

            return Ok(newImages.Select(i => new
            {
                i.Id,
                i.ImageUrl,
                i.IsPrimary,
                i.SortOrder
            }));
        }

        [HttpGet("{carId}/images")]
        [AllowAnonymous]
        public async Task<IActionResult> GetCarImages(int carId)
        {
            var carExists = await _context.Cars
                .AnyAsync(c => c.Id == carId && !c.IsDeleted && c.IsActive);

            if (!carExists)
                return NotFound("Car not found");

            var images = await _context.CarImages
                .Where(ci => ci.CarId == carId)
                .OrderBy(ci => ci.SortOrder)
                .Select(ci => new
                {
                    ci.Id,
                    ci.ImageUrl,
                    ci.IsPrimary,
                    ci.SortOrder
                })
                .ToListAsync();

            return Ok(images);
        }

        [HttpPut("{carId}/images/reorder")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ReorderCarImages(int carId,[FromBody] List<int> imageIds)
        {
            var images = await _context.CarImages
                .Where(i => i.CarId == carId)
                .ToListAsync();

            if (!images.Any())
                return NotFound();

            for (int i = 0; i < imageIds.Count; i++)
            {
                var img = images.FirstOrDefault(x => x.Id == imageIds[i]);
                if (img != null)
                    img.SortOrder = i + 1;
            }

            await _context.SaveChangesAsync();
            return Ok();
        }

        [HttpDelete("images/{imageId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteCarImage(int imageId)
        {
            var image = await _context.CarImages.FindAsync(imageId);
            if (image == null)
                return NotFound();

            // Delete file from disk
            var filePath = Path.Combine(
                _env.WebRootPath,
                image.ImageUrl.TrimStart('/')
                    .Replace('/', Path.DirectorySeparatorChar)
            );

            if (System.IO.File.Exists(filePath))
                System.IO.File.Delete(filePath);

            _context.CarImages.Remove(image);
            await _context.SaveChangesAsync();

            return Ok();
        }

        [HttpPut("images/{imageId}/primary")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> SetPrimaryImage(int imageId)
        {
            var image = await _context.CarImages
                .Include(i => i.Car)
                .FirstOrDefaultAsync(i => i.Id == imageId);

            if (image == null)
                return NotFound();

            // Reset previous primary
            var images = await _context.CarImages
                .Where(i => i.CarId == image.CarId)
                .ToListAsync();

            foreach (var img in images)
                img.IsPrimary = false;

            image.IsPrimary = true;

            // Optional: sync to Cars.ImageUrl
            image.Car.ImageUrl = image.ImageUrl;

            await _context.SaveChangesAsync();
            return Ok();
        }



    }
}
