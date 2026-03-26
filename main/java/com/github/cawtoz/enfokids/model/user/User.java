package com.github.cawtoz.enfokids.model.user;

import java.util.HashSet;
import java.util.Set;

import com.github.cawtoz.enfokids.model.role.Role;
import com.github.cawtoz.enfokids.model.role.RoleEnum;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Inheritance;
import jakarta.persistence.InheritanceType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "users")
@Inheritance(strategy = InheritanceType.JOINED)
@Data
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @Column(length = 20, unique = true, nullable = false)
    private String username;

    @Column(length = 60, nullable = false)
    private String password;

    @Column(length = 60, unique = true, nullable = false)
    private String email;

    @Column(length = 40, nullable = false)
    private String firstName;

    @Column(length = 40, nullable = false)
    private String lastName;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "users_roles",
        joinColumns = @JoinColumn(
            foreignKey = @ForeignKey(name = "fk_users_roles_users")
        ),
        inverseJoinColumns = @JoinColumn(
            foreignKey = @ForeignKey(name = "fk_users_roles_roles")
        )
    )
    private Set<Role> roles = new HashSet<>();
    
    // ===== Métodos helper para verificar roles =====
    
    /**
     * Verifica si el usuario tiene un rol específico.
     * 
     * @param role El rol a verificar
     * @return true si el usuario tiene el rol, false en caso contrario
     */
    public boolean hasRole(RoleEnum role) {
        return roles.stream()
                .anyMatch(r -> r.getName().equals(role));
    }
    
    /**
     * Verifica si el usuario es ADMIN.
     * 
     * @return true si es ADMIN, false en caso contrario
     */
    public boolean isAdmin() {
        return hasRole(RoleEnum.ADMIN);
    }
    
    /**
     * Verifica si el usuario es THERAPIST.
     * 
     * @return true si es THERAPIST, false en caso contrario
     */
    public boolean isTherapist() {
        return hasRole(RoleEnum.THERAPIST);
    }
    
    /**
     * Verifica si el usuario es CAREGIVER.
     * 
     * @return true si es CAREGIVER, false en caso contrario
     */
    public boolean isCaregiver() {
        return hasRole(RoleEnum.CAREGIVER);
    }
    
    /**
     * Verifica si el usuario es CHILD.
     * 
     * @return true si es CHILD, false en caso contrario
     */
    public boolean isChild() {
        return hasRole(RoleEnum.CHILD);
    }
    
    /**
     * Verifica si este usuario es el propietario de un recurso.
     * 
     * @param userId ID del usuario propietario del recurso
     * @return true si es el mismo usuario, false en caso contrario
     */
    public boolean isOwner(Long userId) {
        return this.id != null && this.id.equals(userId);
    }
    
    /**
     * Verifica si el usuario puede acceder a un recurso.
     * Es propietario o es ADMIN.
     * 
     * @param userId ID del usuario propietario del recurso
     * @return true si puede acceder, false en caso contrario
     */
    public boolean canAccess(Long userId) {
        return isAdmin() || isOwner(userId);
    }
    
}
