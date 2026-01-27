using System.ComponentModel.DataAnnotations;

namespace Cars365.API.DTOs
{
    public class CreateBrandDto
    {
        [Required]
        [MaxLength(50)]
        public string Name { get; set; } = string.Empty;
    }
}
