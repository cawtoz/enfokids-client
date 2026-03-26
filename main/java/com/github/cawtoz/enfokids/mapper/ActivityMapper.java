package com.github.cawtoz.enfokids.mapper;

import com.github.cawtoz.enfokids.dto.request.ActivityRequest;
import com.github.cawtoz.enfokids.dto.request.ActivityUpdateRequest;
import com.github.cawtoz.enfokids.dto.response.ActivityResponse;
import com.github.cawtoz.enfokids.generic.GenericMapper;
import com.github.cawtoz.enfokids.model.activity.Activity;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ActivityMapper extends GenericMapper<Activity, ActivityRequest, ActivityUpdateRequest, ActivityResponse> {
    
}
