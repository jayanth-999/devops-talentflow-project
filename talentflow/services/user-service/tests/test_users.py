from unittest.mock import patch
from fastapi.testclient import TestClient


def test_health_check(client: TestClient):
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "user-service"


def test_register_user_success(client: TestClient):
    with patch("app.services.kafka_producer.publish_event"):
        response = client.post("/api/v1/auth/register", json={
            "email": "test@example.com",
            "username": "testuser",
            "password": "Secure123!",
            "role": "job_seeker"
        })
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "test@example.com"
    assert data["username"] == "testuser"
    assert "hashed_password" not in data


def test_register_duplicate_email(client: TestClient):
    with patch("app.services.kafka_producer.publish_event"):
        client.post("/api/v1/auth/register", json={
            "email": "dup@example.com",
            "username": "user_dup1",
            "password": "Secure123!",
            "role": "job_seeker"
        })
        response = client.post("/api/v1/auth/register", json={
            "email": "dup@example.com",
            "username": "user_dup2",
            "password": "Secure123!",
            "role": "job_seeker"
        })
    assert response.status_code == 400
    assert "Email already registered" in response.json()["detail"]


def test_login_success(client: TestClient):
    with patch("app.services.kafka_producer.publish_event"):
        client.post("/api/v1/auth/register", json={
            "email": "login@example.com",
            "username": "loginuser",
            "password": "Secure123!",
            "role": "job_seeker"
        })

    response = client.post("/api/v1/auth/login", json={
        "email": "login@example.com",
        "password": "Secure123!"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"


def test_login_invalid_credentials(client: TestClient):
    response = client.post("/api/v1/auth/login", json={
        "email": "wrong@example.com",
        "password": "wrongpass"
    })
    assert response.status_code == 401


def test_get_me_unauthenticated(client: TestClient):
    response = client.get("/api/v1/users/me")
    assert response.status_code == 403


def test_get_me_authenticated(client: TestClient):
    # Register + login
    with patch("app.services.kafka_producer.publish_event"):
        client.post("/api/v1/auth/register", json={
            "email": "me@example.com",
            "username": "meuser",
            "password": "Secure123!",
            "role": "employer"
        })

    login_response = client.post("/api/v1/auth/login", json={
        "email": "me@example.com",
        "password": "Secure123!"
    })
    assert login_response.status_code == 200
    token = login_response.json()["access_token"]

    with patch("app.core.security.is_token_blacklisted", return_value=False):
        response = client.get(
            "/api/v1/users/me",
            headers={"Authorization": f"Bearer {token}"}
        )

    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "me@example.com"
    assert data["role"] == "employer"


def test_update_me(client: TestClient):
    with patch("app.services.kafka_producer.publish_event"):
        client.post("/api/v1/auth/register", json={
            "email": "update@example.com",
            "username": "updateuser",
            "password": "Secure123!",
            "role": "job_seeker"
        })

    token = client.post("/api/v1/auth/login", json={
        "email": "update@example.com",
        "password": "Secure123!"
    }).json()["access_token"]

    with patch("app.core.security.is_token_blacklisted", return_value=False):
        response = client.put(
            "/api/v1/users/me",
            json={"full_name": "Updated Name"},
            headers={"Authorization": f"Bearer {token}"}
        )

    assert response.status_code == 200
    assert response.json()["full_name"] == "Updated Name"
