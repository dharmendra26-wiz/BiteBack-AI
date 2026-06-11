package com.vesta.vestaai.repository;

import com.vesta.vestaai.model.SurplusItem;
import com.vesta.vestaai.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SurplusItemRepository extends JpaRepository<SurplusItem, Long> {
    List<SurplusItem> findByShop(User shop);
    List<SurplusItem> findByStatus(SurplusItem.Status status);
    List<SurplusItem> findByStatusAndCategory(SurplusItem.Status status, String category);
    List<SurplusItem> findByShopAndStatus(User shop, SurplusItem.Status status);

    @Query("SELECT s FROM SurplusItem s WHERE s.status = 'AVAILABLE' ORDER BY s.expiresAt ASC")
    List<SurplusItem> findAllAvailableOrderByExpiry();

    @Query("SELECT COALESCE(SUM(s.co2Saved), 0) FROM SurplusItem s WHERE s.shop = ?1 AND s.status IN ('CLAIMED','DONATED')")
    Double getTotalCo2SavedByShop(User shop);
}
