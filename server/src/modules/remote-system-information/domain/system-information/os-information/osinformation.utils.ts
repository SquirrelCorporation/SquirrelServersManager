export function getVboxmanage() {
  const _windows = false;
  return _windows
    ? `"${process.env.VBOX_INSTALL_PATH || process.env.VBOX_MSI_INSTALL_PATH}\\VBoxManage.exe"`
    : 'vboxmanage';
}
