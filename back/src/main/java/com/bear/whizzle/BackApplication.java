package com.bear.whizzle;

import java.time.ZoneId;
import java.util.TimeZone;
import javax.annotation.PostConstruct;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class BackApplication {

    public static void main(String[] args) {
        SpringApplication.run(BackApplication.class, args);
    }

    @PostConstruct
    private void started() {
        TimeZone.setDefault(
                TimeZone.getTimeZone(ZoneId.of("Asia/Seoul"))
        );
    }

}
