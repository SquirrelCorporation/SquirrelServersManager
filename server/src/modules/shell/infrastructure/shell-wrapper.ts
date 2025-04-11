import shell, { ShellString } from 'shelljs';

/**
 * ShellWrapper provides direct access to shelljs functions
 * This is part of the infrastructure layer
 */
export const ShellWrapper = {
  mkdir: shell.mkdir.bind(shell),
  rm: shell.rm.bind(shell),
  cat: shell.cat.bind(shell),
  echo: shell.echo.bind(shell),
  touch: shell.touch.bind(shell),
  test: shell.test.bind(shell),
  chmod: shell.chmod.bind(shell),
  cp: shell.cp.bind(shell),
  ln: shell.ln.bind(shell),
  exec: shell.exec.bind(shell),
  cd: shell.cd.bind(shell),
  to: (content: string, path: string): ShellString => {
    const result = shell.ShellString(content);
    result.to(path);
    return result;
  },
};

export default ShellWrapper;
