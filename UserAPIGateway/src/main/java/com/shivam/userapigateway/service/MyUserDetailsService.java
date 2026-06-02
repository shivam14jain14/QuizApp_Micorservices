package com.shivam.userapigateway.service;

import com.shivam.userapigateway.model.UserPrinciple;
import com.shivam.userapigateway.repo.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.ReactiveUserDetailsService;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
public class MyUserDetailsService implements ReactiveUserDetailsService {
    @Autowired
    private UserRepo repo;


    @Override
    public Mono<UserDetails> findByUsername(String username) {
        return Mono.fromCallable(() -> repo.findByUsername(username))
                .flatMap(user -> {
                    if (user == null) {
                        return Mono.error(new UsernameNotFoundException("No user by " + username));
                    }
                    return Mono.just(new UserPrinciple(user));
                });
    }
}