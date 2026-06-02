package com.shivam.userapigateway.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;

@Configuration
public class GatewayConfig {
    private static final Logger logger = LoggerFactory.getLogger(GatewayConfig.class);
    private static final String GATEWAY_HEADER_NAME = "X-Internal-Gateway";
    private static final String GATEWAY_HEADER_VALUE = "UserAPIGateway";

    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        logger.info("Configuring custom routes for API Gateway");
        return builder.routes()
                .route("question_service_route", r -> r.path("/question/**")
                        .filters(f -> f.addRequestHeader(GATEWAY_HEADER_NAME, GATEWAY_HEADER_VALUE)
                                .retry(config -> config.setRetries(3).setStatuses(HttpStatus.INTERNAL_SERVER_ERROR))
                                .addResponseHeader("X-Response-Source", "QuestionService"))
                        .uri("lb://MICROSERVICEQUESTIONQUIZAPP"))
                .route("quiz_service_route", r -> r.path("/quiz/**")
                        .filters(f -> f.retry(config -> config.setRetries(3).setStatuses(HttpStatus.INTERNAL_SERVER_ERROR))
                                .addRequestHeader(GATEWAY_HEADER_NAME, GATEWAY_HEADER_VALUE)
                                .addResponseHeader("X-Response-Source", "QuizService"))
                        .uri("lb://MICROSERVICEQUIZAPP"))
                .route("notification_service_route", r -> r.path("/notifications", "/notifications/**")
                        .filters(f -> f.retry(config -> config.setRetries(3).setStatuses(HttpStatus.INTERNAL_SERVER_ERROR))
                                .addResponseHeader("X-Response-Source", "NotificationService"))
                        .uri("lb://NOTIFICATIONSERVICE"))
                .build();
    }
}
