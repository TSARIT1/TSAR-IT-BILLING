package com.tsarit.billing.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.tsarit.billing.model.User;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, String> {
    
    Optional<User> findById(String userId);
    Optional<User> findByEmail(String email);

    Optional<User> findByMobileNo(String mobileNo);

    Optional<User> findByEmailOrMobileNo(String email, String mobileNo);
}
