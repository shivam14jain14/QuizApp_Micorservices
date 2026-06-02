package com.shivam.userapigateway.config;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.security.authentication.ReactiveAuthenticationManager;
import org.springframework.security.authentication.UserDetailsRepositoryReactiveAuthenticationManager;
import org.springframework.security.config.annotation.method.configuration.EnableReactiveMethodSecurity;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.SecurityWebFiltersOrder;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.core.userdetails.ReactiveUserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.server.SecurityWebFilterChain;

@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {



    @Autowired
    private JwtFilter jwtFilter;
    @Autowired
    private ReactiveUserDetailsService userDetailsService;

    @Bean
    public ReactiveAuthenticationManager reactiveAuthenticationManager() {
        UserDetailsRepositoryReactiveAuthenticationManager mgr =
                new UserDetailsRepositoryReactiveAuthenticationManager(userDetailsService);
        mgr.setPasswordEncoder(new BCryptPasswordEncoder(12));
        return mgr;
    }


    @Bean
    SecurityWebFilterChain filterChain(ServerHttpSecurity http) {
        return http.csrf(csrf -> csrf.disable())
                .authorizeExchange(auth -> auth
                        .pathMatchers(org.springframework.http.HttpMethod.OPTIONS, "/**").permitAll()
                        .pathMatchers("/auth/register", "/auth/login", "/register", "/login").permitAll()
                        .pathMatchers("/auth/getRoles/**", "/getRoles/**").hasRole("ADMIN")
                        .pathMatchers("/auth/updateRole/**", "/updateRole/**").hasAnyRole( "ADMIN")
                        .pathMatchers("/auth/users").hasRole("ADMIN")
                        .pathMatchers("/auth/getBatch/**").authenticated()
                        .pathMatchers("/auth/students").hasAnyRole("TEACHER", "ADMIN")
//                        .pathMatchers("/MicroserviceQuestionQuizApp/**").hasAnyRole( "ADMIN")
                                .pathMatchers("/quiz/generate", "/quiz/finalize").hasRole("TEACHER")
                                .pathMatchers("/quiz/history").hasAnyRole("STUDENT", "TEACHER", "ADMIN")
                                .pathMatchers("/quiz/submit").hasRole("STUDENT")
                                .pathMatchers("/quiz/batch/**").hasAnyRole("STUDENT", "TEACHER", "ADMIN")
                                .pathMatchers("/notifications/sent", "/notifications/failed", "/notifications/recipient/**").hasRole("ADMIN")
                                .pathMatchers("/notifications/**").hasAnyRole("STUDENT", "TEACHER", "ADMIN")
                                .pathMatchers("/question/add", "/question/addQues").hasRole("TEACHER")
                                .pathMatchers("/question/all", "/question/category/**", "/question/categories").hasAnyRole("TEACHER", "ADMIN")
                        .anyExchange().authenticated()
                )
                .addFilterAt(jwtFilter, SecurityWebFiltersOrder.AUTHENTICATION)
                .build();
    }

    //    @Bean
//    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
//
//        http.csrf(customizer -> customizer.disable())
//                .authorizeHttpRequests(request -> request.anyRequest().authenticated())
//                .httpBasic(Customizer.withDefaults())
//                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));
//
//        return http.build();
//    }
    @Bean
    public BCryptPasswordEncoder PasswordEncoder() {
        return new BCryptPasswordEncoder(10);
    }
}
