package com.smartrent.connect.smartrentconnect.mapper;

import com.smartrent.connect.smartrentconnect.dto.WatchmanRegisterRequest;
import com.smartrent.connect.smartrentconnect.dto.WatchmanResponse;
import com.smartrent.connect.smartrentconnect.entity.Watchman;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface WatchmanMapper {
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "role", ignore = true)
    Watchman toEntity(WatchmanRegisterRequest dto);

    @Mapping(target = "roleName", source = "role.name")
    WatchmanResponse toResponse(Watchman entity);
}

