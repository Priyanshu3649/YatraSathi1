package com.yatrasathi.train;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TrainRepository extends JpaRepository<Train, Long> {
    Optional<Train> findByTrainNumber(String trainNumber);
    List<Train> findByTrainNameContainingIgnoreCase(String trainName);
    List<Train> findByDepartureStation_StationCodeAndArrivalStation_StationCode(String departureStationCode, String arrivalStationCode);
}