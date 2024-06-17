package com.auth.services.auth;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.auth.dto.EntrepriseDto;
import com.auth.entity.Entreprise;

public interface EntrepriseService {
	Entreprise createEntreprise(EntrepriseDto entrepriseDto);
    void updateEntreprise(UUID entrepriseId, EntrepriseDto entrepriseDto);
	
	void deleteEntreprise(UUID entrepriseId);
    EntrepriseDto getEntrepriseById(UUID id);
    List<EntrepriseDto> getAllEntreprises();
	Entreprise findById(UUID id);
	long getEntrepriseCount();
	List<EntrepriseDto> getEntreprisesByCategoryId(String idcategorie);
	void removeUserFromEntreprise(UUID entrepriseId, UUID userId);
	Optional<Entreprise> findByMatricule(String matricule);
	EntrepriseDto convertToDto(Entreprise entreprise);
}
