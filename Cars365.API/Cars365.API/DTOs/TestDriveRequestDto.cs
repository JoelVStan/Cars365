namespace Cars365.API.DTOs
{
    public class TestDriveRequestDto
    {
        public int CarId { get; set; }

        public DateTime PreferredDate { get; set; }

        public string TimeSlot { get; set; } = string.Empty;
    }
}
