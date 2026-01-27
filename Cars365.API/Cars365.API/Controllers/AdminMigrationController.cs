//using Cars365.API.Data;
//using Cars365.API.Models;
//using Microsoft.AspNetCore.Authorization;
//using Microsoft.AspNetCore.Http;
//using Microsoft.AspNetCore.Mvc;
//using Microsoft.EntityFrameworkCore;

//namespace Cars365.API.Controllers
//{
//    [ApiController]
//    [Route("api/admin/migration")]
//    [Authorize(Roles = "Admin")]
//    public class AdminMigrationController : ControllerBase
//    {
//        private readonly ApplicationDbContext _context;

//        public AdminMigrationController(ApplicationDbContext context)
//        {
//            _context = context;
//        }

//        [HttpPost("map-brands-models")]
//        public async Task<IActionResult> MapBrandsAndModels()
//        {
//            var cars = await _context.Cars
//                .Where(c => c.CarBrandId == null || c.CarModelId == null)
//                .ToListAsync();

//            foreach (var car in cars)
//            {
//                if (string.IsNullOrWhiteSpace(car.Brand) ||
//                    string.IsNullOrWhiteSpace(car.Model))
//                    continue;

//                // 🔹 Brand
//                var brandName = car.Brand.Trim();
//                var brand = await _context.CarBrands
//                    .FirstOrDefaultAsync(b => b.Name.ToLower() == brandName.ToLower());

//                if (brand == null)
//                {
//                    brand = new CarBrand
//                    {
//                        Name = brandName
//                    };
//                    _context.CarBrands.Add(brand);
//                    await _context.SaveChangesAsync();
//                }

//                // 🔹 Model
//                var modelName = car.Model.Trim();
//                var model = await _context.CarModels.FirstOrDefaultAsync(m =>
//                    m.CarBrandId == brand.Id &&
//                    m.Name.ToLower() == modelName.ToLower()
//                );

//                if (model == null)
//                {
//                    model = new CarModel
//                    {
//                        Name = modelName,
//                        CarBrandId = brand.Id
//                    };
//                    _context.CarModels.Add(model);
//                    await _context.SaveChangesAsync();
//                }

//                // 🔹 Update Car
//                car.CarBrandId = brand.Id;
//                car.CarModelId = model.Id;
//            }

//            await _context.SaveChangesAsync();

//            return Ok(new
//            {
//                message = "Migration completed successfully",
//                totalCarsProcessed = cars.Count
//            });
//        }
//    }
//}
