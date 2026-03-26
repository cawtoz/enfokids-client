package com.github.cawtoz.enfokids.model.activity;

import com.github.cawtoz.enfokids.model.user.types.Therapist;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "activity_plans")
@Data
public class ActivityPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
        nullable = false,
        foreignKey = @ForeignKey(name = "fk_activity_plans_therapist")
    )
    private Therapist therapist;

    @Column(length = 100, nullable = false)
    private String title;

    @Column(length = 3000)
    private String description;

    @OneToMany(mappedBy = "plan", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PlanDetail> details = new ArrayList<>();

}