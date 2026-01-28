package com.shopsphere.repository;

import com.shopsphere.entity.Campaign;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface CampaignRepository extends JpaRepository<Campaign, Long> {

    @Query("SELECT c FROM Campaign c WHERE c.startDate <= :today AND c.endDate >= :today ORDER BY c.startDate DESC")
    List<Campaign> findActiveCampaigns(@Param("today") LocalDate today);
}

