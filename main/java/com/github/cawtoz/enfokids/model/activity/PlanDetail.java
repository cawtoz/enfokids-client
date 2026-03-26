package com.github.cawtoz.enfokids.model.activity;

import com.github.cawtoz.enfokids.model.activity.enums.FrequencyUnitEnum;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
@Table(name = "plan_details")
@Data
public class PlanDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
        nullable = false,
        foreignKey = @ForeignKey(name = "fk_plan_details_activity_plan")
    )
    private ActivityPlan plan;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
        nullable = false,
        foreignKey = @ForeignKey(name = "fk_plan_details_activity")
    )
    private Activity activity;

    @Enumerated(EnumType.STRING)
    @Column(length = 30, nullable = false)
    private FrequencyUnitEnum frequencyUnit;

    @Column(nullable = false)
    private Integer frequencyCount;

    @Column(nullable = false)
    private Integer repetitions;

    private Integer estimatedDuration;
    
}
