package com.github.cawtoz.enfokids.model.user.types;

import java.util.HashSet;
import java.util.Set;

import com.github.cawtoz.enfokids.model.user.User;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "therapists")
@Data
@EqualsAndHashCode(callSuper = true)
public class Therapist extends User {

    @Column(length = 30, nullable = false)
    private String speciality;
    
    @OneToMany(mappedBy = "therapist")
    private Set<Child> children = new HashSet<>();
    
}
