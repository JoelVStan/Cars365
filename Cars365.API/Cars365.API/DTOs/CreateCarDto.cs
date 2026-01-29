using System.ComponentModel.DataAnnotations;

namespace Cars365.API.DTOs
{
    public class CreateCarDto
    {

        [Required]
        public int CarBrandId { get; set; }

        [Required]
        public int CarModelId { get; set; }

        [Required]
        public string Type { get; set; } = string.Empty;

        public string? Variant { get; set; }
        public int Year { get; set; }

        public string FuelType { get; set; } = string.Empty;
        public string Transmission { get; set; } = string.Empty;

        public decimal Price { get; set; }

        public int KmsDriven { get; set; }
        public int Ownership { get; set; }

        public string RegistrationCode { get; set; } = string.Empty;
        public DateTime RegistrationYear { get; set; }

        public int EngineCC { get; set; }
        public DateTime? InsuranceTill { get; set; }

        public bool HasSpareKey { get; set; }

        public string? Description { get; set; }

        public bool IsActive { get; set; }

        public IFormFile? Image { get; set; }

    }
}
