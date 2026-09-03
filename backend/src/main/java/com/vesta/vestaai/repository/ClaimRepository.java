package com.vesta.vestaai.repository;

import com.vesta.vestaai.model.Claim;
import com.vesta.vestaai.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ClaimRepository extends JpaRepository<Claim, Long> {
    List<Claim> findByCustomer(User customer);
    List<Claim> findBySurplusItemShop(User shop);
    List<Claim> findBySurplusItemId(Long surplusItemId);
}
