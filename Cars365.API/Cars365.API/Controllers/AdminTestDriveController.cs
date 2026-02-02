using Cars365.API.Data;
using Cars365.API.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;

namespace Cars365.API.Controllers
{
    [ApiController]
    [Route("api/admin/testdrives")]
    [Authorize(Roles = "Admin")]
    public class AdminTestDriveController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AdminTestDriveController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] string? status)
        {
            var query = _context.TestDriveRequests
                .Include(t => t.Car)
                    .ThenInclude(c => c.CarBrand)
                .Include(t => t.Car)
                    .ThenInclude(c => c.CarModel)
                .Include(t => t.Car)
                    .ThenInclude(c => c.Images)
                .AsQueryable();

            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(t => t.Status == status);
            }

            var result = await query
                .OrderByDescending(t => t.CreatedAt)
                .Join(
                    _context.UserProfiles,
                    t => t.UserId,
                    u => u.UserId,
                    (t, u) => new
                    {
                        t.Id,
                        t.Status,
                        t.PreferredDate,
                        t.TimeSlot,
                        t.ScheduledDate,
                        t.AdminComment,
                        t.CreatedAt,

                        // ✅ USER INFO (THIS IS THE FIX)
                        User = new
                        {
                            UserId = t.UserId,
                            FullName = u.FullName,
                            PhoneNumber = u.PhoneNumber
                        },

                        // ✅ CAR INFO
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
                    }
                )
                .ToListAsync();

            return Ok(result);
        }


        [HttpPut("{id}/approve")]
        public async Task<IActionResult> Approve(int id, [FromBody] ApproveTestDriveDto dto)
        {
            var testDrive = await _context.TestDriveRequests.FindAsync(id);
            if (testDrive == null) return NotFound();

            testDrive.Status = "Approved";
            testDrive.ScheduledDate = dto.ScheduledDate;
            testDrive.AdminComment = dto.AdminComment;

            await _context.SaveChangesAsync();
            return Ok();
        }

        [HttpPut("{id}/reject")]
        public async Task<IActionResult> Reject(int id, [FromBody] RejectTestDriveDto dto)
        {
            var testDrive = await _context.TestDriveRequests.FindAsync(id);
            if (testDrive == null) return NotFound();

            testDrive.Status = "Rejected";
            testDrive.AdminComment = dto.AdminComment;
            //testDrive.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                testDrive.Id,
                testDrive.Status,
                testDrive.AdminComment
            });
        }


        [HttpPut("{id}/complete")]
        public async Task<IActionResult> Complete(int id)
        {
            var testDrive = await _context.TestDriveRequests.FindAsync(id);
            if (testDrive == null) return NotFound();

            testDrive.Status = "Completed";

            await _context.SaveChangesAsync();
            return Ok();
        }

    }

}
