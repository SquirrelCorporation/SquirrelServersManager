import { SFTPDataNode } from '@/components/DeviceComponents/SFTPDrawer/SFTPDrawer';
import { sftpSocket as socket } from '@/socket';
import { ModalForm, ProFormDigit } from '@ant-design/pro-components';
import { Checkbox, message } from 'antd';
import React, { useImperativeHandle, useState } from 'react';
import { SsmEvents } from 'ssm-shared-lib';

type UpdateModeModalProps = {
  node?: SFTPDataNode;
  onSuccess: (path: string, mode: number) => void;
};

export type UpdateModeModalHandles = {
  open: () => void;
};

// Extract permission bits from mode
const extractPermissionBits = (mode: number): number => {
  return mode & 0o777; // Mask to get only the lower-order permission bits
};

const UpdateModeModal = React.forwardRef<
  UpdateModeModalHandles,
  UpdateModeModalProps
>(({ node, onSuccess }, ref) => {
  const [visible, setVisible] = useState(false);
  const [mode, setMode] = useState('000'); // Default octal permission mode
  const [permissions, setPermissions] = useState({
    owner: { read: false, write: false, exec: false },
    group: { read: false, write: false, exec: false },
    others: { read: false, write: false, exec: false },
  });

  // Initialize checkboxes and mode from a given octal mode (permission bits only)
  const initializeFromMode = (initialPermissionBits: number) => {
    const modeString = initialPermissionBits.toString(8).padStart(3, '0'); // Convert to octal string
    setMode(modeString);

    setPermissions({
      owner: {
        read: Boolean(initialPermissionBits & 0o400),
        write: Boolean(initialPermissionBits & 0o200),
        exec: Boolean(initialPermissionBits & 0o100),
      },
      group: {
        read: Boolean(initialPermissionBits & 0o040),
        write: Boolean(initialPermissionBits & 0o020),
        exec: Boolean(initialPermissionBits & 0o010),
      },
      others: {
        read: Boolean(initialPermissionBits & 0o004),
        write: Boolean(initialPermissionBits & 0o002),
        exec: Boolean(initialPermissionBits & 0o001),
      },
    });
  };

  // Open the modal and initialize from node.mode
  const open = () => {
    if (node?.mode !== undefined) {
      const permissionBits = extractPermissionBits(node.mode);
      initializeFromMode(permissionBits); // Use extracted permission bits
    }
    setVisible(true);
  };

  // Close modal
  const onClose = () => {
    setVisible(false);
  };

  useImperativeHandle(ref, () => ({ open }));

  // Calculate the octal permissions as a string based on the checkbox state
  const calculateMode = (perms: typeof permissions): string => {
    const calculateOctalValue = (perm: {
      read: boolean;
      write: boolean;
      exec: boolean;
    }): number => {
      return (perm.read ? 4 : 0) + (perm.write ? 2 : 0) + (perm.exec ? 1 : 0);
    };
    return [
      calculateOctalValue(perms.owner),
      calculateOctalValue(perms.group),
      calculateOctalValue(perms.others),
    ].join('');
  };

  // Update permissions when a checkbox is toggled
  const handlePermissionsChange = (
    category: keyof typeof permissions,
    action: keyof typeof permissions.owner,
  ) => {
    const updatedPermissions = {
      ...permissions,
      [category]: {
        ...permissions[category],
        [action]: !permissions[category][action], // Toggle the permission
      },
    };
    setPermissions(updatedPermissions);
    setMode(calculateMode(updatedPermissions)); // Update the octal mode based on new permissions
  };

  // Update permissions based on the octal mode input
  const handleModeInputChange = (value: string) => {
    if (/^[0-7]{0,3}$/.test(value)) {
      // Allow valid octal values only
      const parsedValue = value.padStart(3, '0'); // Pad to ensure minimum 3 digits
      setMode(parsedValue);
      initializeFromMode(parseInt(parsedValue, 8)); // Update checkboxes from the new octal value
    }
  };

  const updateMode = async (): Promise<boolean> => {
    if (!node) {
      message.error('No node selected');
      return false;
    }

    try {
      const decimalMode = parseInt(mode, 8);
      socket.connect(); // Ensure the socket is connected
      const response = await socket
        .timeout(5000)
        .emitWithAck(SsmEvents.SFTP.CHMOD, {
          path: node?.key?.replace('//', '/'),
          mode: decimalMode,
        }); // Send the chmod request
      if (response.success) {
        message.success('Permissions updated successfully!');
        return true; // Successful chmod
      } else {
        throw new Error(
          `Failed to update permissions: ${response.message || 'Unknown error'}`,
        );
      }
    } catch (error: any) {
      message.error(`Failed to update permissions (${error.message})`);
      return false;
    }
  };

  return (
    <ModalForm
      title={`Update Permissions for ${node?.key?.replace('//', '/') || 'Unknown'}`}
      clearOnDestroy
      open={visible}
      autoFocusFirstInput
      modalProps={{
        destroyOnClose: true,
        onCancel: onClose,
      }}
      onFinish={async () => {
        const success = await updateMode();
        if (success) {
          onSuccess(node?.key || '', parseInt(mode, 8)); // Notify the parent on success
          onClose(); // Close the modal
        }
      }}
    >
      <div style={{ marginBottom: 16 }}>
        <strong>Owner</strong>
        <div style={{ display: 'flex', gap: 10 }}>
          <Checkbox
            checked={permissions.owner.read}
            onChange={() => handlePermissionsChange('owner', 'read')}
          >
            Read
          </Checkbox>
          <Checkbox
            checked={permissions.owner.write}
            onChange={() => handlePermissionsChange('owner', 'write')}
          >
            Write
          </Checkbox>
          <Checkbox
            checked={permissions.owner.exec}
            onChange={() => handlePermissionsChange('owner', 'exec')}
          >
            Execute
          </Checkbox>
        </div>
      </div>
      <div style={{ marginBottom: 16 }}>
        <strong>Group</strong>
        <div style={{ display: 'flex', gap: 10 }}>
          <Checkbox
            checked={permissions.group.read}
            onChange={() => handlePermissionsChange('group', 'read')}
          >
            Read
          </Checkbox>
          <Checkbox
            checked={permissions.group.write}
            onChange={() => handlePermissionsChange('group', 'write')}
          >
            Write
          </Checkbox>
          <Checkbox
            checked={permissions.group.exec}
            onChange={() => handlePermissionsChange('group', 'exec')}
          >
            Execute
          </Checkbox>
        </div>
      </div>
      <div style={{ marginBottom: 16 }}>
        <strong>Others</strong>
        <div style={{ display: 'flex', gap: 10 }}>
          <Checkbox
            checked={permissions.others.read}
            onChange={() => handlePermissionsChange('others', 'read')}
          >
            Read
          </Checkbox>
          <Checkbox
            checked={permissions.others.write}
            onChange={() => handlePermissionsChange('others', 'write')}
          >
            Write
          </Checkbox>
          <Checkbox
            checked={permissions.others.exec}
            onChange={() => handlePermissionsChange('others', 'exec')}
          >
            Execute
          </Checkbox>
        </div>
      </div>
      <ProFormDigit
        name="mode"
        label="Octal Mode"
        placeholder="e.g., 755"
        fieldProps={{
          value: mode,
          onChange: (value) => handleModeInputChange(value?.toString() || '0'),
        }}
      />
    </ModalForm>
  );
});

export default UpdateModeModal;
