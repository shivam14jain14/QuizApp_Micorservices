package com.shivam.userapigateway.filter;

import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class GatewayAccessValidationFilter implements WebFilter {
    private static final int API_GATEWAY_PORT = 8765;
    private static final String ERROR_MESSAGE =
            "Incorrect path or URL not found. Please access the service through API Gateway port 8765.";

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
        String path = exchange.getRequest().getPath().pathWithinApplication().value();
        int requestPort = exchange.getRequest().getURI().getPort();

        if (isQuizOrQuestionPath(path) && requestPort != API_GATEWAY_PORT) {
            byte[] responseBody = ERROR_MESSAGE.getBytes(StandardCharsets.UTF_8);
            exchange.getResponse().setStatusCode(HttpStatus.NOT_FOUND);
            exchange.getResponse().getHeaders().setContentType(MediaType.TEXT_PLAIN);
            return exchange.getResponse()
                    .writeWith(Mono.just(exchange.getResponse().bufferFactory().wrap(responseBody)));
        }

        return chain.filter(exchange);
    }

    private boolean isQuizOrQuestionPath(String path) {
        return path.startsWith("/quiz") || path.startsWith("/question");
    }
}
