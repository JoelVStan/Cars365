using System.ComponentModel.DataAnnotations;

namespace Cars365.API.DTOs
{
    public class RejectTestDriveDto
    {
        [Required]
        public string AdminComment { get; set; } = string.Empty;
    }
}
