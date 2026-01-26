namespace Cars365.API.Models
{
    public class Wishlist
    {
        public int Id { get; set; }
        public string UserId { get; set; } = null!;
        public int CarId { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public Car Car { get; set; } = null!;
    }

}
