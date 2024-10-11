import os
import pytest
import testinfra

def test_os_release_file(host):
  f = host.file("/etc/os-release")
  assert f.exists
  assert f.contains("Debian")

def test_docker_installed(host):
  docker = host.package("docker-ce")
  assert docker.is_installed


def test_docker_running_and_enabled(host):
  docker = host.service("docker")
  assert docker.is_running
  assert docker.is_enabled
