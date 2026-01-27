using System.ComponentModel.DataAnnotations;

namespace Cars365.API.Models
{
    public class CarBrand
    {
        public int Id { get; set; }

        [Required, MaxLength(50)]
        public string Name { get; set; } = string.Empty;

        public bool IsActive { get; set; } = true;

        public ICollection<CarModel> Models { get; set; } = new List<CarModel>();
    }
}
