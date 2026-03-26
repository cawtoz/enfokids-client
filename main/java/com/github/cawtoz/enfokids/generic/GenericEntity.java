package com.github.cawtoz.enfokids.generic;

import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

public class GenericEntity<T> {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private T id;
    
}
