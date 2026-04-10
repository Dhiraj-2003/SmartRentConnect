package com.smartrent.connect.smartrentconnect.mapper;



import com.smartrent.connect.smartrentconnect.dto.TenantRegisterRequest;
import com.smartrent.connect.smartrentconnect.dto.TenantResponse;
import com.smartrent.connect.smartrentconnect.entity.Tenant;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface TenantMapper {

    // Request DTO -> Entity
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "role", ignore = true) // role will be set in service
    @Mapping(target = "createdAt", expression = "java(java.time.LocalDateTime.now())")
    @Mapping(target = "updatedAt", expression = "java(java.time.LocalDateTime.now())")
    Tenant toEntity(TenantRegisterRequest dto);

    // Entity -> Response DTO
    @Mapping(target = "roleName", source = "role.name")
    TenantResponse toResponse(Tenant entity);
}
