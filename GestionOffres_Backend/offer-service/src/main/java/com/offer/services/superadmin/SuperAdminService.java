package com.offer.services.superadmin;

import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.offer.entity.Categorie;
import com.offer.repository.AppelOffreRepository;
import com.offer.repository.CategorieRepository;
import com.offer.repository.OffresValidesRepository;

@Service
public class SuperAdminService {
    @Autowired
    private AppelOffreRepository appelOffreRepository;

    @Autowired
    private CategorieRepository categorieRepository;

    @Autowired 
    private OffresValidesRepository offresValidesRepository;

    public List<Categorie> getAllCategories() {
        return categorieRepository.findAll();
    }

    public int getCountOfAppelOffreByCategorie(UUID categorieId) {
        return appelOffreRepository.findByCategorieId(categorieId).size();
    }

    public Categorie addCategory(Categorie categorie) {
        return categorieRepository.save(categorie);
    }

    public Categorie getCategoryById(UUID id) {
        return categorieRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Category not found"));
    }

    public Categorie updateCategory(UUID id, Categorie newCategorieData) {
        Categorie categorie = categorieRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Category not found"));
        categorie.setNomcategorie(newCategorieData.getNomcategorie());
        categorie.setDescription(newCategorieData.getDescription());
        // Update other fields as necessary
        return categorieRepository.save(categorie);
    }

    public void deleteCategory(UUID id) {
        Categorie categorie = categorieRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Category not found"));
        categorieRepository.delete(categorie);
    }

    public List<Categorie> searchCategoriesByNom(String nomCategorie) {
        return categorieRepository.findByNomCategorieContainingIgnoreCase(nomCategorie);
    }

    public Double getTotalMontantByDateRange(Date startDate, Date endDate) {
        return offresValidesRepository.findTotalMontantByDateRange(startDate, endDate);
    }

    public Double getTotalMontantToday() {
        Date today = new Date();
        Date startOfDay = getStartOfDay(today);
        Date endOfDay = getEndOfDay(today);
        return getTotalMontantByDateRange(startOfDay, endOfDay);
    }

    public Double getTotalMontantLastMonth() {
        Date endOfToday = getEndOfDay(new Date());
        Date startOfLastMonth = getStartOfLastMonth();
        return getTotalMontantByDateRange(startOfLastMonth, endOfToday);
    }

    public Double getTotalMontantLastYear() {
        Date endOfToday = getEndOfDay(new Date());
        Date startOfLastYear = getStartOfLastYear();
        return getTotalMontantByDateRange(startOfLastYear, endOfToday);
    }

    public Long getCountAppelOffresByDateRange(Date startDate, Date endDate) {
        return appelOffreRepository.countAppelOffresByDateRange(startDate, endDate);
    }

    public Long getCountAppelOffresToday() {
        Date today = new Date();
        Date startOfDay = getStartOfDay(today);
        Date endOfDay = getEndOfDay(today);
        return getCountAppelOffresByDateRange(startOfDay, endOfDay);
    }

    public Long getCountAppelOffresLastMonth() {
        Date endOfToday = getEndOfDay(new Date());
        Date startOfLastMonth = getStartOfLastMonth();
        return getCountAppelOffresByDateRange(startOfLastMonth, endOfToday);
    }

    public Long getCountAppelOffresLastYear() {
        Date endOfToday = getEndOfDay(new Date());
        Date startOfLastYear = getStartOfLastYear();
        return getCountAppelOffresByDateRange(startOfLastYear, endOfToday);
    }

    // Helper methods to get date ranges
    public Date getStartOfDay(Date date) {
        Calendar calendar = Calendar.getInstance();
        calendar.setTime(date);
        calendar.set(Calendar.HOUR_OF_DAY, 0);
        calendar.set(Calendar.MINUTE, 0);
        calendar.set(Calendar.SECOND, 0);
        calendar.set(Calendar.MILLISECOND, 0);
        return calendar.getTime();
    }

    public Date getEndOfDay(Date date) {
        Calendar calendar = Calendar.getInstance();
        calendar.setTime(date);
        calendar.set(Calendar.HOUR_OF_DAY, 23);
        calendar.set(Calendar.MINUTE, 59);
        calendar.set(Calendar.SECOND, 59);
        calendar.set(Calendar.MILLISECOND, 999);
        return calendar.getTime();
    }

    public Date getStartOfLastMonth() {
        Calendar calendar = Calendar.getInstance();
        calendar.add(Calendar.DAY_OF_YEAR, -30);
        calendar.set(Calendar.HOUR_OF_DAY, 0);
        calendar.set(Calendar.MINUTE, 0);
        calendar.set(Calendar.SECOND, 0);
        calendar.set(Calendar.MILLISECOND, 0);
        return calendar.getTime();
    }

    public Date getStartOfLastYear() {
        Calendar calendar = Calendar.getInstance();
        calendar.add(Calendar.DAY_OF_YEAR, -365);
        calendar.set(Calendar.HOUR_OF_DAY, 0);
        calendar.set(Calendar.MINUTE, 0);
        calendar.set(Calendar.SECOND, 0);
        calendar.set(Calendar.MILLISECOND, 0);
        return calendar.getTime();
    }

    public Map<String, Double> getTotalMontantByEntrepriseIdAndDateRange(Date startDate, Date endDate) {
        endDate = getEndOfDay(endDate); // Ensure the end date includes the entire day
        List<Object[]> results = offresValidesRepository.findTotalMontantByEntrepriseIdAndDateRange(startDate, endDate);
        Map<String, Double> montantByEntreprise = new HashMap<>();
        for (Object[] result : results) {
            String entrepriseId = (String) result[0];
            Double totalMontant = (Double) result[1];
            montantByEntreprise.put(entrepriseId, totalMontant);
        }
        return montantByEntreprise;
    }
    public Map<UUID, Long> countAppelOffresByEntrepriseIdAndDateRange(Date startDate, Date endDate) {
        endDate = getEndOfDay(endDate); // Ensure the end date includes the entire day
        List<Object[]> results = appelOffreRepository.countAppelOffresByEntrepriseIdAndDateRange(startDate, endDate);
        Map<UUID, Long> appelOffresCountByEntreprise = new HashMap<>();
        for (Object[] result : results) {
            UUID entrepriseId = (UUID) result[0];
            Long count = (Long) result[1];
            appelOffresCountByEntreprise.put(entrepriseId, count);
        }
        return appelOffresCountByEntreprise;
    }
}
