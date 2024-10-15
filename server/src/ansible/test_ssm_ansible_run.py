import unittest
from unittest.mock import patch, MagicMock
import subprocess

class TestSSMAnsibleRun(unittest.TestCase):

  @patch('requests.post')
  @patch('requests_unixsocket.Session.post')
  def test_execute_with_check_and_diff(self, mock_unix_post, mock_post):

    mock_post.return_value = MagicMock(status_code=200)
    mock_unix_post.return_value = MagicMock(status_code=200)

    test_args = [
      'python3', 'ssm-ansible-run.py',
      '--playbook', 'test_playbook.yml',
      '--ident', 'test_uuid',
      '--check', '--diff'
    ]

    result = subprocess.run(test_args, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

    self.assertEqual(result.returncode, 0)
    self.assertIn('test_uuid', result.stdout.decode())

  @patch('requests.post')
  @patch('requests_unixsocket.Session.post')
  def test_execute_without_check_and_diff(self, mock_unix_post, mock_post):

    mock_post.return_value = MagicMock(status_code=200)
    mock_unix_post.return_value = MagicMock(status_code=200)

    test_args = [
      'python3', 'ssm-ansible-run.py',
      '--playbook', 'test_playbook.yml',
      '--ident', 'test_uuid'
    ]

    result = subprocess.run(test_args, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

    self.assertEqual(result.returncode, 0)
    self.assertIn('test_uuid', result.stdout.decode())

  @patch('requests.post')
  @patch('requests_unixsocket.Session.post')
  def test_execute_with_extra_vars_and_host_pattern(self, mock_unix_post, mock_post):

    mock_post.return_value = MagicMock(status_code=200)
    mock_unix_post.return_value = MagicMock(status_code=200)

    extra_vars_json = '{"var1": "value1", "var2": "value2"}'
    test_args = [
      'python3', 'ssm-ansible-run.py',
      '--playbook', 'test_playbook.yml',
      '--ident', 'test_uuid',
      '--extra-vars', extra_vars_json,
      '--host-pattern', 'test_host'
    ]

    result = subprocess.run(test_args, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

    self.assertEqual(result.returncode, 0)
    self.assertIn('test_uuid', result.stdout.decode())

  @patch('requests.post')
  @patch('requests_unixsocket.Session.post')
  def test_execute_with_specific_host(self, mock_unix_post, mock_post):

    mock_post.return_value = MagicMock(status_code=200)
    mock_unix_post.return_value = MagicMock(status_code=200)

    specific_host_json = '{"name": "test_host", "address": "127.0.0.1"}'  # Ensure specific host JSON is a proper string
    test_args = [
      'python3', 'ssm-ansible-run.py',
      '--playbook', 'test_playbook.yml',
      '--ident', 'test_uuid',
      '--specific-host', specific_host_json
    ]

    result = subprocess.run(test_args, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

    self.assertEqual(result.returncode, 0)
    self.assertIn('test_uuid', result.stdout.decode())

  @patch('requests.post')
  @patch('requests_unixsocket.Session.post')
  def test_execute_with_invalid_extra_vars(self, mock_unix_post, mock_post):

    mock_post.return_value = MagicMock(status_code=200)
    mock_unix_post.return_value = MagicMock(status_code=200)

    invalid_extra_vars_json = "{invalid_json}"
    test_args = [
      'python3', 'ssm-ansible-run.py',
      '--playbook', 'test_playbook.yml',
      '--ident', 'test_uuid',
      '--extra-vars', invalid_extra_vars_json
    ]

    result = subprocess.run(test_args, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

    self.assertNotEqual(result.returncode, 0)
    self.assertIn('Expecting property name enclosed in double quotes', result.stderr.decode())


  @patch('requests.post')
  @patch('requests_unixsocket.Session.post')
  def test_execute_with_mixed_flags_and_options(self, mock_unix_post, mock_post):

    mock_post.return_value = MagicMock(status_code=200)
    mock_unix_post.return_value = MagicMock(status_code=200)

    extra_vars_json = '{"var1": "value1", "var2": "value2"}'  # Correct JSON format
    specific_host_json = '{"name": "test_host", "address": "127.0.0.1"}'  # Ensure it's a proper string
    test_args = [
      'python3', 'ssm-ansible-run.py',
      '--playbook', 'test_playbook.yml',
      '--ident', 'test_uuid',
      '--extra-vars', extra_vars_json,
      '--specific-host', specific_host_json,
      '--check', '--diff'
    ]

    result = subprocess.run(test_args, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

    self.assertEqual(result.returncode, 0)
    self.assertIn('test_uuid', result.stdout.decode())

  @patch('requests.post')
  @patch('requests_unixsocket.Session.post')
  def test_execute_without_required_arguments(self, mock_unix_post, mock_post):

    mock_post.return_value = MagicMock(status_code=200)
    mock_unix_post.return_value = MagicMock(status_code=200)

    test_args = [
      'python3', 'ssm-ansible-run.py'
    ]

    result = subprocess.run(test_args, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

    self.assertNotEqual(result.returncode, 0)
    self.assertIn('the following arguments are required: --playbook, --ident', result.stderr.decode())


if __name__ == '__main__':
  unittest.main()
