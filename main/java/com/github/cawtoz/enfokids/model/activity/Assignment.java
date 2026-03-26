package com.github.cawtoz.enfokids.model.activity;

import java.time.LocalDateTime;

import com.github.cawtoz.enfokids.model.activity.enums.AssignmentStatusEnum;
import com.github.cawtoz.enfokids.model.activity.enums.FrequencyUnitEnum;
import com.github.cawtoz.enfokids.model.user.types.Child;
import com.github.cawtoz.enfokids.model.user.types.Therapist;

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
@Table(name = "assignments")
@Data
public class Assignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
        nullable = false,
        foreignKey = @ForeignKey(name = "fk_assignments_therapist")
    )
    private Therapist therapist;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
        nullable = false,
        foreignKey = @ForeignKey(name = "fk_assignments_child")
    )
    private Child child;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
        nullable = false,
        foreignKey = @ForeignKey(name = "fk_assignments_activity")
    )
    private Activity activity;

    @Column(nullable = false)
    private LocalDateTime startDate;

    @Column(nullable = false)
    private LocalDateTime endDate;

    @Enumerated(EnumType.STRING)
    @Column(length = 30, nullable = false)
    private FrequencyUnitEnum frequencyUnit;

    @Column(nullable = false)
    private Integer frequencyCount;

    @Column(nullable = false)
    private Integer repetitions;

    private Integer estimatedDuration;

    @Enumerated(EnumType.STRING)
    @Column(length = 30, nullable = false)
    private AssignmentStatusEnum status;

}
