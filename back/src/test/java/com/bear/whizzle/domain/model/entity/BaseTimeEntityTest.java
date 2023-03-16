package com.bear.whizzle.domain.model.entity;

import static io.lettuce.core.internal.Futures.await;
import static org.assertj.core.api.Assertions.*;

import java.time.Duration;
import javax.persistence.Entity;
import javax.persistence.EntityManager;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.PersistenceContext;
import javax.persistence.Table;
import javax.swing.plaf.TableHeaderUI;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;
import lombok.experimental.SuperBuilder;
import lombok.extern.slf4j.Slf4j;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@Slf4j
class BaseTimeEntityTest {

    @PersistenceContext
    private EntityManager entityManager;

    @BeforeEach
    void beforeEach() {
        entityManager.persist(
                BaseTime.builder()
                        .id(1L)
                        .data(1)
                        .build()
        );
        entityManager.flush();
        entityManager.clear();
    }

    @Test
    @Transactional
    void createTimeTest() {
        BaseTime actual = entityManager.find(BaseTime.class, 1L);
        assertThat(actual.getCreatedDateTime()).isNotNull();
        assertThat(actual.getModifiedDateTime()).isNotNull();
        log.debug("found baseTime: {}", actual);
    }

    @Test
    @Transactional
    void modifyTimeTest() throws InterruptedException {
        // given
        BaseTime found = entityManager.find(BaseTime.class, 1L);
        log.debug("found baseTime: {}", found);

        // when
        found.plusData();
        log.debug("modified and not flushed baseTime: {}", found);
        entityManager.flush();
        log.debug("modified and flushed baseTime: {}", found);
        entityManager.clear();

        // then
        BaseTime actual = entityManager.find(BaseTime.class, 1L);
        assertThat(actual.getCreatedDateTime()).isNotEqualTo(actual.getModifiedDateTime());
    }

    @Entity
    @Table(name = "base_time")
    @NoArgsConstructor(access = AccessLevel.PROTECTED)
    @AllArgsConstructor(access = AccessLevel.PRIVATE)
    @Getter
    @Builder
    @ToString(callSuper = true)
    private static class BaseTime extends BaseTimeEntity {

        @Id
        private Long id;

        private Integer data;

        public synchronized void plusData() throws InterruptedException {
            wait(Duration.ofSeconds(1).toMillis());
            this.data++;
        }

    }

}