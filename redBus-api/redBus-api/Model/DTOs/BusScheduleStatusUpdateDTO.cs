namespace redBus_api.Model.DTOs
{
    public class BusScheduleStatusUpdateDTO
    {
        public int ScheduleId { get; set; }
        public string ScheduleStatus { get; set; } = null!;
    }
}
