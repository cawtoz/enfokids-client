package com.github.cawtoz.enfokids.service;

import org.springframework.stereotype.Service;

import com.github.cawtoz.enfokids.dto.request.ActivityRequest;
import com.github.cawtoz.enfokids.dto.request.ActivityUpdateRequest;
import com.github.cawtoz.enfokids.dto.response.ActivityResponse;
import com.github.cawtoz.enfokids.generic.GenericService;
import com.github.cawtoz.enfokids.mapper.ActivityMapper;
import com.github.cawtoz.enfokids.model.activity.Activity;

@Service
public class ActivityService extends GenericService<Activity, Long, ActivityRequest, ActivityUpdateRequest, ActivityResponse, ActivityMapper> {

}