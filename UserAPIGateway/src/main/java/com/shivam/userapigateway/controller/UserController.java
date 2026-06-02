package com.shivam.userapigateway.controller;

import com.shivam.userapigateway.model.User;
import com.shivam.userapigateway.model.UserWrapper;
import com.shivam.userapigateway.service.JwtService;
import com.shivam.userapigateway.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.ReactiveAuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class UserController {
    private static final Logger logger = LoggerFactory.getLogger(UserController.class);

    private final ReactiveAuthenticationManager authenticationManager;
    private final JwtService jwtService;
    @Autowired
    private UserService service;

    public UserController(ReactiveAuthenticationManager authenticationManager,
                          JwtService jwtService) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    @PostMapping("/register")
    public ResponseEntity<User> saveUser(@RequestBody User user) {
        logger.info("Registering user: {}", user.getUsername());
        User saved = service.registerUser(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PostMapping("/login")
    public Mono<ResponseEntity<Map<String, String>>> login(@RequestBody User req) {
        logger.info("Login attempt for user: {}", req.getUsername());
        UsernamePasswordAuthenticationToken token =
                new UsernamePasswordAuthenticationToken(req.getUsername(), req.getPassword());

        return authenticationManager.authenticate(token)
                .map(auth -> {
                    String jwt = jwtService.generateToken(auth.getName());
                    logger.info("Login successful for user: {}", req.getUsername());
                    return ResponseEntity.ok(Map.of("token", jwt));
                })
                .defaultIfEmpty(ResponseEntity.status(HttpStatus.UNAUTHORIZED).build());
    }

    @GetMapping("/getRoles/{username}")
    public ResponseEntity<String> getRole(@PathVariable String username) {
        logger.info("Fetching role for user: {}", username);
        return ResponseEntity.ok(service.getRole(username));
    }

    @GetMapping("/getBatch/{username}")
    public ResponseEntity<String> getBatch(@PathVariable String username) {
        logger.info("Fetching batch for user: {}", username);
        return ResponseEntity.ok(service.getBatch(username));
    }

    @GetMapping("/students")
    public ResponseEntity<List<String>> getStudentsByBatch(@RequestParam String batch) {
        logger.info("Fetching students for batch: {}", batch);
        return ResponseEntity.ok(service.getStudentUsernamesByBatch(batch));
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getUsers() {
        logger.info("Fetching all users for admin");
        return ResponseEntity.ok(service.getUsers());
    }

    @PostMapping("/updateRole")
    public ResponseEntity<String> updateRole(@RequestBody UserWrapper req) {
        logger.info("Updating role for user: {}", req.getUsername());
        return ResponseEntity.ok(service.updateRole(req));
    }
}
