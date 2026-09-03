package com.vesta.vestaai.repository;

import com.vesta.vestaai.model.ImpactRecord;
import com.vesta.vestaai.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ImpactRecordRepository extends JpaRepository<ImpactRecord, Long> {
    List<ImpactRecord> findByShopOrderByDateDesc(User shop);

    @Query("SELECT COALESCE(SUM(i.co2Saved),0) FROM ImpactRecord i")
    Double getGlobalCo2Saved();

    @Query("SELECT COALESCE(SUM(i.mealsSaved),0) FROM ImpactRecord i")
    Integer getGlobalMealsSaved();

    @Query("SELECT COALESCE(SUM(i.co2Saved),0) FROM ImpactRecord i WHERE i.shop = ?1")
    Double getShopCo2Saved(User shop);

    @Query("SELECT COALESCE(SUM(i.mealsSaved),0) FROM ImpactRecord i WHERE i.shop = ?1")
    Integer getShopMealsSaved(User shop);
}
