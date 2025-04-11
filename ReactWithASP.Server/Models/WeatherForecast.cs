namespace ReactWithASP.Server.Models;

public class WeatherForecast
{
    public DateOnly Date { get; set; }

    public int TemperatureC { get; set; }

    public int TemperatureF => (int)(TemperatureC * 1.8) + 32;

    public string? Summary { get; set; }
}
