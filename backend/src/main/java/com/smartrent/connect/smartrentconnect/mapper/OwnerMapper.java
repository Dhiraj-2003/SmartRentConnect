package com.smartrent.connect.smartrentconnect.mapper;



import com.smartrent.connect.smartrentconnect.dto.OwnerRegisterRequest;
import com.smartrent.connect.smartrentconnect.dto.OwnerResponse;
import com.smartrent.connect.smartrentconnect.entity.Owner;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface OwnerMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "role", ignore = true)
    @Mapping(target = "createdAt", expression = "java(java.time.LocalDateTime.now())")
    @Mapping(target = "updatedAt", expression = "java(java.time.LocalDateTime.now())")
    Owner toEntity(OwnerRegisterRequest dto);

    @Mapping(target = "roleName", source = "role.name")
    OwnerResponse toResponse(Owner entity);
}

