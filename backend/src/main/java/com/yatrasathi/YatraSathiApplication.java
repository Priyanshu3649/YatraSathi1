package com.yatrasathi;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class YatraSathiApplication {
    public static void main(String[] args) {
        SpringApplication.run(YatraSathiApplication.class, args);
    }
}


