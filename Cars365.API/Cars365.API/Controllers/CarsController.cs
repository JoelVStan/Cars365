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
            .Include(c => c.CarBrand)
            .Include(c => c.CarModel)
            .Where(c => !c.IsDeleted && c.IsActive)
            .OrderByDescending(c => c.CreatedAt)
            .Select(c => new CarResponseDto
            {
                Id = c.Id,
                CarBrandId = (int)c.CarBrandId,
                Brand = c.CarBrand.Name,       // ✅ IMPORTANT
                CarModelId = (int)c.CarModelId,
                Model = c.CarModel.Name,       // ✅ IMPORTANT

                ImageUrl = c.ImageUrl,
                Year = c.Year,
                Type = c.Type,
                FuelType = c.FuelType,
                Transmission = c.Transmission,
                Price = c.Price,
                IsActive = c.IsActive
            })
            .ToListAsync();

            return Ok(cars);
        }

        // GET: api/cars/{id}
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetCar(int id)
        {
            var car = await _context.Cars
            .Include(c => c.CarBrand)
            .Include(c => c.CarModel)
            .Include(c => c.Images)   // 🔥 REQUIRED
            .FirstOrDefaultAsync(c => c.Id == id && !c.IsDeleted);

            if (car == null)
                return NotFound();

            var dto = new CarResponseDto
            {
                Id = car.Id,
                CarBrandId = (int)car.CarBrandId,
                Brand = car.CarBrand.Name,
                CarModelId = (int)car.CarModelId,
                Model = car.CarModel.Name,

                ImageUrl = car.ImageUrl,

                Year = car.Year,
                Type = car.Type,
                FuelType = car.FuelType,
                Transmission = car.Transmission,
                Price = car.Price,

                KmsDriven = car.KmsDriven,
                Ownership = car.Ownership,
                RegistrationCode = car.RegistrationCode,
                RegistrationYear = car.RegistrationYear,
                EngineCC = car.EngineCC,
                InsuranceTill = car.InsuranceTill,
                HasSpareKey = car.HasSpareKey,

                Description = car.Description,
                IsActive = car.IsActive,

                Images = car.Images
                    .OrderBy(i => i.SortOrder)
                    .Select(i => new CarImageDto
                    {
                        Id = i.Id,
                        ImageUrl = i.ImageUrl,
                        IsPrimary = i.IsPrimary,
                        SortOrder = i.SortOrder
                    })
                    .ToList()
            };

            return Ok(dto);
        }

        // POST: api/cars
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> AddCar([FromForm] CreateCarDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (dto.Image == null)
                return BadRequest("Thumbnail image is required");

            var brandExists = await _context.CarBrands.AnyAsync(b => b.Id == dto.CarBrandId);
            var modelExists = await _context.CarModels.AnyAsync(m => m.Id == dto.CarModelId);

            if (!brandExists || !modelExists)
                return BadRequest("Invalid brand or model");

            // Save image
            var uploads = Path.Combine(_env.WebRootPath, "uploads");
            Directory.CreateDirectory(uploads);

            var fileName = $"{Guid.NewGuid()}{Path.GetExtension(dto.Image.FileName)}";
            var filePath = Path.Combine(uploads, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await dto.Image.CopyToAsync(stream);
            }

            var car = new Car
            {
                CarBrandId = dto.CarBrandId,
                CarModelId = dto.CarModelId,

                Year = dto.Year,
                Type = dto.Type,
                FuelType = dto.FuelType,
                Transmission = dto.Transmission,

                Price = dto.Price,
                KmsDriven = dto.KmsDriven,
                Ownership = dto.Ownership,
                RegistrationCode = dto.RegistrationCode,
                RegistrationYear = dto.RegistrationYear,
                EngineCC = dto.EngineCC,
                InsuranceTill = dto.InsuranceTill,
                HasSpareKey = dto.HasSpareKey,
                Description = dto.Description,

                ImageUrl = $"/uploads/{fileName}",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.Cars.Add(car);
            await _context.SaveChangesAsync();

            // 🔑 Load brand + model names safely
            await _context.Entry(car).Reference(c => c.CarBrand).LoadAsync();
            await _context.Entry(car).Reference(c => c.CarModel).LoadAsync();

            var response = new CarResponseDto
            {
                Id = car.Id,
                CarBrandId = (int)car.CarBrandId,
                Brand = car.CarBrand.Name,
                CarModelId = (int)car.CarModelId,
                Model = car.CarModel.Name,

                ImageUrl = car.ImageUrl,

                Year = car.Year,
                Type = car.Type,
                FuelType = car.FuelType,
                Transmission = car.Transmission,

                Price = car.Price,
                KmsDriven = car.KmsDriven,
                Ownership = car.Ownership,
                RegistrationCode = car.RegistrationCode,
                RegistrationYear = car.RegistrationYear,
                EngineCC = car.EngineCC,
                InsuranceTill = car.InsuranceTill,
                HasSpareKey = car.HasSpareKey,

                Description = car.Description,
                IsActive = car.IsActive
            };

            return Ok(response); // ✅ SAFE
        }


        // PUT: api/cars/{id}
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateCar(int id, [FromForm] CreateCarDto dto)
        {
            var car = await _context.Cars.FindAsync(id);

            if (car == null)
                return NotFound();

            car.CarBrandId = dto.CarBrandId;
            car.CarModelId = dto.CarModelId;

            car.Type = dto.Type;
            car.Year = dto.Year;
            car.FuelType = dto.FuelType;
            car.Transmission = dto.Transmission;

            car.Price = dto.Price;
            car.KmsDriven = dto.KmsDriven;
            car.Ownership = dto.Ownership;
            car.RegistrationCode = dto.RegistrationCode;
            car.RegistrationYear = dto.RegistrationYear;
            car.EngineCC = dto.EngineCC;
            car.InsuranceTill = dto.InsuranceTill;
            car.HasSpareKey = (bool)dto.HasSpareKey;
            car.Description = dto.Description;


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
            .Include(c => c.CarBrand)
            .Include(c => c.CarModel)
            .Where(c => !c.IsDeleted)
            .OrderByDescending(c => c.CreatedAt)
            .Select(c => new CarResponseDto
            {
                Id = c.Id,
                CarBrandId = (int)c.CarBrandId,
                Brand = c.CarBrand.Name,
                CarModelId = (int)c.CarModelId,
                Model = c.CarModel.Name,
                Year = c.Year,
                Price = c.Price,
                IsActive = c.IsActive
            })
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
