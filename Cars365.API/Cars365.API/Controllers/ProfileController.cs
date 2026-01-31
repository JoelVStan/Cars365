using Cars365.API.Data;
using Cars365.API.DTOs;
using Cars365.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;

namespace Cars365.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ProfileController : ControllerBase
    {
        private readonly UserManager<IdentityUser> _userManager;
        private readonly ApplicationDbContext _context;

        public ProfileController(
            UserManager<IdentityUser> userManager,
            ApplicationDbContext context)
        {
            _userManager = userManager;
            _context = context;
        }

        // ---------------- GET PROFILE ----------------
        [HttpGet]
        public async Task<IActionResult> GetProfile()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var profile = await _context.UserProfiles
                .FirstOrDefaultAsync(p => p.UserId == userId);

            return Ok(profile);
        }

        // ---------------- UPDATE PROFILE ----------------
        [HttpPut]
        public async Task<IActionResult> UpdateProfile(UserProfileDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var profile = await _context.UserProfiles
                .FirstOrDefaultAsync(p => p.UserId == userId);

            if (profile == null)
            {
                profile = new UserProfile
                {
                    UserId = userId!
                };
                _context.UserProfiles.Add(profile);
            }

            profile.FullName = dto.FullName;
            profile.PhoneNumber = dto.PhoneNumber;
            profile.Address = dto.Address;
            profile.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Profile updated successfully" });
        }
    }
}
