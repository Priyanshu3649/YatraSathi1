package com.yatrasathi.train;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TrainService {
    private final TrainRepository trainRepository;
    private final StationRepository stationRepository;
    
    public TrainService(TrainRepository trainRepository, StationRepository stationRepository) {
        this.trainRepository = trainRepository;
        this.stationRepository = stationRepository;
    }
    
    public List<Train> getAllTrains() {
        return trainRepository.findAll();
    }
    
    public Train getTrainById(Long id) {
        return trainRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Train not found with id: " + id));
    }
    
    public Train getTrainByNumber(String trainNumber) {
        return trainRepository.findByTrainNumber(trainNumber)
                .orElseThrow(() -> new RuntimeException("Train not found with number: " + trainNumber));
    }
    
    public List<Train> searchTrainsByName(String trainName) {
        return trainRepository.findByTrainNameContainingIgnoreCase(trainName);
    }
    
    public List<Train> searchTrainsByRoute(String departureStationCode, String arrivalStationCode) {
        return trainRepository.findByDepartureStation_StationCodeAndArrivalStation_StationCode(
                departureStationCode, arrivalStationCode);
    }
    
    public Train saveTrain(Train train) {
        return trainRepository.save(train);
    }
    
    public void deleteTrain(Long id) {
        trainRepository.deleteById(id);
    }
}