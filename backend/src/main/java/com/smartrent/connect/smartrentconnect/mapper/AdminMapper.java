package com.smartrent.connect.smartrentconnect.mapper;

import com.smartrent.connect.smartrentconnect.dto.AdminRegisterRequest;
import com.smartrent.connect.smartrentconnect.dto.AdminResponse;
import com.smartrent.connect.smartrentconnect.entity.Admin;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface AdminMapper {
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "role", ignore = true)
    Admin toEntity(AdminRegisterRequest dto);

    @Mapping(target = "roleName", source = "role.name")
    AdminResponse toResponse(Admin entity);
}
