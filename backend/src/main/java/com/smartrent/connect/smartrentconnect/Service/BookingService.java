package com.smartrent.connect.smartrentconnect.Service;

import com.smartrent.connect.smartrentconnect.dto.BookingPaymentDTO;
import com.smartrent.connect.smartrentconnect.dto.TenantBookingsDTO;
import com.smartrent.connect.smartrentconnect.entity.*;
import com.smartrent.connect.smartrentconnect.enums.BookingStatus;
import com.smartrent.connect.smartrentconnect.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private PGBedRepository pgBedRepository;

    @Autowired
    private PropertyRepository propertyRepository;

    @Autowired
    private PropertyRatingRepository propertyRatingRepository;

    public Booking createFlatBooking(User tenant, FlatDetails flatDetails, LocalDateTime moveInDate) {
        // Validate property is approved
        if (!"APPROVED".equals(flatDetails.getProperty().getStatus().toString())) {
            throw new RuntimeException("Property is not approved for booking");
        }

        // Check if flat is already booked

        if (flatDetails.getIsOccupied()) {
            throw new RuntimeException("Flat is already booked");
        }

        Booking booking = new Booking();
        booking.setTenant(tenant);
        booking.setPropertyId(flatDetails.getProperty().getId());
        booking.setFlatDetails(flatDetails);
        booking.setPgBedId(null); // PG bed is null for flat booking
        booking.setBookingDate(LocalDateTime.now());
        booking.setMoveInDate(moveInDate);
        booking.setDepositAmount(flatDetails.getProperty().getDeposit()+ flatDetails.getRentPerMonth());
        booking.setStatus(BookingStatus.PENDING);

        return bookingRepository.save(booking);
    }

    public Booking createPgBedBooking(User tenant, PGBed pgBed, LocalDateTime moveInDate) {
        // Validate bed is available
        if (pgBed.getIsOccupied()) {
            throw new RuntimeException("PG bed is already occupied");
        }

        // Validate property is approved
        if (!"APPROVED".equals(pgBed.getPgRoom().getPgDetails().getProperty().getStatus().toString())) {
            throw new RuntimeException("Property is not approved for booking");
        }

        Booking booking = new Booking();
        booking.setTenant(tenant);
        booking.setPropertyId(pgBed.getPgRoom().getPgDetails().getProperty().getId());
        booking.setFlatDetails(null); // Flat details is null for PG booking
        booking.setPgBedId(pgBed.getId());
        booking.setBookingDate(LocalDateTime.now());
        booking.setMoveInDate(moveInDate);
        booking.setDepositAmount(pgBed.getPgRoom().getPgDetails().getProperty().getDeposit()+pgBed.getPgRoom().getPricePerBed());
        booking.setStatus(BookingStatus.PENDING);

        return bookingRepository.save(booking);
    }

    public void confirmBooking(Long bookingId) {
        Optional<Booking> bookingOpt = bookingRepository.findById(bookingId);
        if (bookingOpt.isEmpty()) {
            throw new RuntimeException("Booking not found");
        }

        Booking booking = bookingOpt.get();
        booking.setStatus(BookingStatus.CONFIRMED);
        bookingRepository.save(booking);

        // Mark PG bed as occupied if it's a PG booking
        if (booking.getPgBedId() != null) {
            PGBed pgBed = pgBedRepository.getReferenceById(booking.getPgBedId());
            pgBed.setIsOccupied(true);
            pgBedRepository.save(pgBed);
        }
    }

    public void cancelBooking(Long bookingId, Long tenantId) {
        Optional<Booking> bookingOpt = bookingRepository.findById(bookingId);
        if (bookingOpt.isEmpty()) {
            throw new RuntimeException("Booking not found");
        }

        Booking booking = bookingOpt.get();
        
        // Verify booking belongs to the tenant
        if (!booking.getTenant().getId().equals(tenantId)) {
            throw new RuntimeException("Booking does not belong to the tenant");
        }
        
        booking.setStatus(BookingStatus.CANCELLED);
        bookingRepository.save(booking);
    }

    public List<Booking> getTenantBookings(Long tenantId) {
        return bookingRepository.findByTenantId(tenantId);
    }

    public List<Booking> getPropertyBookings(Long propertyId) {
        return bookingRepository.findByPropertyId(propertyId);
    }

    public Optional<Booking> getBookingById(Long id) {
        return bookingRepository.findById(id);
    }

    public Booking getBookingByIdAndTenant(Long bookingId, Long tenantId) {
        Optional<Booking> bookingOpt = bookingRepository.findByIdAndTenantId(bookingId, tenantId);
        if (bookingOpt.isEmpty()) {
            throw new RuntimeException("Booking not found or does not belong to tenant");
        }
        return bookingOpt.get();
    }

    public BookingPaymentDTO createBookingPaymentDTO(Booking booking) {
        BookingPaymentDTO dto = new BookingPaymentDTO();

        // Basic booking info
        dto.setId(booking.getId());
        dto.setPropertyId(booking.getPropertyId());
        dto.setDepositAmount(booking.getDepositAmount());
        dto.setBookingDate(booking.getBookingDate());
        dto.setMoveInDate(booking.getMoveInDate());
        dto.setStatus(booking.getStatus().toString());

        // Fetch property details
        Property property = propertyRepository.findById(booking.getPropertyId()).orElse(null);

        if (property != null) {
            dto.setPropertyTitle(property.getTitle());
            dto.setPropertyAddress(property.getAddress());
            dto.setPropertyCity(property.getCity());
            dto.setPropertyState(property.getState());
            dto.setPropertyPincode(property.getPincode());
            dto.setPropertyType(property.getPropertyType().toString());
            dto.setOwnerName(property.getOwner().getFullName());
            dto.setPropertyDescription(property.getDescription());
            dto.setAmenities(property.getAmenities());
            dto.setAverageRating(propertyRatingRepository.findAverageRatingByPropertyId(property.getId()));
            dto.setTotalRatings(propertyRatingRepository.countRatingsByPropertyId(property.getId()));
        }

        // Flat details
        if (booking.getFlatDetails() != null) {
            dto.setFlatNumber(booking.getFlatDetails().getFlatNumber());
            dto.setBhkType(booking.getFlatDetails().getBhkType());
            dto.setTotalRooms(booking.getFlatDetails().getTotalRooms());
            dto.setBathrooms(booking.getFlatDetails().getBathrooms());
            dto.setFurnishingType(booking.getFlatDetails().getFurnishingType());
            dto.setRentPerMonth(booking.getFlatDetails().getRentPerMonth());
        }

        // PG details
        if (booking.getPgBedId() != null) {
            PGBed pgBed = pgBedRepository.findById(booking.getPgBedId()).orElse(null);
            if (pgBed != null && pgBed.getPgRoom() != null && pgBed.getPgRoom().getPgDetails() != null) {
                dto.setPgBedId(booking.getPgBedId());
                dto.setRoomNumber(pgBed.getPgRoom().getRoomNumber());
                dto.setSharingType(pgBed.getPgRoom().getSharingType().toString());
                dto.setPricePerBed(pgBed.getPgRoom().getPricePerBed());
                dto.setGenderAllowed(pgBed.getPgRoom().getPgDetails().getGenderAllowed().toString());
                dto.setFoodIncluded(pgBed.getPgRoom().getPgDetails().getFoodIncluded());
                dto.setBedNumber(pgBed.getBedNumber());
            }
        }

        return dto;
    }
    
    public TenantBookingsDTO createTenantBookingsDTO(Booking booking) {
        TenantBookingsDTO dto = new TenantBookingsDTO();
        
        // Basic booking info
        dto.setId(booking.getId());
        dto.setPropertyId(booking.getPropertyId());
        dto.setDepositAmount(booking.getDepositAmount());
        dto.setBookingDate(booking.getBookingDate());
        dto.setMoveInDate(booking.getMoveInDate().toLocalDate());
        dto.setStatus(booking.getStatus().toString());
        
        // Fetch property details
        Property property = propertyRepository.findById(booking.getPropertyId()).orElse(null);
        if (property != null) {
            dto.setPropertyTitle(property.getTitle());
            dto.setPropertyAddress(property.getAddress());
            dto.setPropertyCity(property.getCity());
            dto.setPropertyState(property.getState());
            dto.setPropertyPincode(property.getPincode());
            dto.setPropertyType(property.getPropertyType().toString());
            dto.setOwnerName(property.getOwner().getFullName());
        }
        
        // Flat details
        if (booking.getFlatDetails() != null) {
            dto.setFlatNumber(booking.getFlatDetails().getFlatNumber());
            dto.setBhkType(booking.getFlatDetails().getBhkType());
            dto.setTotalRooms(booking.getFlatDetails().getTotalRooms());
            dto.setBathrooms(booking.getFlatDetails().getBathrooms());
            dto.setFurnishingType(booking.getFlatDetails().getFurnishingType());
            dto.setRentPerMonth(booking.getFlatDetails().getRentPerMonth());
        }
        
        // PG details
        if (booking.getPgBedId() != null) {
            PGBed pgBed = pgBedRepository.findById(booking.getPgBedId()).orElse(null);
            if (pgBed != null && pgBed.getPgRoom() != null && pgBed.getPgRoom().getPgDetails() != null) {
                dto.setPgBedId(booking.getPgBedId());
                dto.setRoomNumber(pgBed.getPgRoom().getRoomNumber());
                dto.setSharingType(pgBed.getPgRoom().getSharingType().toString());
                dto.setPricePerBed(pgBed.getPgRoom().getPricePerBed());
                dto.setGenderAllowed(pgBed.getPgRoom().getPgDetails().getGenderAllowed().toString());
                dto.setFoodIncluded(pgBed.getPgRoom().getPgDetails().getFoodIncluded());
                dto.setBedNumber(pgBed.getBedNumber());
            }
        }
        
        return dto;
    }
}
