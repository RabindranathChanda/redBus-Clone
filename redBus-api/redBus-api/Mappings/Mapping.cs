using AutoMapper;
using redBus_api.Model;
using redBus_api.Model.DTOs;

namespace redBus_api.Mappings
{
    public class Mapping : Profile
    {
        public Mapping()
        {
            // Entity -> DTO
            CreateMap<BusBooking, BusBookingDTO>();
            CreateMap<BusBookingPassenger, BusBookingPassengerDTO>();
            CreateMap<BusSchedule, BusScheduleDTO>();
            CreateMap<Vendor, VendorDTO>();
            CreateMap<VendorBankDetails, VendorBankDetailsDTO>();
            CreateMap<VendorProfilePic, VendorProfilePicDTO>();


            // DTO -> Entity
            CreateMap<BusBookingDTO, BusBooking>();
            CreateMap<BusBookingPassengerDTO, BusBookingPassenger>();
            CreateMap<BusScheduleDTO, BusSchedule>();
            CreateMap<VendorDTO, Vendor>();
            CreateMap<VendorBankDetailsDTO, VendorBankDetails>();
            CreateMap<VendorProfilePicDTO, VendorProfilePic>();
        }
    }
}
