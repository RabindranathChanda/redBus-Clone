using AutoMapper;
using redBus_api.Model;
using redBus_api.Model.DTOs;

namespace redBus_api.Mappings
{
    public class Mapping:Profile
    {
        public Mapping() 
        {
            // Entity -> DTO
            CreateMap<BusBooking, BusBookingDTO>();
            CreateMap<BusBookingPassenger, BusBookingPassengerDTO>();
            CreateMap<BusSchedule, BusScheduleDTO>();

            // DTO -> Entity
            CreateMap<BusBookingDTO, BusBooking>();
            CreateMap<BusBookingPassengerDTO, BusBookingPassenger>();
            CreateMap<BusScheduleDTO, BusSchedule>();
        }
    }
}
