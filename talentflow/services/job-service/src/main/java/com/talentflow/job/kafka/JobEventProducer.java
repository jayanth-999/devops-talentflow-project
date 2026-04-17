package com.talentflow.job.kafka;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.CompletableFuture;

@Slf4j
@Service
@RequiredArgsConstructor
public class JobEventProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public static final String TOPIC_JOB_POSTED       = "job.posted";
    public static final String TOPIC_APP_SUBMITTED     = "application.sent";

    public void publishJobPosted(Map<String, Object> payload) {
        sendEvent(TOPIC_JOB_POSTED, (String) payload.get("jobId"), payload);
    }

    public void publishApplicationSubmitted(Map<String, Object> payload) {
        sendEvent(TOPIC_APP_SUBMITTED, (String) payload.get("applicationId"), payload);
    }

    private void sendEvent(String topic, String key, Object payload) {
        CompletableFuture<SendResult<String, Object>> future = kafkaTemplate.send(topic, key, payload);
        future.whenComplete((result, ex) -> {
            if (ex != null) {
                log.error("Failed to send event to topic={} key={}: {}", topic, key, ex.getMessage());
            } else {
                log.info("Event sent to topic={} key={} partition={} offset={}",
                    topic, key,
                    result.getRecordMetadata().partition(),
                    result.getRecordMetadata().offset());
            }
        });
    }
}
