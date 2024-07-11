import shell from 'shelljs';

const ShellWrapper = {
  mkdir: shell.mkdir.bind(shell),
  rm: shell.rm.bind(shell),
  cat: shell.cat.bind(shell),
  echo: shell.echo.bind(shell),
  touch: shell.touch.bind(shell),
  test: shell.test.bind(shell),
  chmod: shell.chmod.bind(shell),
  to: (content: string, path: string) => shell.ShellString(content).to(path),
};

export default ShellWrapper;
