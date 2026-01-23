/*
 * /
 * package com.example.webshop.config;
 * 
 * import io.jsonwebtoken.Claims;
 * import io.jsonwebtoken.Jwts;
 * import io.jsonwebtoken.SignatureAlgorithm;
 * import org.springframework.stereotype.Component;
 * 
 * import java.util.Date;
 * 
 * @Component
 * public class JwtUtil {
 * 
 * private final String SECRET_KEY = "secret123456789secret123456789";
 * private final long EXPIRATION = 1000 * 60 * 60 * 10; // 10 часа
 * 
 * public String generateToken(String email) {
 * return Jwts.builder()
 * .setSubject(email)
 * .setIssuedAt(new Date())
 * .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION))
 * .signWith(SignatureAlgorithm.HS256, SECRET_KEY)
 * .compact();
 * }
 * 
 * public String extractUsername(String token) {
 * return extractAllClaims(token).getSubject();
 * }
 * 
 * public boolean validateToken(String token, String email) {
 * String username = extractUsername(token);
 * return username.equals(email) && !isTokenExpired(token);
 * }
 * 
 * private boolean isTokenExpired(String token) {
 * return extractAllClaims(token).getExpiration().before(new Date());
 * }
 * 
 * private Claims extractAllClaims(String token) {
 * return Jwts.parser()
 * .setSigningKey(SECRET_KEY)
 * .parseClaimsJws(token)
 * .getBody();
 * }
 * }
 * /
 */