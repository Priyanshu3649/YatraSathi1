-- Add passengers table to MySQL schema
CREATE TABLE IF NOT EXISTS `passengers` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `ticket_request_id` BIGINT NOT NULL,   -- FK to ticket_requests.id
  `name` VARCHAR(255) NOT NULL,
  `age` INT NOT NULL,
  `gender` VARCHAR(20) NOT NULL,
  `id_proof_type` VARCHAR(50),
  `id_proof_number` VARCHAR(50),
  PRIMARY KEY (`id`),
  KEY `idx_passenger_ticket` (`ticket_request_id`),
  CONSTRAINT `fk_passenger_ticket` FOREIGN KEY (`ticket_request_id`)
    REFERENCES `ticket_requests` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;