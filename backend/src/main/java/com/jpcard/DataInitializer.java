package com.jpcard;

import com.jpcard.domain.user.Role;
import com.jpcard.domain.user.User;
import com.jpcard.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.findByUsername("manager").isEmpty()) {
            User manager = new User();
            manager.setUsername("manager");
            manager.setPassword(passwordEncoder.encode("password"));
            manager.addRole(Role.ROLE_USER);
            manager.addRole(Role.ROLE_MANAGER);
            userRepository.save(manager);
            System.out.println("Manager account created: manager / password");
        }
    }
}
