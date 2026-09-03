package com.vesta.vestaai.repository;

import com.vesta.vestaai.model.Donation;
import com.vesta.vestaai.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DonationRepository extends JpaRepository<Donation, Long> {
    List<Donation> findByFoodBank(User foodBank);
    List<Donation> findBySurplusItemShop(User shop);
}
