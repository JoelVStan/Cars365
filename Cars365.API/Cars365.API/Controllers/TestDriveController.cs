using Cars365.API.Data;
using Cars365.API.DTOs;
using Cars365.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;

namespace Cars365.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class TestDriveController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public TestDriveController(ApplicationDbContext context)
        {
            _context = context;
        }

        // POST: api/testdrives
        [HttpPost]
        public async Task<IActionResult> RequestTestDrive(
            [FromBody] TestDriveRequestDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (userId == null)
                return Unauthorized();

            // 🔒 Validate car exists
            var carExists = await _context.Cars.AnyAsync(c => c.Id == dto.CarId && c.IsActive);
            if (!carExists)
                return BadRequest("Invalid or inactive car");

            // ⛔ Prevent duplicate pending requests
            var alreadyRequested = await _context.TestDriveRequests.AnyAsync(t =>
                t.UserId == userId &&
                t.CarId == dto.CarId &&
                t.Status == "Pending");

            if (alreadyRequested)
                return BadRequest("You already have a pending test drive request for this car");

            // ✅ Create request
            var request = new TestDriveRequest
            {
                UserId = userId,
                CarId = dto.CarId,
                PreferredDate = dto.PreferredDate,
                TimeSlot = dto.TimeSlot,
                Status = "Pending"
            };

            _context.TestDriveRequests.Add(request);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Test drive request submitted",
                requestId = request.Id,
                status = request.Status
            });
        }

        [HttpGet("my")]
        [Authorize]
        public async Task<IActionResult> GetMyTestDrives()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (userId == null)
                return Unauthorized();

            var testDrives = await _context.TestDriveRequests
                .Where(t => t.UserId == userId)
                .Include(t => t.Car)
                    .ThenInclude(c => c.Images)
                .OrderByDescending(t => t.CreatedAt)
                .Select(t => new
                {
                    t.Id,
                    t.Status,
                    t.PreferredDate,
                    t.TimeSlot,
                    t.ScheduledDate,
                    t.AdminComment,
                    t.CreatedAt,

                    Car = new
                    {
                        t.Car.Id,
                        t.Car.Year,
                        Brand = t.Car.CarBrand.Name,
                        Model = t.Car.CarModel.Name,
                        t.Car.Variant,
                        t.Car.Price,

                        ImageUrl =
                            t.Car.Images
                                .Where(i => i.IsPrimary)
                                .Select(i => i.ImageUrl)
                                .FirstOrDefault()
                                ?? t.Car.ImageUrl
                    }
                })
                .ToListAsync();

            return Ok(testDrives);
        }

    }
}
