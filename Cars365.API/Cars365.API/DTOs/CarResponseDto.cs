namespace Cars365.API.DTOs
{
    public class CarResponseDto
    {
        public int Id { get; set; }

        public int CarBrandId { get; set; }
        public string Brand { get; set; } = string.Empty;

        public int CarModelId { get; set; }
        public string Model { get; set; } = string.Empty;
        public string? Variant { get; set; }
        public string Type { get; set; } = string.Empty;
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
        public DateTime CreatedAt { get; set; }
        public string? ImageUrl { get; set; }
        public List<CarImageDto> Images { get; set; } = new();


    }
}
