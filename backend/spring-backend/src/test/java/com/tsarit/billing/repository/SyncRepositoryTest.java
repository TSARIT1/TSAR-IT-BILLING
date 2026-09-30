package com.tsarit.billing.repository;

import com.tsarit.billing.model.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import static org.assertj.core.api.Assertions.assertThat;

/** Runs against an isolated in-memory database, never the configured application database. */
@DataJpaTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:sync-isolation;MODE=MySQL;DB_CLOSE_DELAY=-1",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect",
        "spring.jpa.hibernate.ddl-auto=create-drop"
}, showSql = false)
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class SyncRepositoryTest {
    @Autowired TestEntityManager db;
    @Autowired ProductRepository products;
    @Autowired CustomerRepository customers;
    @Autowired SaleRepository sales;
    @Autowired InvoiceRepository invoices;

    @Test void queriesExcludeOtherBusinessesAndIncludeLegacyGodownOwnership() {
        UserBusiness first = tenant("9000000001");
        UserBusiness second = tenant("9000000002");
        Godown firstGodown = new Godown();
        firstGodown.setGodownName("First store");
        firstGodown.setUserBusiness(first);
        db.persist(firstGodown);

        Product owned = product("Owned", first, null);
        Product legacy = product("Legacy", null, firstGodown);
        Product other = product("Other", second, null);
        // A direct owner takes precedence over a stale godown relation.
        product("Conflicting", second, firstGodown);
        product("Unassigned", null, null);

        Customer firstCustomer = customer("First customer", first.getBusiness().getId());
        Customer secondCustomer = customer("Second customer", second.getBusiness().getId());
        saleAndInvoice(first, firstCustomer);
        saleAndInvoice(second, secondCustomer);
        saleAndInvoice(second, secondCustomer);
        db.flush();
        db.clear();

        String firstId = first.getBusiness().getId();
        String secondId = second.getBusiness().getId();
        assertThat(products.findForSyncByBusinessId(firstId)).extracting(Product::getId)
                .containsExactlyInAnyOrder(owned.getId(), legacy.getId()).doesNotContain(other.getId());
        assertThat(products.countForSyncByBusinessId(firstId)).isEqualTo(2);
        assertThat(customers.findByBusinessId(firstId)).extracting(Customer::getId)
                .containsExactly(firstCustomer.getId());
        assertThat(customers.countByBusinessId(firstId)).isEqualTo(1);
        assertThat(sales.countByCustomerBusinessId(firstId)).isEqualTo(1);
        assertThat(sales.countByCustomerBusinessId(secondId)).isEqualTo(2);
        assertThat(invoices.countByCustomer_BusinessId(firstId)).isEqualTo(1);
        assertThat(invoices.countByCustomer_BusinessId(secondId)).isEqualTo(2);
    }

    private UserBusiness tenant(String mobile) {
        User user = new User();
        user.setMobileNo(mobile);
        db.persist(user);
        Business business = new Business();
        business.setBusinessName(mobile);
        db.persist(business);
        UserBusiness membership = new UserBusiness();
        membership.setUser(user);
        membership.setBusiness(business);
        return db.persist(membership);
    }

    private Product product(String name, UserBusiness membership, Godown godown) {
        Product product = new Product();
        product.setProductCode(name);
        product.setProductName(name);
        product.setCategory("Test");
        product.setUnit("PCS");
        product.setPurchasePrice(10.0);
        product.setSellingPrice(20.0);
        product.setTotalStock(1);
        product.setRemainingStock(1);
        product.setMinStockLevel(0);
        product.setTaxRate(0.0);
        product.setDiscount(0.0);
        product.setUserBusiness(membership);
        product.setGodown(godown);
        return db.persist(product);
    }

    private Customer customer(String name, String businessId) {
        Customer customer = new Customer();
        customer.setName(name);
        customer.setPhone("First customer".equals(name) ? "9000000011" : "9000000012");
        customer.setBusinessId(businessId);
        return db.persist(customer);
    }

    private void saleAndInvoice(UserBusiness membership, Customer customer) {
        Sale sale = new Sale();
        sale.setCustomerId(customer.getId());
        db.persist(sale);
        Invoice invoice = new Invoice();
        invoice.setUser(membership.getUser());
        invoice.setCustomer(customer);
        db.persist(invoice);
    }
}
