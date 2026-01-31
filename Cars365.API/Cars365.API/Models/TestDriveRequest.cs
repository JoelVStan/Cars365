using System.ComponentModel.DataAnnotations;

namespace Cars365.API.Models
{
    public class TestDriveRequest
    {
        public int Id { get; set; }

        // Identity user
        [Required]
        public string UserId { get; set; } = string.Empty;

        // Car
        public int CarId { get; set; }
        public Car Car { get; set; } = null!;

        // User preference
        [Required]
        public DateTime PreferredDate { get; set; }

        [Required, MaxLength(20)]
        public string TimeSlot { get; set; } = string.Empty; // Morning / Afternoon / Evening

        // Status
        [Required, MaxLength(20)]
        public string Status { get; set; } = "Pending";
        // Pending / Approved / Rejected / Completed

        // Admin side
        public DateTime? ScheduledDate { get; set; }

        [MaxLength(300)]
        public string? AdminComment { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

}
