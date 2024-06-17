package com.offer.entity;

import java.util.Date;
import java.util.UUID;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "offresvalides")
public class OffresValides {
    @Id
    @GeneratedValue(generator = "UUID")
    private UUID id;
    private String numtel;
    private double montant;
    private Date delaisderealisation;
    private String entrepriseid;
    private String userid;
    @Temporal(TemporalType.TIMESTAMP)
    private Date datevalidation = new Date();
    @Lob
    @Column(columnDefinition = "longblob")
    private byte[] documentdeproposition;
    @Temporal(TemporalType.TIMESTAMP)
    private Date datededepot = new Date();
    @ManyToOne
    @JoinColumn(name = "appeloffre_id", nullable = false)
    private AppelOffre appeloffre;
}
