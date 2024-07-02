import shell from 'shelljs';

class ShellWrapper {
  public cat = shell.cat;
  public touch = shell.touch;
  public test = shell.test;
  public rm = shell.rm;
}

export default new ShellWrapper();
