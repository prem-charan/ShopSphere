package com.shopsphere.controller;

import com.shopsphere.dto.UserPublicResponse;
import com.shopsphere.entity.User;
import com.shopsphere.exception.ResourceNotFoundException;
import com.shopsphere.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class UserController {

    private final UserRepository userRepository;

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserPublicResponse> getUserById(@PathVariable Long id) {
        log.info("GET /api/users/{} - Admin fetching user details", id);
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return ResponseEntity.ok(new UserPublicResponse(user.getUserId(), user.getName(), user.getEmail()));
    }
}

