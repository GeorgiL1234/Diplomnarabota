package com.example.webshop.controllers;

import java.util.Optional;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final JWTUtil jwtUtil;

    @Autowired
    public UserController(UserService userService, JWTUtil jwtUtil) {
        this.userService = userService;
        this.jwtUtil = jwtUtil;
    }
    

    // --- Register endpoint ---
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestParam String username,
                                          @RequestParam String email,
                                          @RequestParam String password) {
        try {
            User user = userService.registerUser(username, email, password);
            return ResponseEntity.ok(user); // връща създадения потребител
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage()); // ако email вече съществува
        }
    }

    // --- Login endpoint ---
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestParam String email,
                                       @RequestParam String password) {
        Optional<User> userOpt = userService.loginUser(email, password);
        if(userOpt.isPresent()) {
            // Генерираме JWT токен
            String token = jwtUtil.generateToken(email);
            return ResponseEntity.ok(token); // връща токена на клиента
        } else {
            return ResponseEntity.status(401).body("Невалиден email или парола!");
        }
    }
}
