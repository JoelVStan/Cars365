using System.ComponentModel.DataAnnotations;

namespace Cars365.API.Models
{
    public class CarModel
    {
        public int Id { get; set; }

        [Required, MaxLength(50)]
        public string Name { get; set; } = string.Empty;

        public int CarBrandId { get; set; }
        public CarBrand Brand { get; set; } = null!;

        public bool IsActive { get; set; } = true;
    }
}
