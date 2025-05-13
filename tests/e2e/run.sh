#!/bin/bash
set -e

# Define directories
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
DOCKER_COMPOSE_FILE="$SCRIPT_DIR/docker-compose.test.yml"
TEST_RESULTS_DIR="$SCRIPT_DIR/test-results"

# Parse arguments
NO_DOCKER=false
HELP=false
CLEAN=false

for arg in "$@"; do
  case $arg in
    --no-docker)
      NO_DOCKER=true
      shift
      ;;
    --help)
      HELP=true
      shift
      ;;
    --clean)
      CLEAN=true
      shift
      ;;
    *)
      # Unknown option
      ;;
  esac
done

# Display help
if [ "$HELP" = true ]; then
  echo "Usage: run.sh [options]"
  echo ""
  echo "Options:"
  echo "  --no-docker    Run tests without Docker (assumes services are already running)"
  echo "  --clean        Force clean all containers and volumes before running tests"
  echo "  --help         Display this help message"
  exit 0
fi

echo "===== Starting E2E Test Suite ====="

# Create test results directory if it doesn't exist
mkdir -p "$TEST_RESULTS_DIR"

# Skip Docker if requested
if [ "$NO_DOCKER" = false ]; then
  # Clean up any existing test containers
  echo "Cleaning up any existing test environment..."
  cd "$SCRIPT_DIR"
  
  if [ "$CLEAN" = true ]; then
    docker-compose -f "$DOCKER_COMPOSE_FILE" down -v --remove-orphans
  else
    docker-compose -f "$DOCKER_COMPOSE_FILE" down 2>/dev/null || true
  fi

  # Start the test environment
  echo "Starting test environment..."
  docker-compose -f "$DOCKER_COMPOSE_FILE" up -d --build
  
  # Check if server is healthy
  echo "Checking if server is healthy..."
  attempts=0
  max_attempts=30
  
  while [ $attempts -lt $max_attempts ]; do
    if docker-compose -f "$DOCKER_COMPOSE_FILE" ps | grep server | grep healthy > /dev/null; then
      echo "Server is healthy!"
      break
    fi
    
    attempts=$((attempts+1))
    echo "Waiting for server to be ready... ($attempts/$max_attempts)"
    sleep 2
    
    if [ $attempts -eq $max_attempts ]; then
      echo "Server failed to become healthy after $max_attempts attempts"
      docker-compose -f "$DOCKER_COMPOSE_FILE" logs server
      docker-compose -f "$DOCKER_COMPOSE_FILE" down
      exit 1
    fi
  done

  # Run the tests
  echo "Running tests in Docker environment..."
  docker-compose -f "$DOCKER_COMPOSE_FILE" run --rm test-runner
  TEST_EXIT_CODE=$?

  # Show test runner logs
  echo "Test runner logs:"
  docker-compose -f "$DOCKER_COMPOSE_FILE" logs test-runner

  # Copy test results if they exist
  if [ -f "$TEST_RESULTS_DIR/test-results.json" ]; then
    echo "Test results saved to $TEST_RESULTS_DIR/test-results.json"
  fi

  # Clean up
  echo "Cleaning up test environment..."
  docker-compose -f "$DOCKER_COMPOSE_FILE" down
else
  # Run tests directly without Docker
  echo "Running tests locally (--no-docker specified)..."
  cd "$SCRIPT_DIR"
  npx vitest run
  TEST_EXIT_CODE=$?
fi

# Exit with the test result
if [ $TEST_EXIT_CODE -eq 0 ]; then
  echo "===== E2E Tests PASSED ====="
  exit 0
else
  echo "===== E2E Tests FAILED ====="
  exit 1
fi