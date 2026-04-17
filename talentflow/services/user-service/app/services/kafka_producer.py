import json
import logging
import threading
from kafka import KafkaProducer
from app.core.config import settings

logger = logging.getLogger(__name__)

_producer = None
_producer_lock = threading.Lock()


def get_producer() -> KafkaProducer:
    global _producer
    if _producer is None:
        with _producer_lock:
            if _producer is None:
                try:
                    _producer = KafkaProducer(
                        bootstrap_servers=settings.KAFKA_BOOTSTRAP_SERVERS,
                        value_serializer=lambda v: json.dumps(v).encode("utf-8"),
                        key_serializer=lambda k: k.encode("utf-8") if k else None,
                        retries=3,
                        acks="all",
                    )
                    logger.info("Kafka producer connected to %s", settings.KAFKA_BOOTSTRAP_SERVERS)
                except Exception as e:
                    logger.warning("Kafka unavailable: %s — events will be skipped", e)
                    _producer = None
    return _producer


def publish_event(topic: str, key: str, payload: dict):
    """Publish an event to Kafka. Silently skips if Kafka is unavailable (local dev)."""
    try:
        producer = get_producer()
        if producer is None:
            logger.debug("Kafka not available — skipping event topic=%s key=%s", topic, key)
            return
        future = producer.send(topic, key=key, value=payload)
        future.get(timeout=5)
        logger.info("Published event to topic=%s key=%s", topic, key)
    except Exception as e:
        logger.warning("Failed to publish event to %s: %s (non-fatal in dev)", topic, e)
