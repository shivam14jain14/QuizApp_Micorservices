package com.shivam.NotificationService.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;

@FeignClient("user-api-gateway")
public interface UserInterface {
    @GetMapping("/auth/getBatch/{username}")
    ResponseEntity<String> getBatchByUsername(@RequestHeader("Authorization") String authorizationHeader,
                                              @PathVariable String username);
}
