package com.github.cawtoz.enfokids.model.user.types;

import java.util.HashSet;
import java.util.Set;

import com.github.cawtoz.enfokids.model.relation.CaregiverChild;
import com.github.cawtoz.enfokids.model.user.User;

import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "caregivers")
public class Caregiver extends User {

    @OneToMany(mappedBy = "caregiver")
    private Set<CaregiverChild> caregiverChildren = new HashSet<>();

}
