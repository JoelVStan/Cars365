using Cars365.API.Data;
using Cars365.API.DTOs;
using Cars365.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore; // Add this using directive

namespace Cars365.API.Controllers
{
    [Route("api/brands")]
    [ApiController]
    public class CarBrandsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CarBrandsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetBrands()
        {
            return Ok(await _context.CarBrands
                .Where(b => b.IsActive)
                .OrderBy(b => b.Name)
                .ToListAsync()); // No change needed here, just ensure using Microsoft.EntityFrameworkCore is present
        }

        [HttpGet("{brandId}/models")]
        public async Task<IActionResult> GetModels(int brandId)
        {
            return Ok(await _context.CarModels
                .Where(m => m.CarBrandId == brandId && m.IsActive)
                .OrderBy(m => m.Name)
                .ToListAsync()); // No change needed here, just ensure using Microsoft.EntityFrameworkCore is present
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> AddBrand([FromBody] CreateBrandDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var exists = await _context.CarBrands
                .AnyAsync(b => b.Name.ToLower() == dto.Name.ToLower());

            if (exists)
                return BadRequest("Brand already exists");

            var brand = new CarBrand
            {
                Name = dto.Name.Trim()
            };

            _context.CarBrands.Add(brand);
            await _context.SaveChangesAsync();

            return Ok(brand);
        }

        [HttpPost("{brandId}/models")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> AddModel(int brandId,[FromBody] CreateModelDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var brand = await _context.CarBrands.FindAsync(brandId);
            if (brand == null)
                return NotFound("Brand not found");

            var exists = await _context.CarModels.AnyAsync(m =>
                m.CarBrandId == brandId &&
                m.Name.ToLower() == dto.Name.ToLower()
            );

            if (exists)
                return BadRequest("Model already exists for this brand");

            var model = new CarModel
            {
                Name = dto.Name.Trim(),
                CarBrandId = brandId
            };

            _context.CarModels.Add(model);
            await _context.SaveChangesAsync();

            return Ok(model);
        }


    }
}
