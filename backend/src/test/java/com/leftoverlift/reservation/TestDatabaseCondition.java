package com.leftoverlift.reservation;

import org.junit.jupiter.api.extension.ConditionEvaluationResult;
import org.junit.jupiter.api.extension.ExecutionCondition;
import org.junit.jupiter.api.extension.ExtensionContext;

import java.sql.Connection;
import java.sql.DriverManager;

/**
 * Runs the database-backed tests only when a PostgreSQL test database is reachable, so `mvn test`
 * still passes on a machine that has not created it. To enable them:
 * <pre>CREATE DATABASE leftoverlift_test OWNER leftoverlift;</pre>
 */
public class TestDatabaseCondition implements ExecutionCondition {

    static final String URL = "jdbc:postgresql://localhost:5432/leftoverlift_test";
    static final String USER = "leftoverlift";
    static final String PASSWORD = "leftoverlift";

    @Override
    public ConditionEvaluationResult evaluateExecutionCondition(ExtensionContext context) {
        try (Connection ignored = DriverManager.getConnection(URL, USER, PASSWORD)) {
            return ConditionEvaluationResult.enabled("Test database is reachable");
        } catch (Exception e) {
            return ConditionEvaluationResult.disabled(
                    "Skipped: create the 'leftoverlift_test' database to run this test (CREATE DATABASE leftoverlift_test OWNER leftoverlift;)");
        }
    }
}
