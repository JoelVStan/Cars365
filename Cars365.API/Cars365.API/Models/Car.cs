using System.ComponentModel.DataAnnotations;

namespace Cars365.API.Models
{
    public class Car
    {
        public int Id { get; set; }


        [Required]
        public string Type { get; set; } = string.Empty; // Hatchback, Sedan, SUV

        // 🔹 BASIC DETAILS
        public int Year { get; set; }
        public DateTime RegistrationYear { get; set; }

        public string FuelType { get; set; } = string.Empty;
        public string Transmission { get; set; } = string.Empty;

        // 🔹 NEW FIELDS
        public int KmsDriven { get; set; }
        public int Ownership { get; set; }          // 1,2,3...
        public string RegistrationCode { get; set; } = string.Empty; // KL-07
        public int EngineCC { get; set; }
        public DateTime? InsuranceTill { get; set; }
        public bool HasSpareKey { get; set; }

        public decimal Price { get; set; }

        public string? Description { get; set; }
        public string? ImageUrl { get; set; }

        public bool IsActive { get; set; } = true;
        public bool IsDeleted { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public ICollection<CarImage> Images { get; set; } = new List<CarImage>();
        public int? CarBrandId { get; set; }
        public CarBrand? CarBrand { get; set; }

        public int? CarModelId { get; set; }
        public CarModel? CarModel { get; set; }



    }
}
