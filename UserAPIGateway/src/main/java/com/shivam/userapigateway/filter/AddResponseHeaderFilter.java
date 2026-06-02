package com.shivam.userapigateway.filter;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.core.Ordered;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

public class AddResponseHeaderFilter implements GatewayFilter, Ordered {
    private static final Logger logger = LoggerFactory.getLogger(AddResponseHeaderFilter.class);

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        logger.info("AddResponseHeaderFilter: Adding custom header to response");
        return chain.filter(exchange).then(Mono.fromRunnable(() -> {
            exchange.getResponse().getHeaders().add("X-Custom-Header", "AddedByGateway");
        }));
    }

    @Override
    public int getOrder() {
        return 0;
    }
}
