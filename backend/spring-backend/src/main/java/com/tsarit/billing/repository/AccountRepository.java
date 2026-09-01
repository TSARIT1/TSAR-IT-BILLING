package com.tsarit.billing.repository;

import com.tsarit.billing.model.Account;
import com.tsarit.billing.model.AccountGroup;
import com.tsarit.billing.model.AccountType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AccountRepository extends JpaRepository<Account, String> {
    List<Account> findByTenantId(String tenantId);
    List<Account> findByTenantIdAndAccountType(String tenantId, AccountType accountType);
    List<Account> findByTenantIdAndAccountGroup(String tenantId, AccountGroup accountGroup);
    Optional<Account> findByTenantIdAndAccountCode(String tenantId, String accountCode);
    Optional<Account> findByTenantIdAndAccountName(String tenantId, String accountName);
}
