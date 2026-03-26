package com.github.cawtoz.enfokids.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LoginResponse {
    
    private String token;
    private String username;
    private String type = "Bearer";
    
    public LoginResponse(String token, String username) {
        this.token = token;
        this.username = username;
    }
}
