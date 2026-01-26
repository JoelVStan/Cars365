using System.ComponentModel.DataAnnotations;

namespace Cars365.API.Models
{
    public class CarImage
    {
        public int Id { get; set; }

        [Required]
        public int CarId { get; set; }

        [Required]
        public string ImageUrl { get; set; } = string.Empty;

        // Optional but very useful
        public bool IsPrimary { get; set; } = false;

        public int SortOrder { get; set; } = 0;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public Car Car { get; set; } = null!;
    }

}
