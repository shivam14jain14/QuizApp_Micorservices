package com.shivam.userapigateway.service;
import com.shivam.userapigateway.model.User;
import com.shivam.userapigateway.model.UserCreatedEvent;
import com.shivam.userapigateway.model.UserWrapper;
import com.shivam.userapigateway.repo.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;

@Service
public class UserService {
    @Autowired
    private UserRepo userRepo;
    @Autowired
    private PasswordEncoder encoder;
    @Autowired
    private OutboxEventService outboxEventService;
    @Value("${app.kafka.topic.user-created:user-created-notifications}")
    private String userCreatedTopic;

    @Transactional
    public User registerUser(User user) {
        if (userRepo.existsByUsername(user.getUsername())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username already exists");
        }

        if (userRepo.existsByEmail(user.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
        }

        user.setPassword(encoder.encode(user.getPassword()));
        user.setFirstname(normalize(user.getFirstname()));
        user.setLastname(normalize(user.getLastname()));
        user.setPhone(normalize(user.getPhone()));
        String requestedRole = normalize(user.getRole()).toUpperCase(Locale.ROOT);
        user.setRequestedRole(requestedRole);
        user.setRole("UNVERIFIED");
        user.setBatch("STUDENT".equals(requestedRole) ? normalize(user.getBatch()) : "NA");
        User savedUser = userRepo.save(user);
        createUserCreatedOutboxEvent(savedUser);
        return savedUser;
    }
    public String updateRole(UserWrapper req) {
        User user = userRepo.findByUsername(req.getUsername());
        String role = req.getRole();  // copy old roles
        user.setRole(role);                          // add new role
        userRepo.save(user);
        return String.format("Sucessfully added userRole for user", req.getUsername());
    }
    public String getRole(String username) {
        User user= userRepo.findByUsername(username);
        System.out.println(user.getRole()+"<- userRoles");
        return user.getRole();
    }

    public String getBatch(String username) {
        User user = userRepo.findByUsername(username);
        if (user == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
        }
        return user.getBatch();
    }

    public List<String> getStudentUsernamesByBatch(String batch) {
        String targetBatch = normalize(batch);
        return userRepo.findAll().stream()
                .filter(user -> "STUDENT".equalsIgnoreCase(user.getRole()))
                .filter(user -> batchMatches(user.getBatch(), targetBatch))
                .map(User::getUsername)
                .toList();
    }

    public List<User> getUsers() {
        return userRepo.findAll().stream()
                .peek(user -> user.setPassword(null))
                .toList();
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim();
    }

    private boolean batchMatches(String userBatch, String targetBatch) {
        String userNormalized = normalizeBatch(userBatch);
        String targetNormalized = normalizeBatch(targetBatch);
        return !targetNormalized.isBlank() && userNormalized.equals(targetNormalized);
    }

    private String normalizeBatch(String batch) {
        return normalize(batch)
                .toLowerCase(Locale.ROOT)
                .replace("batch", "")
                .replace("-", "")
                .replace("_", "")
                .replace(" ", "");
    }

    private void createUserCreatedOutboxEvent(User user) {
        UserCreatedEvent event = new UserCreatedEvent(
                "USER_CREATED",
                user.getUsername(),
                user.getRequestedRole(),
                "New User onboarded, please approve the role",
                LocalDateTime.now()
        );
        outboxEventService.createEvent("USER_CREATED", userCreatedTopic, user.getUsername(), event);
    }

}
