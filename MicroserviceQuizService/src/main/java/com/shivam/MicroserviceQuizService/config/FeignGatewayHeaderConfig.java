package com.shivam.MicroserviceQuizService.config;

import feign.RequestInterceptor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class FeignGatewayHeaderConfig {
    private static final String GATEWAY_HEADER_NAME = "X-Internal-Gateway";
    private static final String GATEWAY_HEADER_VALUE = "UserAPIGateway";

    @Bean
    public RequestInterceptor gatewayHeaderRequestInterceptor() {
        return requestTemplate -> requestTemplate.header(GATEWAY_HEADER_NAME, GATEWAY_HEADER_VALUE);
    }
}
