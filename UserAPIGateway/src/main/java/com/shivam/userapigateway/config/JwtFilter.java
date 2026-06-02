package com.shivam.userapigateway.config;
import com.shivam.userapigateway.service.JwtService;
import jakarta.ws.rs.core.HttpHeaders;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;

import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

@Component
public class JwtFilter implements WebFilter {
    private final JwtService jwtService;

    public JwtFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {

        String auth = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        if (auth != null && auth.startsWith("Bearer ")) {
            String token = auth.substring(7);
            if (jwtService.isTokenValid(token)) {
                var authObj = new UsernamePasswordAuthenticationToken(
                        jwtService.extractUsername(token),
                        null,
                        jwtService.extractRoles(token).stream()
                                .map(r -> new SimpleGrantedAuthority("ROLE_" + r))
                                .toList()
                );
                return chain.filter(exchange)
                        .contextWrite(ReactiveSecurityContextHolder.withAuthentication(authObj));
            }
        }
        return chain.filter(exchange);
    }
}