package com.offer.entity;

import java.util.Date;
import java.util.List;
import java.util.UUID;

import jakarta.persistence.*;
import lombok.Data;
import lombok.ToString;

@Entity
@Data
@Table(name = "appeloffres")
@ToString(exclude = {"offres"}) // Exclude the collection to prevent recursion
public class AppelOffre {
    @Id
    @GeneratedValue(generator = "UUID")
    private UUID id;
    @Temporal(TemporalType.TIMESTAMP)
    private Date datecreation = new Date();
    @OneToMany(mappedBy = "appeloffre", cascade = CascadeType.MERGE, orphanRemoval = true)
    private List<Offre> offres; 
    private String titre;
    private String localisation;
    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String description;
    private Date datelimitesoumission;
    private UUID entrepriseId;
    @Lob
    @Column(columnDefinition = "longblob")
    private byte[] img;
    @Lob
    @Column(columnDefinition = "longblob")
    private byte[] document;
    @ManyToOne
    @JoinColumn(name = "categorie_id", nullable = false)
    private Categorie categorie;
}
