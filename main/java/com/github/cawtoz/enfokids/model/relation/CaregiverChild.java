package com.github.cawtoz.enfokids.model.relation;

import com.github.cawtoz.enfokids.model.user.types.Caregiver;
import com.github.cawtoz.enfokids.model.user.types.Child;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "caregivers_children")
@Data
public class CaregiverChild {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
        foreignKey = @ForeignKey(name = "fk_caregivers_children_caregivers")
    )
    private Caregiver caregiver;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
        foreignKey = @ForeignKey(name = "fk_caregivers_children_children")
    )
    private Child child;

    @Column(length = 30, nullable = false)
    private String relationship;

}
