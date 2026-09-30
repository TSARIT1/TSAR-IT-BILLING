package com.tsarit.billing.repository;

import com.tsarit.billing.model.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, String> {

    @Query("SELECT n FROM Notification n WHERE (n.businessId IS NULL OR n.businessId = '' OR n.businessId = 'ALL' OR n.businessId = :businessId) AND (:userId IS NULL OR n.userId IS NULL OR n.userId = '' OR n.userId = 'ALL' OR n.userId = :userId) ORDER BY n.createdAt DESC")
    List<Notification> findForUserAndBusiness(@Param("userId") String userId, @Param("businessId") String businessId, Pageable pageable);

    @Query("SELECT COUNT(n) FROM Notification n WHERE n.read = false AND (n.businessId IS NULL OR n.businessId = '' OR n.businessId = 'ALL' OR n.businessId = :businessId) AND (:userId IS NULL OR n.userId IS NULL OR n.userId = '' OR n.userId = 'ALL' OR n.userId = :userId)")
    long countUnreadForUserAndBusiness(@Param("userId") String userId, @Param("businessId") String businessId);

    @Modifying
    @Query("UPDATE Notification n SET n.read = true WHERE (n.businessId IS NULL OR n.businessId = '' OR n.businessId = 'ALL' OR n.businessId = :businessId) AND (:userId IS NULL OR n.userId IS NULL OR n.userId = '' OR n.userId = 'ALL' OR n.userId = :userId)")
    int markAllAsRead(@Param("userId") String userId, @Param("businessId") String businessId);

    Page<Notification> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
