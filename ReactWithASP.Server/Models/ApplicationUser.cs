using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Identity;

namespace ReactWithASP.Server.Models
{
    public class ApplicationUser : IdentityUser
    {
        public string? DisplayName { get; set; }
        public string? ProfilePictureUrl { get; set; }
        public DateTime DateJoined { get; set; } = DateTime.UtcNow;
    }
}
