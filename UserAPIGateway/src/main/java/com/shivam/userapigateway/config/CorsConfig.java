package com.shivam.userapigateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;

import java.util.List;
import java.util.Set;

@Configuration
public class CorsConfig {
    private static final Set<String> ALLOWED_ORIGINS = Set.of(
            "http://localhost:5173",
            "http://127.0.0.1:5173"
    );

    @Bean
    @Order(Ordered.HIGHEST_PRECEDENCE)
    public WebFilter corsPreflightFilter() {
        return (exchange, chain) -> {
            String origin = exchange.getRequest().getHeaders().getOrigin();

            if (origin != null && ALLOWED_ORIGINS.contains(origin)) {
                addCorsHeaders(exchange, origin);
            }

            if (exchange.getRequest().getMethod() == HttpMethod.OPTIONS) {
                exchange.getResponse().setStatusCode(HttpStatus.OK);
                return exchange.getResponse().setComplete();
            }

            return chain.filter(exchange);
        };
    }

    private void addCorsHeaders(ServerWebExchange exchange, String origin) {
        HttpHeaders headers = exchange.getResponse().getHeaders();
        headers.setAccessControlAllowOrigin(origin);
        headers.setAccessControlAllowCredentials(true);
        headers.setAccessControlAllowMethods(List.of(HttpMethod.GET, HttpMethod.POST, HttpMethod.PUT, HttpMethod.DELETE, HttpMethod.OPTIONS));
        headers.setAccessControlAllowHeaders(List.of("Authorization", "Content-Type", "X-Requested-With"));
        headers.setAccessControlExposeHeaders(List.of("Authorization"));
        headers.setAccessControlMaxAge(3600);
    }
}
