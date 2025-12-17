package com.tsarit.billing.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tsarit.billing.model.BillSetting;

public interface BillSettingRepository extends JpaRepository<BillSetting, String> {

}
