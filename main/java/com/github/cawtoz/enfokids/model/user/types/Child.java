package com.github.cawtoz.enfokids.model.user.types;

import java.util.HashSet;
import java.util.Set;

import com.github.cawtoz.enfokids.model.relation.CaregiverChild;
import com.github.cawtoz.enfokids.model.user.User;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "children")
@Getter
@Setter
public class Child extends User {

    @OneToMany(mappedBy = "child")
    private Set<CaregiverChild> caregiverChildren = new HashSet<>();
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "therapist_id", nullable = false)
    private Therapist therapist;
    
    @Column(name = "diagnosis", length = 500)
    private String diagnosis;
    
}
