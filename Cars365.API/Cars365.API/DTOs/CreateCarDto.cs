using System.ComponentModel.DataAnnotations;

namespace Cars365.API.DTOs
{
    public class CreateCarDto
    {
        [Required, MaxLength(50)]
        public string Brand { get; set; } = string.Empty;

        [Required, MaxLength(50)]
        public string Model { get; set; } = string.Empty;

        [Required, MaxLength(30)]
        public string Type { get; set; } = string.Empty;

        [Range(1990, 2100)]
        public int Year { get; set; }

        public DateTime RegistrationYear { get; set; }

        public string FuelType { get; set; } = string.Empty;
        public string Transmission { get; set; } = string.Empty;

        [Range(0, int.MaxValue)]
        public int KmsDriven { get; set; }

        [Range(1, 10)]
        public int Ownership { get; set; }

        [MaxLength(10)]
        public string RegistrationCode { get; set; } = string.Empty;

        public int EngineCC { get; set; }

        public DateTime? InsuranceTill { get; set; }

        public bool? HasSpareKey { get; set; }

        [Range(1, double.MaxValue)]
        public decimal Price { get; set; }

        [MaxLength(500)]
        public string? Description { get; set; }

        public IFormFile? Image { get; set; }

        public bool IsActive { get; set; } = true;
    }
}
