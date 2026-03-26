package com.github.cawtoz.enfokids.config;

import com.github.cawtoz.enfokids.model.role.Role;
import com.github.cawtoz.enfokids.model.role.RoleEnum;
import com.github.cawtoz.enfokids.model.user.types.Caregiver;
import com.github.cawtoz.enfokids.model.user.types.Child;
import com.github.cawtoz.enfokids.model.user.types.Therapist;
import com.github.cawtoz.enfokids.model.user.User;
import com.github.cawtoz.enfokids.repository.RoleRepository;
import com.github.cawtoz.enfokids.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

// Nuevos imports para actividades y planes
import com.github.cawtoz.enfokids.model.activity.Activity;
import com.github.cawtoz.enfokids.model.activity.ActivityPlan;
import com.github.cawtoz.enfokids.model.activity.PlanDetail;
import com.github.cawtoz.enfokids.model.activity.enums.ActivityTypeEnum;
import com.github.cawtoz.enfokids.model.activity.enums.FrequencyUnitEnum;
import com.github.cawtoz.enfokids.repository.ActivityRepository;
import com.github.cawtoz.enfokids.repository.ActivityPlanRepository;
import com.github.cawtoz.enfokids.repository.TherapistRepository;

@Component
@Profile("default")
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // Repositorios nuevos
    @Autowired
    private ActivityRepository activityRepository;

    @Autowired
    private ActivityPlanRepository activityPlanRepository;

    @Autowired
    private TherapistRepository therapistRepository;

    @Override
    @Transactional
    public void run(String... args) {
        // Crear roles si no existen
        createRoleIfNotFound(RoleEnum.ADMIN);
        createRoleIfNotFound(RoleEnum.THERAPIST);
        createRoleIfNotFound(RoleEnum.CAREGIVER);
        createRoleIfNotFound(RoleEnum.CHILD);
        createRoleIfNotFound(RoleEnum.USER);

        // Crear usuarios de prueba
        createAdminIfNotFound();
        createTherapistIfNotFound();
        createCaregiverIfNotFound();
        createChildIfNotFound();

        // Crear actividades y planes orientados a TDAH
        createActivitiesAndPlansIfNotFound();
    }

    private void createRoleIfNotFound(RoleEnum roleEnum) {
        Optional<Role> existing = roleRepository.findByName(roleEnum);
        if (existing.isEmpty()) {
            Role r = new Role();
            r.setName(roleEnum);
            roleRepository.save(r);
        }
    }

    private void createAdminIfNotFound() {
        String username = "admin";
        if (userRepository.findByUsername(username).isPresent()) return;

        User u = new User();
        u.setUsername(username);
        u.setPassword(passwordEncoder.encode("adminpass"));
        u.setEmail("admin@example.com");
        u.setFirstName("Admin");
        u.setLastName("User");

        Role role = roleRepository.findByName(RoleEnum.ADMIN).orElseThrow();
        u.getRoles().add(role);

        userRepository.save(u);
    }

    private void createTherapistIfNotFound() {
        String username = "therapist";
        if (userRepository.findByUsername(username).isPresent()) return;

        Therapist t = new Therapist();
        t.setUsername(username);
        t.setPassword(passwordEncoder.encode("therapistpass"));
        t.setEmail("therapist@example.com");
        t.setFirstName("Ana");
        t.setLastName("Terapeuta");
        t.setSpeciality("Terapia conductual");

        Role role = roleRepository.findByName(RoleEnum.THERAPIST).orElseThrow();
        t.getRoles().add(role);

        userRepository.save(t);
    }

    private void createCaregiverIfNotFound() {
        String username = "caregiver";
        if (userRepository.findByUsername(username).isPresent()) return;

        Caregiver c = new Caregiver();
        c.setUsername(username);
        c.setPassword(passwordEncoder.encode("caregiverpass"));
        c.setEmail("caregiver@example.com");
        c.setFirstName("Carlos");
        c.setLastName("Cuidador");

        Role role = roleRepository.findByName(RoleEnum.CAREGIVER).orElseThrow();
        c.getRoles().add(role);

        userRepository.save(c);
    }

    private void createChildIfNotFound() {
        String username = "child";
        if (userRepository.findByUsername(username).isPresent()) return;

        // Necesitamos asignar un terapeuta existente
        Optional<User> therapistOpt = userRepository.findByUsername("therapist");
        if (therapistOpt.isEmpty()) return; // si no existe el terapeuta, saltar

        Therapist therapist = (Therapist) therapistOpt.get();

        Child ch = new Child();
        ch.setUsername(username);
        ch.setPassword(passwordEncoder.encode("childpass"));
        ch.setEmail("child@example.com");
        ch.setFirstName("Pepe");
        ch.setLastName("Niño");
        ch.setDiagnosis("TDAH leve");
        ch.setTherapist(therapist);

        Role role = roleRepository.findByName(RoleEnum.CHILD).orElseThrow();
        ch.getRoles().add(role);

        userRepository.save(ch);
    }

    private void createActivitiesAndPlansIfNotFound() {
        // Buscar terapeuta para asignar los planes
        Optional<Therapist> therapistOpt = therapistRepository.findAll().stream().findFirst();
        if (therapistOpt.isEmpty()) return; // si no hay terapeutas, no crear
        Therapist therapist = therapistOpt.get();

        // Actividades útiles para niños con TDAH (títulos y descripciones en español)
        Activity respiracionConsciente = findOrCreateActivity(
            "Respiración consciente",
            "Ejercicio breve de respiración guiada para reducir impulsividad y mejorar la atención. 1-2 minutos de respiración profunda y controlada.",
            ActivityTypeEnum.NON_DIGITAL
        );

        Activity juegoMemoria = findOrCreateActivity(
            "Juego de memoria",
            "Juego digital de memoria para trabajar la atención sostenida: voltea cartas e intenta recordar posiciones.",
            ActivityTypeEnum.DIGITAL
        );

        Activity juegoParejas = findOrCreateActivity(
            "Juego de encontrar parejas",
            "Juego digital para buscar pares y mejorar la memoria de trabajo y la atención al detalle.",
            ActivityTypeEnum.DIGITAL
        );

        Activity pausaActiva = findOrCreateActivity(
            "Pausa activa",
            "Pausas cortas con movimientos suaves, estiramientos o caminata corta para regular la energía y mejorar la concentración.",
            ActivityTypeEnum.NON_DIGITAL
        );

        Activity cajaSensorial = findOrCreateActivity(
            "Caja sensorial",
            "Caja con objetos de diferentes texturas que el niño puede manipular para calmarse: pelotas antiestrés, telas, cuentas.",
            ActivityTypeEnum.NON_DIGITAL
        );

        Activity descomponerTarea = findOrCreateActivity(
            "Descomposición de tarea",
            "Dividir tareas grandes en pasos pequeños y claros, con listas de verificación visuales para facilitar la ejecución.",
            ActivityTypeEnum.NON_DIGITAL
        );

        Activity horarioVisual = findOrCreateActivity(
            "Horario visual",
            "Horario con imágenes para estructurar la rutina diaria y reducir la incertidumbre, facilitando la planificación.",
            ActivityTypeEnum.NON_DIGITAL
        );

        Activity chequeoEmocional = findOrCreateActivity(
            "Chequeo emocional",
            "Ejercicio breve para que el niño identifique cómo se siente (colores o termómetro emocional) y aplique una estrategia breve si está agitado.",
            ActivityTypeEnum.NON_DIGITAL
        );

        Activity rinconCalma = findOrCreateActivity(
            "Rincón de calma",
            "Espacio con objetos sensoriales y guía de respiración para que el niño se regule durante 3-5 minutos.",
            ActivityTypeEnum.NON_DIGITAL
        );

        Activity prepararMateriales = findOrCreateActivity(
            "Preparar materiales",
            "Organizar lápiz, cuaderno y espacio de trabajo antes de comenzar una tarea para reducir distracciones.",
            ActivityTypeEnum.NON_DIGITAL
        );

        // Planes (títulos y descripciones en español)
        ActivityPlan rutinaMatutina = new ActivityPlan();
        rutinaMatutina.setTherapist(therapist);
        rutinaMatutina.setTitle("Rutina matutina para el enfoque");
        rutinaMatutina.setDescription("Secuencia breve para empezar el día con mayor atención: respiración, revisión de tareas y breve actividad física.");

        PlanDetail p1 = new PlanDetail();
        p1.setPlan(rutinaMatutina);
        p1.setActivity(respiracionConsciente);
        p1.setFrequencyUnit(FrequencyUnitEnum.DAY);
        p1.setFrequencyCount(1);
        p1.setRepetitions(1);
        p1.setEstimatedDuration(3);

        PlanDetail p2 = new PlanDetail();
        p2.setPlan(rutinaMatutina);
        p2.setActivity(horarioVisual);
        p2.setFrequencyUnit(FrequencyUnitEnum.DAY);
        p2.setFrequencyCount(1);
        p2.setRepetitions(1);
        p2.setEstimatedDuration(5);

        PlanDetail p3 = new PlanDetail();
        p3.setPlan(rutinaMatutina);
        p3.setActivity(pausaActiva);
        p3.setFrequencyUnit(FrequencyUnitEnum.DAY);
        p3.setFrequencyCount(1);
        p3.setRepetitions(1);
        p3.setEstimatedDuration(5);

        rutinaMatutina.getDetails().add(p1);
        rutinaMatutina.getDetails().add(p2);
        rutinaMatutina.getDetails().add(p3);

        // Plan para tareas (bloques)
        ActivityPlan planTareas = new ActivityPlan();
        planTareas.setTherapist(therapist);
        planTareas.setTitle("Plan de tareas por bloques");
        planTareas.setDescription("Estrategia para realizar tareas escolares en bloques usando juegos cortos y descomposición de tareas para mantener la motivación.");

        PlanDetail q1 = new PlanDetail();
        q1.setPlan(planTareas);
        q1.setActivity(descomponerTarea);
        q1.setFrequencyUnit(FrequencyUnitEnum.WEEK);
        q1.setFrequencyCount(5);
        q1.setRepetitions(1);
        q1.setEstimatedDuration(10);

        PlanDetail q2 = new PlanDetail();
        q2.setPlan(planTareas);
        q2.setActivity(juegoMemoria);
        q2.setFrequencyUnit(FrequencyUnitEnum.WEEK);
        q2.setFrequencyCount(5);
        q2.setRepetitions(1);
        q2.setEstimatedDuration(10);

        PlanDetail q3 = new PlanDetail();
        q3.setPlan(planTareas);
        q3.setActivity(pausaActiva);
        q3.setFrequencyUnit(FrequencyUnitEnum.WEEK);
        q3.setFrequencyCount(5);
        q3.setRepetitions(1);
        q3.setEstimatedDuration(5);

        planTareas.getDetails().add(q1);
        planTareas.getDetails().add(q2);
        planTareas.getDetails().add(q3);

        // Plan de autorregulación breve
        ActivityPlan planAutorreg = new ActivityPlan();
        planAutorreg.setTherapist(therapist);
        planAutorreg.setTitle("Plan de autorregulación breve");
        planAutorreg.setDescription("Ejercicios breves para ayudar al niño a reconocer y regular sus emociones y niveles de activación.");

        PlanDetail rdet1 = new PlanDetail();
        rdet1.setPlan(planAutorreg);
        rdet1.setActivity(chequeoEmocional);
        rdet1.setFrequencyUnit(FrequencyUnitEnum.DAY);
        rdet1.setFrequencyCount(1);
        rdet1.setRepetitions(1);
        rdet1.setEstimatedDuration(2);

        PlanDetail rdet2 = new PlanDetail();
        rdet2.setPlan(planAutorreg);
        rdet2.setActivity(rinconCalma);
        rdet2.setFrequencyUnit(FrequencyUnitEnum.DAY);
        rdet2.setFrequencyCount(1);
        rdet2.setRepetitions(1);
        rdet2.setEstimatedDuration(5);

        planAutorreg.getDetails().add(rdet1);
        planAutorreg.getDetails().add(rdet2);

        // Plan de transición y organización
        ActivityPlan planTransicion = new ActivityPlan();
        planTransicion.setTherapist(therapist);
        planTransicion.setTitle("Plan de transición y organización");
        planTransicion.setDescription("Rutina para preparar al niño antes de comenzar una tarea: organizar materiales, objetivos claros y bloques de tiempo cortos.");

        PlanDetail tdet1 = new PlanDetail();
        tdet1.setPlan(planTransicion);
        tdet1.setActivity(prepararMateriales);
        tdet1.setFrequencyUnit(FrequencyUnitEnum.DAY);
        tdet1.setFrequencyCount(1);
        tdet1.setRepetitions(1);
        tdet1.setEstimatedDuration(5);

        PlanDetail tdet2 = new PlanDetail();
        tdet2.setPlan(planTransicion);
        tdet2.setActivity(juegoParejas);
        tdet2.setFrequencyUnit(FrequencyUnitEnum.DAY);
        tdet2.setFrequencyCount(3);
        tdet2.setRepetitions(1);
        tdet2.setEstimatedDuration(15);

        planTransicion.getDetails().add(tdet1);
        planTransicion.getDetails().add(tdet2);

        // Guardar actividades y planes (las relaciones cascade deberían guardar PlanDetails)
        activityRepository.save(respiracionConsciente);
        activityRepository.save(juegoMemoria);
        activityRepository.save(juegoParejas);
        activityRepository.save(pausaActiva);
        activityRepository.save(cajaSensorial);
        activityRepository.save(descomponerTarea);
        activityRepository.save(horarioVisual);
        activityRepository.save(chequeoEmocional);
        activityRepository.save(rinconCalma);
        activityRepository.save(prepararMateriales);

        activityPlanRepository.save(rutinaMatutina);
        activityPlanRepository.save(planTareas);
        activityPlanRepository.save(planAutorreg);
        activityPlanRepository.save(planTransicion);
    }

    private Activity findOrCreateActivity(String title, String description, ActivityTypeEnum type) {
        return activityRepository.findAll().stream()
                .filter(a -> a.getTitle().equalsIgnoreCase(title))
                .findFirst()
                .orElseGet(() -> {
                    Activity act = new Activity();
                    act.setTitle(title);
                    act.setDescription(description);
                    act.setType(type);
                    return activityRepository.save(act);
                });
    }

}

