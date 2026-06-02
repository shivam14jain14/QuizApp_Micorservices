package com.shivam.MicroserviceQuizService.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestHeader;

import java.util.List;

@FeignClient("user-api-gateway")
public interface UserInterface {

    @GetMapping("/auth/getBatch/{username}")
    ResponseEntity<String> getBatchByUsername(@RequestHeader("Authorization") String authorizationHeader,
                                              @PathVariable String username);

    @GetMapping("/auth/students")
    ResponseEntity<List<String>> getStudentsByBatch(@RequestHeader("Authorization") String authorizationHeader,
                                                    @RequestParam String batch);
}
