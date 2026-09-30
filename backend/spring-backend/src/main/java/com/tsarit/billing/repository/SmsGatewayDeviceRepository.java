package com.tsarit.billing.repository;

import com.tsarit.billing.model.SmsGatewayDevice;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SmsGatewayDeviceRepository extends JpaRepository<SmsGatewayDevice, String> {
}
