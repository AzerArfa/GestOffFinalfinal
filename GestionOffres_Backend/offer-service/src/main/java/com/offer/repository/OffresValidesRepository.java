package com.offer.repository;

import java.util.Date;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import com.offer.entity.OffresValides;
import com.offer.entity.AppelOffre;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface OffresValidesRepository extends JpaRepository<OffresValides, UUID> {
    List<OffresValides> findByAppeloffre(AppelOffre appelOffre);

    List<OffresValides> findByAppeloffre_Id(UUID appelOffreId);

    @Query("SELECT SUM(o.montant) FROM OffresValides o WHERE o.datevalidation BETWEEN :startDate AND :endDate")
    Double findTotalMontantByDateRange(@Param("startDate") Date startDate, @Param("endDate") Date endDate);
    
    @Query("SELECT o.entrepriseid, SUM(o.montant) FROM OffresValides o WHERE o.datevalidation BETWEEN :startDate AND :endDate GROUP BY o.entrepriseid")
    List<Object[]> findTotalMontantByEntrepriseIdAndDateRange(@Param("startDate") Date startDate, @Param("endDate") Date endDate);
}
