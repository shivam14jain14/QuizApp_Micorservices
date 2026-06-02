package com.shivam.userapigateway.model;
import lombok.Data;

@Data
public class UserWrapper {
    private String username;
    private String role;

    public String getUsername() {
        return username;
    }

    public String getRole() {
        return role;
    }
}
