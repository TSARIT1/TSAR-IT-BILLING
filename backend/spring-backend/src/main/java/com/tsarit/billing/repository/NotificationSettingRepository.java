package com.tsarit.billing.repository;

import com.tsarit.billing.model.NotificationSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface NotificationSettingRepository extends JpaRepository<NotificationSetting, String> {
    Optional<NotificationSetting> findByBusinessId(String businessId);
    Optional<NotificationSetting> findByUserId(String userId);
    Optional<NotificationSetting> findByBusinessIdAndUserId(String businessId, String userId);
}
