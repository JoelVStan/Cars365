using System.ComponentModel.DataAnnotations;

namespace Cars365.API.DTOs
{
    public class CreateCarDto
    {
        [Required]
        [MaxLength(50)]
        public string Brand { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string Model { get; set; } = string.Empty;

        [Required]
        [MaxLength(30)]
        public string Type { get; set; } = string.Empty; // Sedan, SUV, etc.

        [Range(1990, 2100)]
        public int Year { get; set; }

        [Required]
        public string FuelType { get; set; } = string.Empty;

        [Required]
        public string Transmission { get; set; } = string.Empty;

        [Range(1, double.MaxValue)]
        public decimal Price { get; set; }

        [MaxLength(500)]
        public string? Description { get; set; }

        public IFormFile? Image { get; set; } = null!;

        public bool IsActive { get; set; } = true;
    }
}
