using System.ComponentModel.DataAnnotations;

namespace Cars365.API.Models
{
    public class UserProfile
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string UserId { get; set; } = string.Empty; // IdentityUser.Id

        [MaxLength(100)]
        public string? FullName { get; set; }

        [MaxLength(15)]
        public string? PhoneNumber { get; set; }

        [MaxLength(300)]
        public string? Address { get; set; }

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
