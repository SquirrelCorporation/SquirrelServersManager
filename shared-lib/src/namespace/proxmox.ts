
export namespace ProxmoxModel {
  /**
   * CIDR of the (sub) network that is used for migration.
   * @format CIDR
   */
  export type CIDR = string;
  /**
   * Declare a separate cluster network, OSDs will routeheartbeat, object replication and recovery traffic over it
   * @format CIDR
   * @maxLength 128
   */
  export type CIDR_1 = string;
  /**
   * IPv4 CIDR.
   * @format CIDRv4
   */
  export type CIDRv4 = string;
  /**
   * IPv6 CIDR.
   * @format CIDRv6
   */
  export type CIDRv6 = string;
  /**
   * Network/IP specification in CIDR format.
   * @format IPorCIDR
   */
  export type IPorCIDR = string;
  /**
   * Network/IP specification in CIDR format.
   * @format IPorCIDRorAlias
   */
  export type IPorCIDRorAlias = string;
  /**
   * Template string for generating notes for the backup(s). It can contain variables which will be replaced by their values. Currently supported are \{\{cluster\}\}, \{\{guestname\}\}, \{\{node\}\}, and \{\{vmid\}\}, but more might be added in the future. Needs to be a single line, newline and backslash need to be escaped as '\n' and '\\' respectively.
   * @maxLength 1024
   */
  export type String0_1024 = string;
  /**
   * Superuser (root) password of peer node.
   * @maxLength 128
   */
  export type String0_128 = string;
  /**
   * LDAP filter for user sync.
   * @maxLength 2048
   */
  export type String0_2048 = string;
  /**
   * The backup archive. Either the file system path to a .tar or .vma file (use '-' to pipe data from stdin) or a proxmox storage backup volume identifier.
   * @maxLength 255
   */
  export type String0_255 = string;
  /**
   * CIFS domain.
   * @maxLength 256
   */
  export type String0_256 = string;
  /**
   * Prevent changes if current configuration file has different SHA1 digest. This can be used to prevent concurrent modifications.
   * @maxLength 40
   */
  export type String0_40 = string;
  /**
   * Description.
   * @maxLength 4096
   */
  export type String0_4096 = string;
  /**
   * Description for the Job.
   * @maxLength 512
   */
  export type String0_512 = string;
  /**
   * The content to write into the file.
   * @maxLength 61440
   */
  export type String0_61440 = string;
  /**
   * Prevent changes if current configuration file has a different digest. This can be used to prevent concurrent modifications.
   * @maxLength 64
   */
  export type String0_64 = string;
  /**
   * Datacenter description. Shown in the web-interface datacenter notes panel. This is saved as comment inside the configuration file.
   * @maxLength 65536
   */
  export type String0_65536 = string;
  /**
   * Digest to detect modifications.
   * @maxLength 80
   */
  export type String0_80 = string;
  /**
   * Description for the VM. Shown in the web-interface VM's summary. This is saved as comment inside the configuration file.
   * @maxLength 8192
   */
  export type String0_8192 = string;
  /**
   * The new password.
   * @minLength 5
   * @maxLength 1024
   */
  export type String5_1024 = string;
  /**
   * Initial password.
   * @minLength 5
   * @maxLength 64
   */
  export type String5_64 = string;
  /**
   * Node specific ACME settings.
   * @format {"account":{"default":"default","description":"ACME account config file name.","format":"pve-configid","format_description":"name","optional":1,"type":"string"},"domains":{"description":"List of domains for this node's ACME certificate","format":"pve-acme-domain-list","format_description":"domain[;domain;...]","optional":1,"type":"string"}}
   */
  export type Tacme = string;
  /**
   * ACME domain and validation plugin
   * @format {"alias":{"description":"Alias for the Domain to verify ACME Challenge over DNS","format":"pve-acme-alias","format_description":"domain","optional":1,"type":"string"},"domain":{"default_key":1,"description":"domain for this node's ACME certificate","format":"pve-acme-domain","format_description":"domain","type":"string"},"plugin":{"default":"standalone","description":"The ACME plugin ID","format":"pve-configid","format_description":"name of the plugin configuration","optional":1,"type":"string"}}
   */
  export type Tacmedomain = string;
  /**
   * Rule action ('ACCEPT', 'DROP', 'REJECT') or security group name.
   * @pattern [A-Za-z][A-Za-z0-9\-\_]+
   * @minLength 2
   * @maxLength 20
   */
  export type Taction = string;
  /**
   * Action to check
   */
  export type Taction_1 = 'destroy' | 'stop';
  /**
   * Enable/disable communication with the QEMU Guest Agent and its properties.
   * @format {"enabled":{"default":0,"default_key":1,"description":"Enable/disable communication with a QEMU Guest Agent (QGA) running in the VM.","type":"boolean"},"freeze-fs-on-backup":{"default":1,"description":"Freeze/thaw guest filesystems on backup for consistency.","optional":1,"type":"boolean"},"fstrim_cloned_disks":{"default":0,"description":"Run fstrim after moving a disk or migrating the VM.","optional":1,"type":"boolean"},"type":{"default":"virtio","description":"Select the agent type","enum":["virtio","isa"],"optional":1,"type":"string"}}
   */
  export type Tagent = string;
  /**
   * alias name of the vnet
   * @pattern (?^i:[\(\)-_.\w\d\s]{0,256})
   * @maxLength 256
   */
  export type Talias = string;
  /**
   * API plugin name
   */
  export type Tapi = '1984hosting' | 'acmedns' | 'acmeproxy' | 'active24' | 'ad' | 'ali' | 'anx' | 'artfiles' | 'arvan' | 'aurora' | 'autodns' | 'aws' | 'azion' | 'azure' | 'bookmyname' | 'bunny' | 'cf' | 'clouddns' | 'cloudns' | 'cn' | 'conoha' | 'constellix' | 'cpanel' | 'curanet' | 'cyon' | 'da' | 'ddnss' | 'desec' | 'df' | 'dgon' | 'dnsexit' | 'dnshome' | 'dnsimple' | 'dnsservices' | 'do' | 'doapi' | 'domeneshop' | 'dp' | 'dpi' | 'dreamhost' | 'duckdns' | 'durabledns' | 'dyn' | 'dynu' | 'dynv6' | 'easydns' | 'edgedns' | 'euserv' | 'exoscale' | 'fornex' | 'freedns' | 'gandi_livedns' | 'gcloud' | 'gcore' | 'gd' | 'geoscaling' | 'googledomains' | 'he' | 'hetzner' | 'hexonet' | 'hostingde' | 'huaweicloud' | 'infoblox' | 'infomaniak' | 'internetbs' | 'inwx' | 'ionos' | 'ipv64' | 'ispconfig' | 'jd' | 'joker' | 'kappernet' | 'kas' | 'kinghost' | 'knot' | 'la' | 'leaseweb' | 'lexicon' | 'linode' | 'linode_v4' | 'loopia' | 'lua' | 'maradns' | 'me' | 'miab' | 'misaka' | 'myapi' | 'mydevil' | 'mydnsjp' | 'mythic_beasts' | 'namecheap' | 'namecom' | 'namesilo' | 'nanelo' | 'nederhost' | 'neodigit' | 'netcup' | 'netlify' | 'nic' | 'njalla' | 'nm' | 'nsd' | 'nsone' | 'nsupdate' | 'nw' | 'oci' | 'one' | 'online' | 'openprovider' | 'openstack' | 'opnsense' | 'ovh' | 'pdns' | 'pleskxml' | 'pointhq' | 'porkbun' | 'rackcorp' | 'rackspace' | 'rage4' | 'rcode0' | 'regru' | 'scaleway' | 'schlundtech' | 'selectel' | 'selfhost' | 'servercow' | 'simply' | 'tele3' | 'tencent' | 'transip' | 'udr' | 'ultra' | 'unoeuro' | 'variomedia' | 'veesp' | 'vercel' | 'vscale' | 'vultr' | 'websupport' | 'world4you' | 'yandex' | 'yc' | 'zilore' | 'zone' | 'zonomi';
  /**
   * The application of the pool.
   */
  export type Tapplication = 'cephfs' | 'rbd' | 'rgw';
  /**
   * Virtual processor architecture. Defaults to the host.
   */
  export type Tarch = 'aarch64' | 'x86_64';
  /**
   * OS architecture type.
   */
  export type Tarch_1 = 'amd64' | 'arm64' | 'armhf' | 'i386' | 'riscv32' | 'riscv64';
  /**
   * Configure a audio device, useful in combination with QXL/Spice.
   * @format {"device":{"description":"Configure an audio device.","enum":["ich9-intel-hda","intel-hda","AC97"],"type":"string"},"driver":{"default":"spice","description":"Driver backend for the audio device.","enum":["spice","none"],"optional":1,"type":"string"}}
   */
  export type Taudio0 = string;
  /**
   * Select BIOS implementation.
   */
  export type Tbios = 'ovmf' | 'seabios';
  /**
   * Bonding mode.
   */
  export type Tbond_mode = '802.3ad' | 'active-backup' | 'balance-alb' | 'balance-rr' | 'balance-slb' | 'balance-tlb' | 'balance-xor' | 'broadcast' | 'lacp-balance-slb' | 'lacp-balance-tcp';
  /**
   * Selects the transmit hash policy to use for slave selection in balance-xor and 802.3ad modes.
   */
  export type Tbond_xmit_hash_policy = 'layer2' | 'layer2+3' | 'layer3+4';
  /**
   * Set I/O bandwidth limit for various operations (in KiB/s).
   * @format {"clone":{"description":"bandwidth limit in KiB/s for cloning disks","format_description":"LIMIT","minimum":"0","optional":1,"type":"number"},"default":{"description":"default bandwidth limit in KiB/s","format_description":"LIMIT","minimum":"0","optional":1,"type":"number"},"migration":{"description":"bandwidth limit in KiB/s for migrating guests (including moving local disks)","format_description":"LIMIT","minimum":"0","optional":1,"type":"number"},"move":{"description":"bandwidth limit in KiB/s for moving disks","format_description":"LIMIT","minimum":"0","optional":1,"type":"number"},"restore":{"description":"bandwidth limit in KiB/s for restoring guests from backups","format_description":"LIMIT","minimum":"0","optional":1,"type":"number"}}
   */
  export type Tbwlimit = string;
  /**
   * Override I/O bandwidth limit (in KiB/s).
   * @minimum 0
   * @type number
   */
  export type Tbwlimit_1 = number;
  /**
   * The RRD consolidation function
   */
  export type Tcf = 'AVERAGE' | 'MAX';
  /**
   * The algorithm to calculate the checksum of the file.
   */
  export type Tchecksumalgorithm = 'md5' | 'sha1' | 'sha224' | 'sha256' | 'sha384' | 'sha512';
  /**
   * Specifies the cloud-init configuration format. The default depends on the configured operating system type (`ostype`. We use the `nocloud` format for Linux, and `configdrive2` for windows.
   */
  export type Tcitype = 'configdrive2' | 'nocloud' | 'opennebula';
  /**
   * Run specific command or default to login (requires 'root@pam')
   */
  export type Tcmd = 'ceph_install' | 'login' | 'upgrade';
  /**
   * Console mode. By default, the console command tries to open a connection to one of the available tty devices. By setting cmode to 'console' it tries to attach to /dev/console instead. If you set cmode to 'shell', it simply invokes a shell inside the container (no login).
   */
  export type Tcmode = 'console' | 'shell' | 'tty';
  /**
   * The QGA command.
   */
  export type Tcommand = 'fsfreeze-freeze' | 'fsfreeze-status' | 'fsfreeze-thaw' | 'fstrim' | 'get-fsinfo' | 'get-host-name' | 'get-memory-block-info' | 'get-memory-blocks' | 'get-osinfo' | 'get-time' | 'get-timezone' | 'get-users' | 'get-vcpus' | 'info' | 'network-get-interfaces' | 'ping' | 'shutdown' | 'suspend-disk' | 'suspend-hybrid' | 'suspend-ram';
  /**
   * The command as a list of program + arguments.
   * @type array
   */
  export type Tcommand_1 = any[];
  /**
   * Specify the command.
   */
  export type Tcommand_2 = 'reboot' | 'shutdown';
  /**
   * Compress dump file.
   */
  export type Tcompress = '0' | '1' | 'gzip' | 'lzo' | 'zstd';
  /**
   * The compression algorithm to use.
   */
  export type Tcompression = 'gzip' | 'lz4' | 'lzjb' | 'off' | 'on' | 'zle' | 'zstd';
  /**
   * List of <section>:<config key> items.
   * @pattern (?^:^(:?(?^i:[0-9a-z\-_\.]+:[0-9a-zA-Z\-_]+))(:?[;, ](?^i:[0-9a-z\-_\.]+:[0-9a-zA-Z\-_]+))*$)
   */
  export type Tconfigkeys = string;
  /**
   * Select the default Console viewer. You can either use the builtin java applet (VNC; deprecated and maps to html5), an external virt-viewer comtatible application (SPICE), an HTML5 based vnc viewer (noVNC), or an HTML5 based console client (xtermjs). If the selected viewer is not available (e.g. SPICE not activated for the VM), the fallback is noVNC.
   */
  export type Tconsole = 'applet' | 'html5' | 'vv' | 'xtermjs';
  /**
   * Limit of CPU usage.
   * NOTE: If the computer has 2 CPUs, it has total of '2' CPU time. Value '0' indicates no CPU limit.
   * @minimum 0
   * @maximum 128
   * @type number
   */
  export type Tcpulimit = number;
  /**
   * Limit of CPU usage.
   * NOTE: If the computer has 2 CPUs, it has a total of '2' CPU time. Value '0' indicates no CPU limit.
   * @minimum 0
   * @maximum 8192
   * @type number
   */
  export type Tcpulimit_1 = number;
  /**
   * Cluster resource scheduling settings.
   * @format {"ha":{"default":"basic","description":"Use this resource scheduler mode for HA.","enum":["basic","static"],"optional":1,"type":"string","verbose_description":"Configures how the HA manager should select nodes to start or recover services. With 'basic', only the number of services is used, with 'static', static CPU and memory configuration of services is considered."},"ha-rebalance-on-start":{"default":0,"description":"Set to use CRS for selecting a suited node when a HA services request-state changes from stop to start.","optional":1,"type":"boolean"}}
   */
  export type Tcrs = string;
  /**
   * The rule to use for mapping object placement in the cluster.
   */
  export type Tcrush_rule = string;
  /**
   * A list of settings you want to delete.
   * @type array
   */
  export type Tdelete = any[];
  /**
   * Device to pass through to the container
   * @format {"gid":{"description":"Group ID to be assigned to the device node","minimum":0,"optional":1,"type":"integer"},"mode":{"description":"Access mode to be set on the device node","format_description":"Octal access mode","optional":1,"pattern":"0[0-7]{3}","type":"string"},"path":{"default_key":1,"description":"Device to pass through to the container","format":"pve-lxc-dev-string","format_description":"Path","optional":1,"type":"string","verbose_description":"Path to the device to pass through to the container"},"uid":{"description":"User ID to be assigned to the device node","minimum":0,"optional":1,"type":"integer"}}
   */
  export type Tdev = string;
  /**
   * Type of the DHCP backend for this zone
   */
  export type Tdhcp = 'dnsmasq';
  /**
   * A list of DHCP ranges for this subnet
   * @type array
   */
  export type Tdhcprange = any[];
  /**
   * URL of ACME CA directory endpoint.
   * @pattern ^https?://.*
   */
  export type Tdirectory = string;
  /**
   * The disk you want to move.
   */
  export type Tdisk = 'efidisk0' | 'ide0' | 'ide1' | 'ide2' | 'ide3' | 'sata0' | 'sata1' | 'sata2' | 'sata3' | 'sata4' | 'sata5' | 'scsi0' | 'scsi1' | 'scsi10' | 'scsi11' | 'scsi12' | 'scsi13' | 'scsi14' | 'scsi15' | 'scsi16' | 'scsi17' | 'scsi18' | 'scsi19' | 'scsi2' | 'scsi20' | 'scsi21' | 'scsi22' | 'scsi23' | 'scsi24' | 'scsi25' | 'scsi26' | 'scsi27' | 'scsi28' | 'scsi29' | 'scsi3' | 'scsi30' | 'scsi4' | 'scsi5' | 'scsi6' | 'scsi7' | 'scsi8' | 'scsi9' | 'tpmstate0' | 'unused0' | 'unused1' | 'unused10' | 'unused100' | 'unused101' | 'unused102' | 'unused103' | 'unused104' | 'unused105' | 'unused106' | 'unused107' | 'unused108' | 'unused109' | 'unused11' | 'unused110' | 'unused111' | 'unused112' | 'unused113' | 'unused114' | 'unused115' | 'unused116' | 'unused117' | 'unused118' | 'unused119' | 'unused12' | 'unused120' | 'unused121' | 'unused122' | 'unused123' | 'unused124' | 'unused125' | 'unused126' | 'unused127' | 'unused128' | 'unused129' | 'unused13' | 'unused130' | 'unused131' | 'unused132' | 'unused133' | 'unused134' | 'unused135' | 'unused136' | 'unused137' | 'unused138' | 'unused139' | 'unused14' | 'unused140' | 'unused141' | 'unused142' | 'unused143' | 'unused144' | 'unused145' | 'unused146' | 'unused147' | 'unused148' | 'unused149' | 'unused15' | 'unused150' | 'unused151' | 'unused152' | 'unused153' | 'unused154' | 'unused155' | 'unused156' | 'unused157' | 'unused158' | 'unused159' | 'unused16' | 'unused160' | 'unused161' | 'unused162' | 'unused163' | 'unused164' | 'unused165' | 'unused166' | 'unused167' | 'unused168' | 'unused169' | 'unused17' | 'unused170' | 'unused171' | 'unused172' | 'unused173' | 'unused174' | 'unused175' | 'unused176' | 'unused177' | 'unused178' | 'unused179' | 'unused18' | 'unused180' | 'unused181' | 'unused182' | 'unused183' | 'unused184' | 'unused185' | 'unused186' | 'unused187' | 'unused188' | 'unused189' | 'unused19' | 'unused190' | 'unused191' | 'unused192' | 'unused193' | 'unused194' | 'unused195' | 'unused196' | 'unused197' | 'unused198' | 'unused199' | 'unused2' | 'unused20' | 'unused200' | 'unused201' | 'unused202' | 'unused203' | 'unused204' | 'unused205' | 'unused206' | 'unused207' | 'unused208' | 'unused209' | 'unused21' | 'unused210' | 'unused211' | 'unused212' | 'unused213' | 'unused214' | 'unused215' | 'unused216' | 'unused217' | 'unused218' | 'unused219' | 'unused22' | 'unused220' | 'unused221' | 'unused222' | 'unused223' | 'unused224' | 'unused225' | 'unused226' | 'unused227' | 'unused228' | 'unused229' | 'unused23' | 'unused230' | 'unused231' | 'unused232' | 'unused233' | 'unused234' | 'unused235' | 'unused236' | 'unused237' | 'unused238' | 'unused239' | 'unused24' | 'unused240' | 'unused241' | 'unused242' | 'unused243' | 'unused244' | 'unused245' | 'unused246' | 'unused247' | 'unused248' | 'unused249' | 'unused25' | 'unused250' | 'unused251' | 'unused252' | 'unused253' | 'unused254' | 'unused255' | 'unused26' | 'unused27' | 'unused28' | 'unused29' | 'unused3' | 'unused30' | 'unused31' | 'unused32' | 'unused33' | 'unused34' | 'unused35' | 'unused36' | 'unused37' | 'unused38' | 'unused39' | 'unused4' | 'unused40' | 'unused41' | 'unused42' | 'unused43' | 'unused44' | 'unused45' | 'unused46' | 'unused47' | 'unused48' | 'unused49' | 'unused5' | 'unused50' | 'unused51' | 'unused52' | 'unused53' | 'unused54' | 'unused55' | 'unused56' | 'unused57' | 'unused58' | 'unused59' | 'unused6' | 'unused60' | 'unused61' | 'unused62' | 'unused63' | 'unused64' | 'unused65' | 'unused66' | 'unused67' | 'unused68' | 'unused69' | 'unused7' | 'unused70' | 'unused71' | 'unused72' | 'unused73' | 'unused74' | 'unused75' | 'unused76' | 'unused77' | 'unused78' | 'unused79' | 'unused8' | 'unused80' | 'unused81' | 'unused82' | 'unused83' | 'unused84' | 'unused85' | 'unused86' | 'unused87' | 'unused88' | 'unused89' | 'unused9' | 'unused90' | 'unused91' | 'unused92' | 'unused93' | 'unused94' | 'unused95' | 'unused96' | 'unused97' | 'unused98' | 'unused99' | 'virtio0' | 'virtio1' | 'virtio10' | 'virtio11' | 'virtio12' | 'virtio13' | 'virtio14' | 'virtio15' | 'virtio2' | 'virtio3' | 'virtio4' | 'virtio5' | 'virtio6' | 'virtio7' | 'virtio8' | 'virtio9';
  /**
   * The disk you want to resize.
   */
  export type Tdisk_1 = 'efidisk0' | 'ide0' | 'ide1' | 'ide2' | 'ide3' | 'sata0' | 'sata1' | 'sata2' | 'sata3' | 'sata4' | 'sata5' | 'scsi0' | 'scsi1' | 'scsi10' | 'scsi11' | 'scsi12' | 'scsi13' | 'scsi14' | 'scsi15' | 'scsi16' | 'scsi17' | 'scsi18' | 'scsi19' | 'scsi2' | 'scsi20' | 'scsi21' | 'scsi22' | 'scsi23' | 'scsi24' | 'scsi25' | 'scsi26' | 'scsi27' | 'scsi28' | 'scsi29' | 'scsi3' | 'scsi30' | 'scsi4' | 'scsi5' | 'scsi6' | 'scsi7' | 'scsi8' | 'scsi9' | 'tpmstate0' | 'virtio0' | 'virtio1' | 'virtio10' | 'virtio11' | 'virtio12' | 'virtio13' | 'virtio14' | 'virtio15' | 'virtio2' | 'virtio3' | 'virtio4' | 'virtio5' | 'virtio6' | 'virtio7' | 'virtio8' | 'virtio9';
  /**
   * The disk you want to resize.
   */
  export type Tdisk_2 = 'mp0' | 'mp1' | 'mp10' | 'mp100' | 'mp101' | 'mp102' | 'mp103' | 'mp104' | 'mp105' | 'mp106' | 'mp107' | 'mp108' | 'mp109' | 'mp11' | 'mp110' | 'mp111' | 'mp112' | 'mp113' | 'mp114' | 'mp115' | 'mp116' | 'mp117' | 'mp118' | 'mp119' | 'mp12' | 'mp120' | 'mp121' | 'mp122' | 'mp123' | 'mp124' | 'mp125' | 'mp126' | 'mp127' | 'mp128' | 'mp129' | 'mp13' | 'mp130' | 'mp131' | 'mp132' | 'mp133' | 'mp134' | 'mp135' | 'mp136' | 'mp137' | 'mp138' | 'mp139' | 'mp14' | 'mp140' | 'mp141' | 'mp142' | 'mp143' | 'mp144' | 'mp145' | 'mp146' | 'mp147' | 'mp148' | 'mp149' | 'mp15' | 'mp150' | 'mp151' | 'mp152' | 'mp153' | 'mp154' | 'mp155' | 'mp156' | 'mp157' | 'mp158' | 'mp159' | 'mp16' | 'mp160' | 'mp161' | 'mp162' | 'mp163' | 'mp164' | 'mp165' | 'mp166' | 'mp167' | 'mp168' | 'mp169' | 'mp17' | 'mp170' | 'mp171' | 'mp172' | 'mp173' | 'mp174' | 'mp175' | 'mp176' | 'mp177' | 'mp178' | 'mp179' | 'mp18' | 'mp180' | 'mp181' | 'mp182' | 'mp183' | 'mp184' | 'mp185' | 'mp186' | 'mp187' | 'mp188' | 'mp189' | 'mp19' | 'mp190' | 'mp191' | 'mp192' | 'mp193' | 'mp194' | 'mp195' | 'mp196' | 'mp197' | 'mp198' | 'mp199' | 'mp2' | 'mp20' | 'mp200' | 'mp201' | 'mp202' | 'mp203' | 'mp204' | 'mp205' | 'mp206' | 'mp207' | 'mp208' | 'mp209' | 'mp21' | 'mp210' | 'mp211' | 'mp212' | 'mp213' | 'mp214' | 'mp215' | 'mp216' | 'mp217' | 'mp218' | 'mp219' | 'mp22' | 'mp220' | 'mp221' | 'mp222' | 'mp223' | 'mp224' | 'mp225' | 'mp226' | 'mp227' | 'mp228' | 'mp229' | 'mp23' | 'mp230' | 'mp231' | 'mp232' | 'mp233' | 'mp234' | 'mp235' | 'mp236' | 'mp237' | 'mp238' | 'mp239' | 'mp24' | 'mp240' | 'mp241' | 'mp242' | 'mp243' | 'mp244' | 'mp245' | 'mp246' | 'mp247' | 'mp248' | 'mp249' | 'mp25' | 'mp250' | 'mp251' | 'mp252' | 'mp253' | 'mp254' | 'mp255' | 'mp26' | 'mp27' | 'mp28' | 'mp29' | 'mp3' | 'mp30' | 'mp31' | 'mp32' | 'mp33' | 'mp34' | 'mp35' | 'mp36' | 'mp37' | 'mp38' | 'mp39' | 'mp4' | 'mp40' | 'mp41' | 'mp42' | 'mp43' | 'mp44' | 'mp45' | 'mp46' | 'mp47' | 'mp48' | 'mp49' | 'mp5' | 'mp50' | 'mp51' | 'mp52' | 'mp53' | 'mp54' | 'mp55' | 'mp56' | 'mp57' | 'mp58' | 'mp59' | 'mp6' | 'mp60' | 'mp61' | 'mp62' | 'mp63' | 'mp64' | 'mp65' | 'mp66' | 'mp67' | 'mp68' | 'mp69' | 'mp7' | 'mp70' | 'mp71' | 'mp72' | 'mp73' | 'mp74' | 'mp75' | 'mp76' | 'mp77' | 'mp78' | 'mp79' | 'mp8' | 'mp80' | 'mp81' | 'mp82' | 'mp83' | 'mp84' | 'mp85' | 'mp86' | 'mp87' | 'mp88' | 'mp89' | 'mp9' | 'mp90' | 'mp91' | 'mp92' | 'mp93' | 'mp94' | 'mp95' | 'mp96' | 'mp97' | 'mp98' | 'mp99' | 'rootfs';
  /**
   * Block device name
   * @pattern ^/dev/[a-zA-Z0-9\/]+$
   */
  export type Tdisk_3 = string;
  /**
   * AD domain name
   * @pattern \S+
   * @maxLength 256
   */
  export type Tdomain = string;
  /**
   * @format {"data":{"description":"The number of data devices per redundancy group. (dRAID)","minimum":1,"type":"integer"},"spares":{"description":"Number of dRAID spares.","minimum":0,"type":"integer"}}
   */
  export type Tdraidconfig = string;
  /**
   * Configure a disk for storing EFI vars. Use the special syntax STORAGE_ID:SIZE_IN_GiB to allocate a new volume. Note that SIZE_IN_GiB is ignored here and that the default EFI vars are copied to the volume instead. Use STORAGE_ID:0 and the 'import-from' parameter to import from an existing volume.
   * @format {"efitype":{"default":"2m","description":"Size and type of the OVMF EFI vars. '4m' is newer and recommended, and required for Secure Boot. For backwards compatibility, '2m' is used if not otherwise specified. Ignored for VMs with arch=aarch64 (ARM).","enum":["2m","4m"],"optional":1,"type":"string"},"file":{"default_key":1,"description":"The drive's backing volume.","format":"pve-volume-id-or-qm-path","format_description":"volume","type":"string"},"format":{"description":"The drive's backing file's data format.","enum":["raw","cow","qcow","qed","qcow2","vmdk","cloop"],"optional":1,"type":"string"},"import-from":{"description":"Create a new disk, importing from this source (volume ID or absolute path). When an absolute path is specified, it's up to you to ensure that the source is not actively used by another process during the import!","format":"pve-volume-id-or-absolute-path","format_description":"source volume","optional":1,"type":"string"},"pre-enrolled-keys":{"default":0,"description":"Use am EFI vars template with distribution-specific and Microsoft Standard keys enrolled, if used with 'efitype=4m'. Note that this will enable Secure Boot by default, though it can still be turned off from within the VM.","optional":1,"type":"boolean"},"size":{"description":"Disk size. This is purely informational and has no effect.","format":"disk-size","format_description":"DiskSize","optional":1,"type":"string"},"volume":{"alias":"file"}}
   */
  export type Tefidisk0 = string;
  /**
   * Create an erasure coded pool for RBD with an accompaning replicated pool for metadata storage. With EC, the common ceph options 'size', 'min_size' and 'crush_rule' parameters will be applied to the metadata pool.
   * @format {"device-class":{"description":"CRUSH device class. Will create an erasure coded pool plus a replicated pool for metadata.","format_description":"class","optional":1,"type":"string"},"failure-domain":{"default":"host","description":"CRUSH failure domain. Default is 'host'. Will create an erasure coded pool plus a replicated pool for metadata.","format_description":"domain","optional":1,"type":"string"},"k":{"description":"Number of data chunks. Will create an erasure coded pool plus a replicated pool for metadata.","minimum":2,"type":"integer"},"m":{"description":"Number of coding chunks. Will create an erasure coded pool plus a replicated pool for metadata.","minimum":1,"type":"integer"},"profile":{"description":"Override the erasure code (EC) profile to use. Will create an erasure coded pool plus a replicated pool for metadata.","format_description":"profile","optional":1,"type":"string"}}
   */
  export type Terasurecoding = string;
  /**
   * Feature to check.
   */
  export type Tfeature = 'clone' | 'copy' | 'snapshot';
  /**
   * Allow containers access to advanced features.
   * @format {"force_rw_sys":{"default":0,"description":"Mount /sys in unprivileged containers as `rw` instead of `mixed`. This can break networking under newer (>= v245) systemd-network use.","optional":1,"type":"boolean"},"fuse":{"default":0,"description":"Allow using 'fuse' file systems in a container. Note that interactions between fuse and the freezer cgroup can potentially cause I/O deadlocks.","optional":1,"type":"boolean"},"keyctl":{"default":0,"description":"For unprivileged containers only: Allow the use of the keyctl() system call. This is required to use docker inside a container. By default unprivileged containers will see this system call as non-existent. This is mostly a workaround for systemd-networkd, as it will treat it as a fatal error when some keyctl() operations are denied by the kernel due to lacking permissions. Essentially, you can choose between running systemd-networkd or docker.","optional":1,"type":"boolean"},"mknod":{"default":0,"description":"Allow unprivileged containers to use mknod() to add certain device nodes. This requires a kernel with seccomp trap to user space support (5.3 or newer). This is experimental.","optional":1,"type":"boolean"},"mount":{"description":"Allow mounting file systems of specific types. This should be a list of file system types as used with the mount command. Note that this can have negative effects on the container's security. With access to a loop device, mounting a file can circumvent the mknod permission of the devices cgroup, mounting an NFS file system can block the host's I/O completely and prevent it from rebooting, etc.","format_description":"fstype;fstype;...","optional":1,"pattern":"(?^:[a-zA-Z0-9_; ]+)","type":"string"},"nesting":{"default":0,"description":"Allow nesting. Best used with unprivileged containers with additional id mapping. Note that this will expose procfs and sysfs contents of the host to the guest.","optional":1,"type":"boolean"}}
   */
  export type Tfeatures = string;
  /**
   * Set the fencing mode of the HA cluster. Hardware mode needs a valid configuration of fence devices in /etc/pve/ha/fence.cfg. With both all two modes are used.
   * WARNING: 'hardware' and 'both' are EXPERIMENTAL & WIP
   */
  export type Tfencing = 'both' | 'hardware' | 'watchdog';
  /**
   * The desired filesystem.
   */
  export type Tfilesystem = 'ext4' | 'xfs';
  /**
   * Certificate SHA 256 fingerprint.
   * @pattern ([A-Fa-f0-9]{2}:){31}[A-Fa-f0-9]{2}
   */
  export type Tfingerprint = string;
  /**
   * Target format for file storage. Only valid for full clone.
   */
  export type Tformat = 'qcow2' | 'raw' | 'vmdk';
  export type Tformat_1 = 'qcow2' | 'raw' | 'subvol';
  /**
   * Security Group name.
   * @pattern [A-Za-z][A-Za-z0-9\-\_]+
   * @minLength 2
   * @maxLength 18
   */
  export type Tgroup = string;
  /**
   * Cluster wide HA settings.
   * @format {"shutdown_policy":{"default":"conditional","description":"The policy for HA services on node shutdown. 'freeze' disables auto-recovery, 'failover' ensures recovery, 'conditional' recovers on poweroff and freezes on reboot. 'migrate' will migrate running services to other nodes, if possible. With 'freeze' or 'failover', HA Services will always get stopped first on shutdown.","enum":["freeze","failover","conditional","migrate"],"type":"string","verbose_description":"Describes the policy for handling HA services on poweroff or reboot of a node. Freeze will always freeze services which are still located on the node on shutdown, those services won't be recovered by the HA manager. Failover will not mark the services as frozen and thus the services will get recovered to other nodes, if the shutdown node does not come up again quickly (< 1min). 'conditional' chooses automatically depending on the type of shutdown, i.e., on a reboot the service will be frozen but on a poweroff the service will stay as is, and thus get recovered after about 2 minutes. Migrate will try to move all running services to another node when a reboot or shutdown was triggered. The poweroff process will only continue once no running services are located on the node anymore. If the node comes up again, the service will be moved back to the previously powered-off node, at least if no other migration, reloaction or recovery took place."}}
   */
  export type Tha = string;
  /**
   * Specify external http proxy which is used for downloads (example: 'http://username:password@host:port/')
   * @pattern http://.*
   */
  export type Thttp_proxy = string;
  /**
   * Enable/disable hugepages memory.
   */
  export type Thugepages = '1024' | '2' | 'any';
  /**
   * Use volume as IDE hard disk or CD-ROM (n is 0 to 3). Use the special syntax STORAGE_ID:SIZE_IN_GiB to allocate a new volume. Use STORAGE_ID:0 and the 'import-from' parameter to import from an existing volume.
   * @format {"aio":{"description":"AIO type to use.","enum":["native","threads","io_uring"],"optional":1,"type":"string"},"backup":{"description":"Whether the drive should be included when making backups.","optional":1,"type":"boolean"},"bps":{"description":"Maximum r/w speed in bytes per second.","format_description":"bps","optional":1,"type":"integer"},"bps_max_length":{"description":"Maximum length of I/O bursts in seconds.","format_description":"seconds","minimum":1,"optional":1,"type":"integer"},"bps_rd":{"description":"Maximum read speed in bytes per second.","format_description":"bps","optional":1,"type":"integer"},"bps_rd_length":{"alias":"bps_rd_max_length"},"bps_rd_max_length":{"description":"Maximum length of read I/O bursts in seconds.","format_description":"seconds","minimum":1,"optional":1,"type":"integer"},"bps_wr":{"description":"Maximum write speed in bytes per second.","format_description":"bps","optional":1,"type":"integer"},"bps_wr_length":{"alias":"bps_wr_max_length"},"bps_wr_max_length":{"description":"Maximum length of write I/O bursts in seconds.","format_description":"seconds","minimum":1,"optional":1,"type":"integer"},"cache":{"description":"The drive's cache mode","enum":["none","writethrough","writeback","unsafe","directsync"],"optional":1,"type":"string"},"cyls":{"description":"Force the drive's physical geometry to have a specific cylinder count.","optional":1,"type":"integer"},"detect_zeroes":{"description":"Controls whether to detect and try to optimize writes of zeroes.","optional":1,"type":"boolean"},"discard":{"description":"Controls whether to pass discard/trim requests to the underlying storage.","enum":["ignore","on"],"optional":1,"type":"string"},"file":{"default_key":1,"description":"The drive's backing volume.","format":"pve-volume-id-or-qm-path","format_description":"volume","type":"string"},"format":{"description":"The drive's backing file's data format.","enum":["raw","cow","qcow","qed","qcow2","vmdk","cloop"],"optional":1,"type":"string"},"heads":{"description":"Force the drive's physical geometry to have a specific head count.","optional":1,"type":"integer"},"import-from":{"description":"Create a new disk, importing from this source (volume ID or absolute path). When an absolute path is specified, it's up to you to ensure that the source is not actively used by another process during the import!","format":"pve-volume-id-or-absolute-path","format_description":"source volume","optional":1,"type":"string"},"iops":{"description":"Maximum r/w I/O in operations per second.","format_description":"iops","optional":1,"type":"integer"},"iops_max":{"description":"Maximum unthrottled r/w I/O pool in operations per second.","format_description":"iops","optional":1,"type":"integer"},"iops_max_length":{"description":"Maximum length of I/O bursts in seconds.","format_description":"seconds","minimum":1,"optional":1,"type":"integer"},"iops_rd":{"description":"Maximum read I/O in operations per second.","format_description":"iops","optional":1,"type":"integer"},"iops_rd_length":{"alias":"iops_rd_max_length"},"iops_rd_max":{"description":"Maximum unthrottled read I/O pool in operations per second.","format_description":"iops","optional":1,"type":"integer"},"iops_rd_max_length":{"description":"Maximum length of read I/O bursts in seconds.","format_description":"seconds","minimum":1,"optional":1,"type":"integer"},"iops_wr":{"description":"Maximum write I/O in operations per second.","format_description":"iops","optional":1,"type":"integer"},"iops_wr_length":{"alias":"iops_wr_max_length"},"iops_wr_max":{"description":"Maximum unthrottled write I/O pool in operations per second.","format_description":"iops","optional":1,"type":"integer"},"iops_wr_max_length":{"description":"Maximum length of write I/O bursts in seconds.","format_description":"seconds","minimum":1,"optional":1,"type":"integer"},"mbps":{"description":"Maximum r/w speed in megabytes per second.","format_description":"mbps","optional":1,"type":"number"},"mbps_max":{"description":"Maximum unthrottled r/w pool in megabytes per second.","format_description":"mbps","optional":1,"type":"number"},"mbps_rd":{"description":"Maximum read speed in megabytes per second.","format_description":"mbps","optional":1,"type":"number"},"mbps_rd_max":{"description":"Maximum unthrottled read pool in megabytes per second.","format_description":"mbps","optional":1,"type":"number"},"mbps_wr":{"description":"Maximum write speed in megabytes per second.","format_description":"mbps","optional":1,"type":"number"},"mbps_wr_max":{"description":"Maximum unthrottled write pool in megabytes per second.","format_description":"mbps","optional":1,"type":"number"},"media":{"default":"disk","description":"The drive's media type.","enum":["cdrom","disk"],"optional":1,"type":"string"},"model":{"description":"The drive's reported model name, url-encoded, up to 40 bytes long.","format":"urlencoded","format_description":"model","maxLength":120,"optional":1,"type":"string"},"replicate":{"default":1,"description":"Whether the drive should considered for replication jobs.","optional":1,"type":"boolean"},"rerror":{"description":"Read error action.","enum":["ignore","report","stop"],"optional":1,"type":"string"},"secs":{"description":"Force the drive's physical geometry to have a specific sector count.","optional":1,"type":"integer"},"serial":{"description":"The drive's reported serial number, url-encoded, up to 20 bytes long.","format":"urlencoded","format_description":"serial","maxLength":60,"optional":1,"type":"string"},"shared":{"default":0,"description":"Mark this locally-managed volume as available on all nodes","optional":1,"type":"boolean","verbose_description":"Mark this locally-managed volume as available on all nodes.\n\nWARNING: This option does not share the volume automatically, it assumes it is shared already!"},"size":{"description":"Disk size. This is purely informational and has no effect.","format":"disk-size","format_description":"DiskSize","optional":1,"type":"string"},"snapshot":{"description":"Controls qemu's snapshot mode feature. If activated, changes made to the disk are temporary and will be discarded when the VM is shutdown.","optional":1,"type":"boolean"},"ssd":{"description":"Whether to expose this drive as an SSD, rather than a rotational hard disk.","optional":1,"type":"boolean"},"trans":{"description":"Force disk geometry bios translation mode.","enum":["none","lba","auto"],"optional":1,"type":"string"},"volume":{"alias":"file"},"werror":{"description":"Write error action.","enum":["enospc","ignore","report","stop"],"optional":1,"type":"string"},"wwn":{"description":"The drive's worldwide name, encoded as 16 bytes hex string, prefixed by '0x'.","format_description":"wwn","optional":1,"pattern":"(?^:^(0x)[0-9a-fA-F]{16})","type":"string"}}
   */
  export type Tide = string;
  export type Tinfluxdbproto = 'http' | 'https' | 'udp';
  /**
   * Inter-VM shared memory. Useful for direct communication between VMs, or to the host.
   * @format {"name":{"description":"The name of the file. Will be prefixed with 'pve-shm-'. Default is the VMID. Will be deleted when the VM is stopped.","format_description":"string","optional":1,"pattern":"[a-zA-Z0-9\\-]+","type":"string"},"size":{"description":"The size of the file in MB.","minimum":1,"type":"integer"}}
   */
  export type Tivshmem = string;
  /**
   * Proxmox VE subscription key
   * @pattern \s*pve([1248])([cbsp])-[0-9a-f]{10}\s*
   * @maxLength 32
   */
  export type Tkey = string;
  /**
   * Default keybord layout for vnc server.
   */
  export type Tkeyboard = 'da' | 'de' | 'de-ch' | 'en-gb' | 'en-us' | 'es' | 'fi' | 'fr' | 'fr-be' | 'fr-ca' | 'fr-ch' | 'hu' | 'is' | 'it' | 'ja' | 'lt' | 'mk' | 'nl' | 'no' | 'pl' | 'pt' | 'pt-br' | 'sl' | 'sv' | 'tr';
  /**
   * Default GUI language.
   */
  export type Tlanguage = 'ar' | 'ca' | 'da' | 'de' | 'en' | 'es' | 'eu' | 'fa' | 'fr' | 'he' | 'hr' | 'it' | 'ja' | 'ka' | 'kr' | 'nb' | 'nl' | 'nn' | 'pl' | 'pt_BR' | 'ru' | 'sl' | 'sv' | 'tr' | 'ukr' | 'zh_CN' | 'zh_TW';
  /**
   * Address and priority information of a single corosync link. (up to 8 links supported; link0..link7)
   * @format {"address":{"default_key":1,"description":"Hostname (or IP) of this corosync link address.","format":"address","format_description":"IP","type":"string"},"priority":{"default":0,"description":"The priority for the link when knet is used in 'passive' mode (default). Lower value means higher priority. Only valid for cluster create, ignored on node add.","maximum":255,"minimum":0,"optional":1,"type":"integer"}}
   */
  export type Tlink = string;
  /**
   * Lock/unlock the VM.
   */
  export type Tlock = 'backup' | 'clone' | 'create' | 'migrate' | 'rollback' | 'snapshot' | 'snapshot-delete' | 'suspended' | 'suspending';
  /**
   * Lock/unlock the container.
   */
  export type Tlock_1 = 'backup' | 'create' | 'destroyed' | 'disk' | 'fstrim' | 'migrate' | 'mounted' | 'rollback' | 'snapshot' | 'snapshot-delete';
  /**
   * Log level for firewall rule.
   */
  export type Tlog = 'alert' | 'crit' | 'debug' | 'emerg' | 'err' | 'info' | 'nolog' | 'notice' | 'warning';
  /**
   * Log ratelimiting settings
   * @format {"burst":{"default":5,"description":"Initial burst of packages which will always get logged before the rate is applied","minimum":0,"optional":1,"type":"integer"},"enable":{"default":"1","default_key":1,"description":"Enable or disable log rate limiting","type":"boolean"},"rate":{"default":"1/second","description":"Frequency with which the burst bucket gets refilled","format_description":"rate","optional":1,"pattern":"[1-9][0-9]*\\/(second|minute|hour|day)","type":"string"}}
   */
  export type Tlog_ratelimit = string;
  /**
   * Specifies the QEMU machine type.
   * @pattern (pc|pc(-i440fx)?-\d+(\.\d+)+(\+pve\d+)?(\.pxe)?|q35|pc-q35-\d+(\.\d+)+(\+pve\d+)?(\.pxe)?|virt(?:-\d+(\.\d+)+)?(\+pve\d+)?)
   * @maxLength 40
   */
  export type Tmachine = string;
  /**
   * Deprecated: use 'notification-policy' instead.
   */
  export type Tmailnotification = 'always' | 'failure';
  /**
   * List of email recipients
   * @type array
   */
  export type Tmailto = any[];
  /**
   * List of users
   * @type array
   */
  export type Tmailtouser = any[];
  /**
   * A list of maps for the cluster nodes.
   * @type array
   */
  export type Tmap = any[];
  /**
   * A list of maps for the cluster nodes.
   * @type array
   */
  export type Tmap_1 = any[];
  /**
   * Match notification timestamp
   * @type array
   */
  export type Tmatchcalendar = any[];
  /**
   * Memory properties.
   * @format {"current":{"default":512,"default_key":1,"description":"Current amount of online RAM for the VM in MiB. This is the maximum available memory when you use the balloon device.","minimum":16,"type":"integer"}}
   */
  export type Tmemory = string;
  /**
   * Set maximum tolerated downtime (in seconds) for migrations.
   * @minimum 0
   * @type number
   */
  export type Tmigrate_downtime = number;
  /**
   * For cluster wide migration settings.
   * @format {"network":{"description":"CIDR of the (sub) network that is used for migration.","format":"CIDR","format_description":"CIDR","optional":1,"type":"string"},"type":{"default":"secure","default_key":1,"description":"Migration traffic is encrypted using an SSH tunnel by default. On secure, completely private networks this can be disabled to increase performance.","enum":["secure","insecure"],"type":"string"}}
   */
  export type Tmigration = string;
  /**
   * Migration traffic is encrypted using an SSH tunnel by default. On secure, completely private networks this can be disabled to increase performance.
   */
  export type Tmigration_type = 'insecure' | 'secure';
  /**
   * Determine which encryption method shall be used for the connection.
   */
  export type Tmode = 'insecure' | 'starttls' | 'tls';
  /**
   * Choose between 'all' and 'any' for when multiple properties are specified
   */
  export type Tmode_1 = 'all' | 'any';
  /**
   * Backup mode.
   */
  export type Tmode_2 = 'snapshot' | 'stop' | 'suspend';
  /**
   * LDAP protocol mode.
   */
  export type Tmode_3 = 'ldap' | 'ldap+starttls' | 'ldaps';
  /**
   * Use volume as container mount point. Use the special syntax STORAGE_ID:SIZE_IN_GiB to allocate a new volume.
   * @format {"acl":{"description":"Explicitly enable or disable ACL support.","optional":1,"type":"boolean"},"backup":{"description":"Whether to include the mount point in backups.","optional":1,"type":"boolean","verbose_description":"Whether to include the mount point in backups (only used for volume mount points)."},"mountoptions":{"description":"Extra mount options for rootfs/mps.","format_description":"opt[;opt...]","optional":1,"pattern":"(?^:(?^:(noatime|lazytime|nodev|nosuid|noexec))(;(?^:(noatime|lazytime|nodev|nosuid|noexec)))*)","type":"string"},"mp":{"description":"Path to the mount point as seen from inside the container (must not contain symlinks).","format":"pve-lxc-mp-string","format_description":"Path","type":"string","verbose_description":"Path to the mount point as seen from inside the container.\n\nNOTE: Must not contain any symlinks for security reasons."},"quota":{"description":"Enable user quotas inside the container (not supported with zfs subvolumes)","optional":1,"type":"boolean"},"replicate":{"default":1,"description":"Will include this volume to a storage replica job.","optional":1,"type":"boolean"},"ro":{"description":"Read-only mount point","optional":1,"type":"boolean"},"shared":{"default":0,"description":"Mark this non-volume mount point as available on multiple nodes (see 'nodes')","optional":1,"type":"boolean","verbose_description":"Mark this non-volume mount point as available on all nodes.\n\nWARNING: This option does not share the mount point automatically, it assumes it is shared already!"},"size":{"description":"Volume size (read only value).","format":"disk-size","format_description":"DiskSize","optional":1,"type":"string"},"volume":{"default_key":1,"description":"Volume, device or directory to mount into the container.","format":"pve-lxc-mp-string","format_description":"volume","type":"string"}}
   */
  export type Tmp = string;
  /**
   * IP set name.
   * @pattern [A-Za-z][A-Za-z0-9\-\_]+
   * @minLength 2
   * @maxLength 64
   */
  export type Tname = string;
  /**
   * The name of the pool. It must be unique.
   */
  export type Tname_1 = string;
  /**
   * Specify network devices.
   * @format {"bridge":{"description":"Bridge to attach the network device to. The Proxmox VE standard bridge\nis called 'vmbr0'.\n\nIf you do not specify a bridge, we create a kvm user (NATed) network\ndevice, which provides DHCP and DNS services. The following addresses\nare used:\n\n 10.0.2.2   Gateway\n 10.0.2.3   DNS Server\n 10.0.2.4   SMB Server\n\nThe DHCP server assign addresses to the guest starting from 10.0.2.15.\n","format":"pve-bridge-id","format_description":"bridge","optional":1,"type":"string"},"e1000":{"alias":"macaddr","keyAlias":"model"},"e1000-82540em":{"alias":"macaddr","keyAlias":"model"},"e1000-82544gc":{"alias":"macaddr","keyAlias":"model"},"e1000-82545em":{"alias":"macaddr","keyAlias":"model"},"e1000e":{"alias":"macaddr","keyAlias":"model"},"firewall":{"description":"Whether this interface should be protected by the firewall.","optional":1,"type":"boolean"},"i82551":{"alias":"macaddr","keyAlias":"model"},"i82557b":{"alias":"macaddr","keyAlias":"model"},"i82559er":{"alias":"macaddr","keyAlias":"model"},"link_down":{"description":"Whether this interface should be disconnected (like pulling the plug).","optional":1,"type":"boolean"},"macaddr":{"description":"MAC address. That address must be unique withing your network. This is automatically generated if not specified.","format":"mac-addr","format_description":"XX:XX:XX:XX:XX:XX","optional":1,"type":"string","verbose_description":"A common MAC address with the I/G (Individual/Group) bit not set."},"model":{"default_key":1,"description":"Network Card Model. The 'virtio' model provides the best performance with very low CPU overhead. If your guest does not support this driver, it is usually best to use 'e1000'.","enum":["e1000","e1000-82540em","e1000-82544gc","e1000-82545em","e1000e","i82551","i82557b","i82559er","ne2k_isa","ne2k_pci","pcnet","rtl8139","virtio","vmxnet3"],"type":"string"},"mtu":{"description":"Force MTU, for VirtIO only. Set to '1' to use the bridge MTU","maximum":65520,"minimum":1,"optional":1,"type":"integer"},"ne2k_isa":{"alias":"macaddr","keyAlias":"model"},"ne2k_pci":{"alias":"macaddr","keyAlias":"model"},"pcnet":{"alias":"macaddr","keyAlias":"model"},"queues":{"description":"Number of packet queues to be used on the device.","maximum":64,"minimum":0,"optional":1,"type":"integer"},"rate":{"description":"Rate limit in mbps (megabytes per second) as floating point number.","minimum":0,"optional":1,"type":"number"},"rtl8139":{"alias":"macaddr","keyAlias":"model"},"tag":{"description":"VLAN tag to apply to packets on this interface.","maximum":4094,"minimum":1,"optional":1,"type":"integer"},"trunks":{"description":"VLAN trunks to pass through this interface.","format_description":"vlanid[;vlanid...]","optional":1,"pattern":"(?^:\\d+(?:-\\d+)?(?:;\\d+(?:-\\d+)?)*)","type":"string"},"virtio":{"alias":"macaddr","keyAlias":"model"},"vmxnet3":{"alias":"macaddr","keyAlias":"model"}}
   */
  export type Tnet = string;
  /**
   * Specifies network interfaces for the container.
   * @format {"bridge":{"description":"Bridge to attach the network device to.","format_description":"bridge","optional":1,"pattern":"[-_.\\w\\d]+","type":"string"},"firewall":{"description":"Controls whether this interface's firewall rules should be used.","optional":1,"type":"boolean"},"gw":{"description":"Default gateway for IPv4 traffic.","format":"ipv4","format_description":"GatewayIPv4","optional":1,"type":"string"},"gw6":{"description":"Default gateway for IPv6 traffic.","format":"ipv6","format_description":"GatewayIPv6","optional":1,"type":"string"},"hwaddr":{"description":"The interface MAC address. This is dynamically allocated by default, but you can set that statically if needed, for example to always have the same link-local IPv6 address. (lxc.network.hwaddr)","format":"mac-addr","format_description":"XX:XX:XX:XX:XX:XX","optional":1,"type":"string","verbose_description":"A common MAC address with the I/G (Individual/Group) bit not set."},"ip":{"description":"IPv4 address in CIDR format.","format":"pve-ipv4-config","format_description":"(IPv4/CIDR|dhcp|manual)","optional":1,"type":"string"},"ip6":{"description":"IPv6 address in CIDR format.","format":"pve-ipv6-config","format_description":"(IPv6/CIDR|auto|dhcp|manual)","optional":1,"type":"string"},"link_down":{"description":"Whether this interface should be disconnected (like pulling the plug).","optional":1,"type":"boolean"},"mtu":{"description":"Maximum transfer unit of the interface. (lxc.network.mtu)","maximum":65535,"minimum":64,"optional":1,"type":"integer"},"name":{"description":"Name of the network device as seen from inside the container. (lxc.network.name)","format_description":"string","pattern":"[-_.\\w\\d]+","type":"string"},"rate":{"description":"Apply rate limiting to the interface","format_description":"mbps","optional":1,"type":"number"},"tag":{"description":"VLAN tag for this interface.","maximum":4094,"minimum":1,"optional":1,"type":"integer"},"trunks":{"description":"VLAN ids to pass through the interface","format_description":"vlanid[;vlanid...]","optional":1,"pattern":"(?^:\\d+(?:;\\d+)*)","type":"string"},"type":{"description":"Network interface type.","enum":["veth"],"optional":1,"type":"string"}}
   */
  export type Tnet_1 = string;
  /**
   * Control the range for the free VMID auto-selection pool.
   * @format {"lower":{"default":100,"description":"Lower, inclusive boundary for free next-id API range.","max":999999999,"min":100,"optional":1,"type":"integer"},"upper":{"default":1000000,"description":"Upper, exclusive boundary for free next-id API range.","max":1000000000,"min":100,"optional":1,"type":"integer"}}
   */
  export type Tnextid = string;
  /**
   * Specify when to send a notification
   */
  export type Tnotificationpolicy = 'always' | 'failure' | 'never';
  /**
   * Cluster-wide notification settings.
   * @format {"fencing":{"default":"always","description":"Control if notifications about node fencing should be sent.","enum":["always","never"],"optional":1,"type":"string","verbose_description":"Control if notifications about node fencing should be sent.\n* 'always' always send out notifications\n* 'never' never send out notifications.\nFor production systems, turning off node fencing notifications is notrecommended!\n"},"package-updates":{"default":"auto","description":"Control when the daily update job should send out notifications.","enum":["auto","always","never"],"optional":1,"type":"string","verbose_description":"Control how often the daily update job should send out notifications:\n* 'auto' daily for systems with a valid subscription, as those are assumed to be  production-ready and thus should know about pending updates.\n* 'always' every update, if there are new pending updates.\n* 'never' never send a notification for new pending updates.\n"},"replication":{"default":"always","description":"Control if notifications for replication failures should be sent.","enum":["always","never"],"optional":1,"type":"string","verbose_description":"Control if notifications for replication failures should be sent.\n* 'always' always send out notifications\n* 'never' never send out notifications.\nFor production systems, turning off replication notifications is notrecommended!\n"},"target-fencing":{"description":"Control where notifications about fenced cluster nodes should be sent to.","format_description":"TARGET","optional":1,"type":"string","verbose_description":"Control where notifications about fenced cluster nodes should be sent to. Has to be the name of a notification target (endpoint or notification group). If the 'target-fencing' parameter is not set, the system will send mails to root via a 'sendmail' notification endpoint."},"target-package-updates":{"description":"Control where notifications about available updates should be sent to.","format_description":"TARGET","optional":1,"type":"string","verbose_description":"Control where notifications about available updates should be sent to. Has to be the name of a notification target (endpoint or notification group). If the 'target-package-updates' parameter is not set, the system will send mails to root via a 'sendmail' notification endpoint."},"target-replication":{"description":"Control where notifications for failed storage replication jobs should be sent to.","format_description":"TARGET","optional":1,"type":"string","verbose_description":"Control where notifications for failed storage replication jobs should be sent to. Has to be the name of a notification target (endpoint or notification group). If the 'target-replication' parameter is not set, the system will send mails to root via a 'sendmail' notification endpoint."}}
   */
  export type Tnotify = string;
  /**
   * NUMA topology.
   * @format {"cpus":{"description":"CPUs accessing this NUMA node.","format_description":"id[-id];...","pattern":"(?^:\\d+(?:-\\d+)?(?:;\\d+(?:-\\d+)?)*)","type":"string"},"hostnodes":{"description":"Host NUMA nodes to use.","format_description":"id[-id];...","optional":1,"pattern":"(?^:\\d+(?:-\\d+)?(?:;\\d+(?:-\\d+)?)*)","type":"string"},"memory":{"description":"Amount of memory this NUMA node provides.","optional":1,"type":"number"},"policy":{"description":"NUMA allocation policy.","enum":["preferred","bind","interleave"],"optional":1,"type":"string"}}
   */
  export type Tnuma = string;
  /**
   * Specify guest operating system. This is used to enable special
   * optimization/features for specific operating systems:
   * [horizontal]
   * other;; unspecified OS
   * wxp;; Microsoft Windows XP
   * w2k;; Microsoft Windows 2000
   * w2k3;; Microsoft Windows 2003
   * w2k8;; Microsoft Windows 2008
   * wvista;; Microsoft Windows Vista
   * win7;; Microsoft Windows 7
   * win8;; Microsoft Windows 8/2012/2012r2
   * win10;; Microsoft Windows 10/2016/2019
   * win11;; Microsoft Windows 11/2022
   * l24;; Linux 2.4 Kernel
   * l26;; Linux 2.6 - 6.X Kernel
   * solaris;; Solaris/OpenSolaris/OpenIndiania kernel
   *
   */
  export type Tostype = 'l24' | 'l26' | 'other' | 'solaris' | 'w2k' | 'w2k3' | 'w2k8' | 'win10' | 'win11' | 'win7' | 'win8' | 'wvista' | 'wxp';
  /**
   * OS type. This is used to setup configuration inside the container, and corresponds to lxc setup scripts in /usr/share/lxc/config/<ostype>.common.conf. Value 'unmanaged' can be used to skip and OS specific setup.
   */
  export type Tostype_1 = 'alpine' | 'archlinux' | 'centos' | 'debian' | 'devuan' | 'fedora' | 'gentoo' | 'nixos' | 'opensuse' | 'ubuntu' | 'unmanaged';
  /**
   * Map host parallel devices (n is 0 to 2).
   * NOTE: This option allows direct access to host hardware. So it is no longer possible to migrate such
   * machines - use with special care.
   * CAUTION: Experimental! User reported problems with this option.
   *
   * @pattern /dev/parport\d+|/dev/usb/lp\d+
   */
  export type Tparallel = string;
  /**
   * Sets root password inside container.
   * @minLength 5
   */
  export type Tpassword = string;
  /**
   * The automatic PG scaling mode of the pool.
   */
  export type Tpg_autoscale_mode = 'off' | 'on' | 'warn';
  /**
   * Input policy.
   */
  export type Tpolicy_in = 'ACCEPT' | 'DROP' | 'REJECT';
  /**
   * Preallocation mode for raw and qcow2 images. Using 'metadata' on raw images results in preallocation=off.
   */
  export type Tpreallocation = 'falloc' | 'full' | 'metadata' | 'off';
  /**
   * Specifies whether the Authorization Server prompts the End-User for reauthentication and consent.
   * @pattern (?:none|login|consent|select_account|\S+)
   */
  export type Tprompt = string;
  /**
   * Return only a specific property from the node configuration.
   */
  export type Tproperty = 'acme' | 'acmedomain0' | 'acmedomain1' | 'acmedomain2' | 'acmedomain3' | 'acmedomain4' | 'acmedomain5' | 'description' | 'startall-onboot-delay' | 'wakeonlan';
  /**
   * Protocol to send graphite data. TCP or UDP (default)
   */
  export type Tproto = 'tcp' | 'udp';
  /**
   * The RAID level to use.
   */
  export type Traidlevel = 'draid' | 'draid2' | 'draid3' | 'mirror' | 'raid10' | 'raidz' | 'raidz2' | 'raidz3' | 'single';
  /**
   * Rate limit in mbps (megabytes per second) as floating point number.
   * @minimum 1
   * @type number
   */
  export type Trate = number;
  /**
   * A list of tags that require a `Sys.Modify` on '/' to set and delete. Tags set here that are also in 'user-tag-access' also require `Sys.Modify`.
   * @pattern (?:(?^i:[a-z0-9_][a-z0-9_\-\+\.]*);)*(?^i:[a-z0-9_][a-z0-9_\-\+\.]*)
   */
  export type Tregisteredtags = string;
  /**
   * Mark the replication job for removal. The job will remove all local replication snapshots. When set to 'full', it also tries to remove replicated volumes on the target. The job then removes itself from the configuration file.
   */
  export type Tremove_job = 'full' | 'local';
  /**
   * A semicolon-seperated list of things to remove when they or the user vanishes during a sync. The following values are possible: 'entry' removes the user/group when not returned from the sync. 'properties' removes the set properties on existing user/group that do not appear in the source (even custom ones). 'acl' removes acls when the user/group is not returned from the sync. Instead of a list it also can be 'none' (the default).
   * @pattern (?:(?:(?:acl|properties|entry);)*(?:acl|properties|entry))|none
   */
  export type Tremovevanished = string;
  /**
   * Configure a VirtIO-based Random Number Generator.
   * @format {"max_bytes":{"default":1024,"description":"Maximum bytes of entropy allowed to get injected into the guest every 'period' milliseconds. Prefer a lower value when using '/dev/random' as source. Use `0` to disable limiting (potentially dangerous!).","optional":1,"type":"integer"},"period":{"default":1000,"description":"Every 'period' milliseconds the entropy-injection quota is reset, allowing the guest to retrieve another 'max_bytes' of entropy.","optional":1,"type":"integer"},"source":{"default_key":1,"description":"The file on the host to gather entropy from. In most cases '/dev/urandom' should be preferred over '/dev/random' to avoid entropy-starvation issues on the host. Using urandom does *not* decrease security in any meaningful way, as it's still seeded from real entropy, and the bytes provided will most likely be mixed with real entropy on the guest as well. '/dev/hwrng' can be used to pass through a hardware RNG from the host.","enum":["/dev/urandom","/dev/random","/dev/hwrng"],"type":"string"}}
   */
  export type Trng0 = string;
  /**
   * Use volume as container root.
   * @format {"acl":{"description":"Explicitly enable or disable ACL support.","optional":1,"type":"boolean"},"mountoptions":{"description":"Extra mount options for rootfs/mps.","format_description":"opt[;opt...]","optional":1,"pattern":"(?^:(?^:(noatime|lazytime|nodev|nosuid|noexec))(;(?^:(noatime|lazytime|nodev|nosuid|noexec)))*)","type":"string"},"quota":{"description":"Enable user quotas inside the container (not supported with zfs subvolumes)","optional":1,"type":"boolean"},"replicate":{"default":1,"description":"Will include this volume to a storage replica job.","optional":1,"type":"boolean"},"ro":{"description":"Read-only mount point","optional":1,"type":"boolean"},"shared":{"default":0,"description":"Mark this non-volume mount point as available on multiple nodes (see 'nodes')","optional":1,"type":"boolean","verbose_description":"Mark this non-volume mount point as available on all nodes.\n\nWARNING: This option does not share the mount point automatically, it assumes it is shared already!"},"size":{"description":"Volume size (read only value).","format":"disk-size","format_description":"DiskSize","optional":1,"type":"string"},"volume":{"default_key":1,"description":"Volume, device or directory to mount into the container.","format":"pve-lxc-mp-string","format_description":"volume","type":"string"}}
   */
  export type Trootfs = string;
  /**
   * Use volume as SATA hard disk or CD-ROM (n is 0 to 5). Use the special syntax STORAGE_ID:SIZE_IN_GiB to allocate a new volume. Use STORAGE_ID:0 and the 'import-from' parameter to import from an existing volume.
   * @format {"aio":{"description":"AIO type to use.","enum":["native","threads","io_uring"],"optional":1,"type":"string"},"backup":{"description":"Whether the drive should be included when making backups.","optional":1,"type":"boolean"},"bps":{"description":"Maximum r/w speed in bytes per second.","format_description":"bps","optional":1,"type":"integer"},"bps_max_length":{"description":"Maximum length of I/O bursts in seconds.","format_description":"seconds","minimum":1,"optional":1,"type":"integer"},"bps_rd":{"description":"Maximum read speed in bytes per second.","format_description":"bps","optional":1,"type":"integer"},"bps_rd_length":{"alias":"bps_rd_max_length"},"bps_rd_max_length":{"description":"Maximum length of read I/O bursts in seconds.","format_description":"seconds","minimum":1,"optional":1,"type":"integer"},"bps_wr":{"description":"Maximum write speed in bytes per second.","format_description":"bps","optional":1,"type":"integer"},"bps_wr_length":{"alias":"bps_wr_max_length"},"bps_wr_max_length":{"description":"Maximum length of write I/O bursts in seconds.","format_description":"seconds","minimum":1,"optional":1,"type":"integer"},"cache":{"description":"The drive's cache mode","enum":["none","writethrough","writeback","unsafe","directsync"],"optional":1,"type":"string"},"cyls":{"description":"Force the drive's physical geometry to have a specific cylinder count.","optional":1,"type":"integer"},"detect_zeroes":{"description":"Controls whether to detect and try to optimize writes of zeroes.","optional":1,"type":"boolean"},"discard":{"description":"Controls whether to pass discard/trim requests to the underlying storage.","enum":["ignore","on"],"optional":1,"type":"string"},"file":{"default_key":1,"description":"The drive's backing volume.","format":"pve-volume-id-or-qm-path","format_description":"volume","type":"string"},"format":{"description":"The drive's backing file's data format.","enum":["raw","cow","qcow","qed","qcow2","vmdk","cloop"],"optional":1,"type":"string"},"heads":{"description":"Force the drive's physical geometry to have a specific head count.","optional":1,"type":"integer"},"import-from":{"description":"Create a new disk, importing from this source (volume ID or absolute path). When an absolute path is specified, it's up to you to ensure that the source is not actively used by another process during the import!","format":"pve-volume-id-or-absolute-path","format_description":"source volume","optional":1,"type":"string"},"iops":{"description":"Maximum r/w I/O in operations per second.","format_description":"iops","optional":1,"type":"integer"},"iops_max":{"description":"Maximum unthrottled r/w I/O pool in operations per second.","format_description":"iops","optional":1,"type":"integer"},"iops_max_length":{"description":"Maximum length of I/O bursts in seconds.","format_description":"seconds","minimum":1,"optional":1,"type":"integer"},"iops_rd":{"description":"Maximum read I/O in operations per second.","format_description":"iops","optional":1,"type":"integer"},"iops_rd_length":{"alias":"iops_rd_max_length"},"iops_rd_max":{"description":"Maximum unthrottled read I/O pool in operations per second.","format_description":"iops","optional":1,"type":"integer"},"iops_rd_max_length":{"description":"Maximum length of read I/O bursts in seconds.","format_description":"seconds","minimum":1,"optional":1,"type":"integer"},"iops_wr":{"description":"Maximum write I/O in operations per second.","format_description":"iops","optional":1,"type":"integer"},"iops_wr_length":{"alias":"iops_wr_max_length"},"iops_wr_max":{"description":"Maximum unthrottled write I/O pool in operations per second.","format_description":"iops","optional":1,"type":"integer"},"iops_wr_max_length":{"description":"Maximum length of write I/O bursts in seconds.","format_description":"seconds","minimum":1,"optional":1,"type":"integer"},"mbps":{"description":"Maximum r/w speed in megabytes per second.","format_description":"mbps","optional":1,"type":"number"},"mbps_max":{"description":"Maximum unthrottled r/w pool in megabytes per second.","format_description":"mbps","optional":1,"type":"number"},"mbps_rd":{"description":"Maximum read speed in megabytes per second.","format_description":"mbps","optional":1,"type":"number"},"mbps_rd_max":{"description":"Maximum unthrottled read pool in megabytes per second.","format_description":"mbps","optional":1,"type":"number"},"mbps_wr":{"description":"Maximum write speed in megabytes per second.","format_description":"mbps","optional":1,"type":"number"},"mbps_wr_max":{"description":"Maximum unthrottled write pool in megabytes per second.","format_description":"mbps","optional":1,"type":"number"},"media":{"default":"disk","description":"The drive's media type.","enum":["cdrom","disk"],"optional":1,"type":"string"},"replicate":{"default":1,"description":"Whether the drive should considered for replication jobs.","optional":1,"type":"boolean"},"rerror":{"description":"Read error action.","enum":["ignore","report","stop"],"optional":1,"type":"string"},"secs":{"description":"Force the drive's physical geometry to have a specific sector count.","optional":1,"type":"integer"},"serial":{"description":"The drive's reported serial number, url-encoded, up to 20 bytes long.","format":"urlencoded","format_description":"serial","maxLength":60,"optional":1,"type":"string"},"shared":{"default":0,"description":"Mark this locally-managed volume as available on all nodes","optional":1,"type":"boolean","verbose_description":"Mark this locally-managed volume as available on all nodes.\n\nWARNING: This option does not share the volume automatically, it assumes it is shared already!"},"size":{"description":"Disk size. This is purely informational and has no effect.","format":"disk-size","format_description":"DiskSize","optional":1,"type":"string"},"snapshot":{"description":"Controls qemu's snapshot mode feature. If activated, changes made to the disk are temporary and will be discarded when the VM is shutdown.","optional":1,"type":"boolean"},"ssd":{"description":"Whether to expose this drive as an SSD, rather than a rotational hard disk.","optional":1,"type":"boolean"},"trans":{"description":"Force disk geometry bios translation mode.","enum":["none","lba","auto"],"optional":1,"type":"string"},"volume":{"alias":"file"},"werror":{"description":"Write error action.","enum":["enospc","ignore","report","stop"],"optional":1,"type":"string"},"wwn":{"description":"The drive's worldwide name, encoded as 16 bytes hex string, prefixed by '0x'.","format_description":"wwn","optional":1,"pattern":"(?^:^(0x)[0-9a-fA-F]{16})","type":"string"}}
   */
  export type Tsata = string;
  export type Tscope = 'all' | 'versions';
  /**
   * Select what to sync.
   */
  export type Tscope_1 = 'both' | 'groups' | 'users';
  /**
   * Use volume as SCSI hard disk or CD-ROM (n is 0 to 30). Use the special syntax STORAGE_ID:SIZE_IN_GiB to allocate a new volume. Use STORAGE_ID:0 and the 'import-from' parameter to import from an existing volume.
   * @format {"aio":{"description":"AIO type to use.","enum":["native","threads","io_uring"],"optional":1,"type":"string"},"backup":{"description":"Whether the drive should be included when making backups.","optional":1,"type":"boolean"},"bps":{"description":"Maximum r/w speed in bytes per second.","format_description":"bps","optional":1,"type":"integer"},"bps_max_length":{"description":"Maximum length of I/O bursts in seconds.","format_description":"seconds","minimum":1,"optional":1,"type":"integer"},"bps_rd":{"description":"Maximum read speed in bytes per second.","format_description":"bps","optional":1,"type":"integer"},"bps_rd_length":{"alias":"bps_rd_max_length"},"bps_rd_max_length":{"description":"Maximum length of read I/O bursts in seconds.","format_description":"seconds","minimum":1,"optional":1,"type":"integer"},"bps_wr":{"description":"Maximum write speed in bytes per second.","format_description":"bps","optional":1,"type":"integer"},"bps_wr_length":{"alias":"bps_wr_max_length"},"bps_wr_max_length":{"description":"Maximum length of write I/O bursts in seconds.","format_description":"seconds","minimum":1,"optional":1,"type":"integer"},"cache":{"description":"The drive's cache mode","enum":["none","writethrough","writeback","unsafe","directsync"],"optional":1,"type":"string"},"cyls":{"description":"Force the drive's physical geometry to have a specific cylinder count.","optional":1,"type":"integer"},"detect_zeroes":{"description":"Controls whether to detect and try to optimize writes of zeroes.","optional":1,"type":"boolean"},"discard":{"description":"Controls whether to pass discard/trim requests to the underlying storage.","enum":["ignore","on"],"optional":1,"type":"string"},"file":{"default_key":1,"description":"The drive's backing volume.","format":"pve-volume-id-or-qm-path","format_description":"volume","type":"string"},"format":{"description":"The drive's backing file's data format.","enum":["raw","cow","qcow","qed","qcow2","vmdk","cloop"],"optional":1,"type":"string"},"heads":{"description":"Force the drive's physical geometry to have a specific head count.","optional":1,"type":"integer"},"import-from":{"description":"Create a new disk, importing from this source (volume ID or absolute path). When an absolute path is specified, it's up to you to ensure that the source is not actively used by another process during the import!","format":"pve-volume-id-or-absolute-path","format_description":"source volume","optional":1,"type":"string"},"iops":{"description":"Maximum r/w I/O in operations per second.","format_description":"iops","optional":1,"type":"integer"},"iops_max":{"description":"Maximum unthrottled r/w I/O pool in operations per second.","format_description":"iops","optional":1,"type":"integer"},"iops_max_length":{"description":"Maximum length of I/O bursts in seconds.","format_description":"seconds","minimum":1,"optional":1,"type":"integer"},"iops_rd":{"description":"Maximum read I/O in operations per second.","format_description":"iops","optional":1,"type":"integer"},"iops_rd_length":{"alias":"iops_rd_max_length"},"iops_rd_max":{"description":"Maximum unthrottled read I/O pool in operations per second.","format_description":"iops","optional":1,"type":"integer"},"iops_rd_max_length":{"description":"Maximum length of read I/O bursts in seconds.","format_description":"seconds","minimum":1,"optional":1,"type":"integer"},"iops_wr":{"description":"Maximum write I/O in operations per second.","format_description":"iops","optional":1,"type":"integer"},"iops_wr_length":{"alias":"iops_wr_max_length"},"iops_wr_max":{"description":"Maximum unthrottled write I/O pool in operations per second.","format_description":"iops","optional":1,"type":"integer"},"iops_wr_max_length":{"description":"Maximum length of write I/O bursts in seconds.","format_description":"seconds","minimum":1,"optional":1,"type":"integer"},"iothread":{"description":"Whether to use iothreads for this drive","optional":1,"type":"boolean"},"mbps":{"description":"Maximum r/w speed in megabytes per second.","format_description":"mbps","optional":1,"type":"number"},"mbps_max":{"description":"Maximum unthrottled r/w pool in megabytes per second.","format_description":"mbps","optional":1,"type":"number"},"mbps_rd":{"description":"Maximum read speed in megabytes per second.","format_description":"mbps","optional":1,"type":"number"},"mbps_rd_max":{"description":"Maximum unthrottled read pool in megabytes per second.","format_description":"mbps","optional":1,"type":"number"},"mbps_wr":{"description":"Maximum write speed in megabytes per second.","format_description":"mbps","optional":1,"type":"number"},"mbps_wr_max":{"description":"Maximum unthrottled write pool in megabytes per second.","format_description":"mbps","optional":1,"type":"number"},"media":{"default":"disk","description":"The drive's media type.","enum":["cdrom","disk"],"optional":1,"type":"string"},"queues":{"description":"Number of queues.","minimum":2,"optional":1,"type":"integer"},"replicate":{"default":1,"description":"Whether the drive should considered for replication jobs.","optional":1,"type":"boolean"},"rerror":{"description":"Read error action.","enum":["ignore","report","stop"],"optional":1,"type":"string"},"ro":{"description":"Whether the drive is read-only.","optional":1,"type":"boolean"},"scsiblock":{"default":0,"description":"whether to use scsi-block for full passthrough of host block device\n\nWARNING: can lead to I/O errors in combination with low memory or high memory fragmentation on host","optional":1,"type":"boolean"},"secs":{"description":"Force the drive's physical geometry to have a specific sector count.","optional":1,"type":"integer"},"serial":{"description":"The drive's reported serial number, url-encoded, up to 20 bytes long.","format":"urlencoded","format_description":"serial","maxLength":60,"optional":1,"type":"string"},"shared":{"default":0,"description":"Mark this locally-managed volume as available on all nodes","optional":1,"type":"boolean","verbose_description":"Mark this locally-managed volume as available on all nodes.\n\nWARNING: This option does not share the volume automatically, it assumes it is shared already!"},"size":{"description":"Disk size. This is purely informational and has no effect.","format":"disk-size","format_description":"DiskSize","optional":1,"type":"string"},"snapshot":{"description":"Controls qemu's snapshot mode feature. If activated, changes made to the disk are temporary and will be discarded when the VM is shutdown.","optional":1,"type":"boolean"},"ssd":{"description":"Whether to expose this drive as an SSD, rather than a rotational hard disk.","optional":1,"type":"boolean"},"trans":{"description":"Force disk geometry bios translation mode.","enum":["none","lba","auto"],"optional":1,"type":"string"},"volume":{"alias":"file"},"werror":{"description":"Write error action.","enum":["enospc","ignore","report","stop"],"optional":1,"type":"string"},"wwn":{"description":"The drive's worldwide name, encoded as 16 bytes hex string, prefixed by '0x'.","format_description":"wwn","optional":1,"pattern":"(?^:^(0x)[0-9a-fA-F]{16})","type":"string"}}
   */
  export type Tscsi = string;
  /**
   * SCSI controller model
   */
  export type Tscsihw = 'lsi' | 'lsi53c810' | 'megasas' | 'pvscsi' | 'virtio-scsi-pci' | 'virtio-scsi-single';
  /**
   * Create a serial device inside the VM (n is 0 to 3), and pass through a
   * host serial device (i.e. /dev/ttyS0), or create a unix socket on the
   * host side (use 'qm terminal' to open a terminal connection).
   * NOTE: If you pass through a host serial device, it is no longer possible to migrate such machines -
   * use with special care.
   * CAUTION: Experimental! User reported problems with this option.
   *
   * @pattern (/dev/.+|socket)
   */
  export type Tserial = string;
  /**
   * opens a serial terminal (defaults to display)
   */
  export type Tserial_1 = 'serial0' | 'serial1' | 'serial2' | 'serial3';
  /**
   * Ceph service name.
   * @pattern (ceph|mon|mds|osd|mgr)(\.[a-zA-Z0-9]([a-zA-Z0-9\-]*[a-zA-Z0-9])?)?
   */
  export type Tservice = string;
  /**
   * Ceph service name.
   * @pattern (mon|mds|osd|mgr)(\.[a-zA-Z0-9]([a-zA-Z0-9\-]*[a-zA-Z0-9])?)?
   */
  export type Tservice_1 = string;
  /**
   * Service type
   */
  export type Tservice_2 = 'mds' | 'mon' | 'osd';
  /**
   * Display all log since this date-time string.
   * @pattern ^\d{4}-\d{2}-\d{2}( \d{2}:\d{2}(:\d{2})?)?$
   */
  export type Tsince = string;
  /**
   * The new size. With the `+` sign the value is added to the actual size of the volume and without it, the value is taken as an absolute one. Shrinking disk size is not supported.
   * @pattern \+?\d+(\.\d+)?[KMGT]?
   */
  export type Tsize = string;
  /**
   * Size in kilobyte (1024 bytes). Optional suffixes 'M' (megabyte, 1024K) and 'G' (gigabyte, 1024M)
   * @pattern \d+[MG]?
   */
  export type Tsize_1 = string;
  /**
   * SMB protocol version. 'default' if not set, negotiates the highest SMB2+ version supported by both the client and server.
   */
  export type Tsmbversion = '2.0' | '2.1' | '3' | '3.0' | '3.11' | 'default';
  /**
   * List archived, active or all tasks.
   */
  export type Tsource = 'active' | 'all' | 'archive';
  /**
   * Configure additional enhancements for SPICE.
   * @format {"foldersharing":{"default":"0","description":"Enable folder sharing via SPICE. Needs Spice-WebDAV daemon installed in the VM.","optional":1,"type":"boolean"},"videostreaming":{"default":"off","description":"Enable video streaming. Uses compression for detected video streams.","enum":["off","all","filter"],"optional":1,"type":"string"}}
   */
  export type Tspice_enhancements = string;
  /**
   * LDAPS TLS/SSL version. It's not recommended to use version older than 1.2!
   */
  export type Tsslversion = 'tlsv1' | 'tlsv1_1' | 'tlsv1_2' | 'tlsv1_3';
  /**
   * Set the initial date of the real time clock. Valid format for date are:'now' or '2006-06-17T16:01:21' or '2006-06-17'.
   * @pattern (now|\d{4}-\d{1,2}-\d{1,2}(T\d{1,2}:\d{1,2}:\d{1,2})?)
   */
  export type Tstartdate = string;
  /**
   * Job Start time.
   * @pattern \d{1,2}:\d{1,2}
   */
  export type Tstarttime = string;
  /**
   * Requested resource state. The CRM reads this state and acts accordingly.
   * Please note that `enabled` is just an alias for `started`.
   * `started`;;
   * The CRM tries to start the resource. Service state is
   * set to `started` after successful start. On node failures, or when start
   * fails, it tries to recover the resource.  If everything fails, service
   * state it set to `error`.
   * `stopped`;;
   * The CRM tries to keep the resource in `stopped` state, but it
   * still tries to relocate the resources on node failures.
   * `disabled`;;
   * The CRM tries to put the resource in `stopped` state, but does not try
   * to relocate the resources on node failures. The main purpose of this
   * state is error recovery, because it is the only way to move a resource out
   * of the `error` state.
   * `ignored`;;
   * The resource gets removed from the manager status and so the CRM and the LRM do
   * not touch the resource anymore. All \{pve\} API calls affecting this resource
   * will be executed, directly bypassing the HA stack. CRM commands will be thrown
   * away while there source is in this state. The resource will not get relocated
   * on node failures.
   *
   */
  export type Tstate = 'disabled' | 'enabled' | 'ignored' | 'started' | 'stopped';
  /**
   * Comma separated list of key=value pairs for specifying which LDAP attributes map to which PVE user field. For example, to map the LDAP attribute 'mail' to PVEs 'email', write  'email=mail'. By default, each PVE user field is represented  by an LDAP attribute of the same name.
   * @pattern \w+=[^,]+(,\s*\w+=[^,]+)*
   */
  export type Tsync_attributes = string;
  /**
   * Tag style options.
   * @format {"case-sensitive":{"default":0,"description":"Controls if filtering for unique tags on update should check case-sensitive.","optional":1,"type":"boolean"},"color-map":{"description":"Manual color mapping for tags (semicolon separated).","optional":1,"pattern":"(?:(?^i:[a-z0-9_][a-z0-9_\\-\\+\\.]*):[0-9a-fA-F]{6}(?::[0-9a-fA-F]{6})?)(?:;(?:(?^i:[a-z0-9_][a-z0-9_\\-\\+\\.]*):[0-9a-fA-F]{6}(?::[0-9a-fA-F]{6})?))*","type":"string","typetext":"<tag>:<hex-color>[:<hex-color-for-text>][;<tag>=...]"},"ordering":{"default":"alphabetical","description":"Controls the sorting of the tags in the web-interface and the API update.","enum":["config","alphabetical"],"optional":1,"type":"string"},"shape":{"default":"circle","description":"Tag shape for the web ui tree. 'full' draws the full tag. 'circle' draws only a circle with the background color. 'dense' only draws a small rectancle (useful when many tags are assigned to each guest).'none' disables showing the tags.","enum":["full","circle","dense","none"],"optional":1,"type":"string"}}
   */
  export type Ttagstyle = string;
  /**
   * The estimated target size of the pool for the PG autoscaler.
   * @pattern ^(\d+(\.\d+)?)([KMGT])?$
   */
  export type Ttarget_size = string;
  /**
   * The estimated target ratio of the pool for the PG autoscaler.
   * @type number
   */
  export type Ttarget_size_ratio = number;
  /**
   * The config key the volume will be moved to. Default is the source volume key.
   */
  export type Ttargetvolume = 'mp0' | 'mp1' | 'mp10' | 'mp100' | 'mp101' | 'mp102' | 'mp103' | 'mp104' | 'mp105' | 'mp106' | 'mp107' | 'mp108' | 'mp109' | 'mp11' | 'mp110' | 'mp111' | 'mp112' | 'mp113' | 'mp114' | 'mp115' | 'mp116' | 'mp117' | 'mp118' | 'mp119' | 'mp12' | 'mp120' | 'mp121' | 'mp122' | 'mp123' | 'mp124' | 'mp125' | 'mp126' | 'mp127' | 'mp128' | 'mp129' | 'mp13' | 'mp130' | 'mp131' | 'mp132' | 'mp133' | 'mp134' | 'mp135' | 'mp136' | 'mp137' | 'mp138' | 'mp139' | 'mp14' | 'mp140' | 'mp141' | 'mp142' | 'mp143' | 'mp144' | 'mp145' | 'mp146' | 'mp147' | 'mp148' | 'mp149' | 'mp15' | 'mp150' | 'mp151' | 'mp152' | 'mp153' | 'mp154' | 'mp155' | 'mp156' | 'mp157' | 'mp158' | 'mp159' | 'mp16' | 'mp160' | 'mp161' | 'mp162' | 'mp163' | 'mp164' | 'mp165' | 'mp166' | 'mp167' | 'mp168' | 'mp169' | 'mp17' | 'mp170' | 'mp171' | 'mp172' | 'mp173' | 'mp174' | 'mp175' | 'mp176' | 'mp177' | 'mp178' | 'mp179' | 'mp18' | 'mp180' | 'mp181' | 'mp182' | 'mp183' | 'mp184' | 'mp185' | 'mp186' | 'mp187' | 'mp188' | 'mp189' | 'mp19' | 'mp190' | 'mp191' | 'mp192' | 'mp193' | 'mp194' | 'mp195' | 'mp196' | 'mp197' | 'mp198' | 'mp199' | 'mp2' | 'mp20' | 'mp200' | 'mp201' | 'mp202' | 'mp203' | 'mp204' | 'mp205' | 'mp206' | 'mp207' | 'mp208' | 'mp209' | 'mp21' | 'mp210' | 'mp211' | 'mp212' | 'mp213' | 'mp214' | 'mp215' | 'mp216' | 'mp217' | 'mp218' | 'mp219' | 'mp22' | 'mp220' | 'mp221' | 'mp222' | 'mp223' | 'mp224' | 'mp225' | 'mp226' | 'mp227' | 'mp228' | 'mp229' | 'mp23' | 'mp230' | 'mp231' | 'mp232' | 'mp233' | 'mp234' | 'mp235' | 'mp236' | 'mp237' | 'mp238' | 'mp239' | 'mp24' | 'mp240' | 'mp241' | 'mp242' | 'mp243' | 'mp244' | 'mp245' | 'mp246' | 'mp247' | 'mp248' | 'mp249' | 'mp25' | 'mp250' | 'mp251' | 'mp252' | 'mp253' | 'mp254' | 'mp255' | 'mp26' | 'mp27' | 'mp28' | 'mp29' | 'mp3' | 'mp30' | 'mp31' | 'mp32' | 'mp33' | 'mp34' | 'mp35' | 'mp36' | 'mp37' | 'mp38' | 'mp39' | 'mp4' | 'mp40' | 'mp41' | 'mp42' | 'mp43' | 'mp44' | 'mp45' | 'mp46' | 'mp47' | 'mp48' | 'mp49' | 'mp5' | 'mp50' | 'mp51' | 'mp52' | 'mp53' | 'mp54' | 'mp55' | 'mp56' | 'mp57' | 'mp58' | 'mp59' | 'mp6' | 'mp60' | 'mp61' | 'mp62' | 'mp63' | 'mp64' | 'mp65' | 'mp66' | 'mp67' | 'mp68' | 'mp69' | 'mp7' | 'mp70' | 'mp71' | 'mp72' | 'mp73' | 'mp74' | 'mp75' | 'mp76' | 'mp77' | 'mp78' | 'mp79' | 'mp8' | 'mp80' | 'mp81' | 'mp82' | 'mp83' | 'mp84' | 'mp85' | 'mp86' | 'mp87' | 'mp88' | 'mp89' | 'mp9' | 'mp90' | 'mp91' | 'mp92' | 'mp93' | 'mp94' | 'mp95' | 'mp96' | 'mp97' | 'mp98' | 'mp99' | 'rootfs' | 'unused0' | 'unused1' | 'unused10' | 'unused100' | 'unused101' | 'unused102' | 'unused103' | 'unused104' | 'unused105' | 'unused106' | 'unused107' | 'unused108' | 'unused109' | 'unused11' | 'unused110' | 'unused111' | 'unused112' | 'unused113' | 'unused114' | 'unused115' | 'unused116' | 'unused117' | 'unused118' | 'unused119' | 'unused12' | 'unused120' | 'unused121' | 'unused122' | 'unused123' | 'unused124' | 'unused125' | 'unused126' | 'unused127' | 'unused128' | 'unused129' | 'unused13' | 'unused130' | 'unused131' | 'unused132' | 'unused133' | 'unused134' | 'unused135' | 'unused136' | 'unused137' | 'unused138' | 'unused139' | 'unused14' | 'unused140' | 'unused141' | 'unused142' | 'unused143' | 'unused144' | 'unused145' | 'unused146' | 'unused147' | 'unused148' | 'unused149' | 'unused15' | 'unused150' | 'unused151' | 'unused152' | 'unused153' | 'unused154' | 'unused155' | 'unused156' | 'unused157' | 'unused158' | 'unused159' | 'unused16' | 'unused160' | 'unused161' | 'unused162' | 'unused163' | 'unused164' | 'unused165' | 'unused166' | 'unused167' | 'unused168' | 'unused169' | 'unused17' | 'unused170' | 'unused171' | 'unused172' | 'unused173' | 'unused174' | 'unused175' | 'unused176' | 'unused177' | 'unused178' | 'unused179' | 'unused18' | 'unused180' | 'unused181' | 'unused182' | 'unused183' | 'unused184' | 'unused185' | 'unused186' | 'unused187' | 'unused188' | 'unused189' | 'unused19' | 'unused190' | 'unused191' | 'unused192' | 'unused193' | 'unused194' | 'unused195' | 'unused196' | 'unused197' | 'unused198' | 'unused199' | 'unused2' | 'unused20' | 'unused200' | 'unused201' | 'unused202' | 'unused203' | 'unused204' | 'unused205' | 'unused206' | 'unused207' | 'unused208' | 'unused209' | 'unused21' | 'unused210' | 'unused211' | 'unused212' | 'unused213' | 'unused214' | 'unused215' | 'unused216' | 'unused217' | 'unused218' | 'unused219' | 'unused22' | 'unused220' | 'unused221' | 'unused222' | 'unused223' | 'unused224' | 'unused225' | 'unused226' | 'unused227' | 'unused228' | 'unused229' | 'unused23' | 'unused230' | 'unused231' | 'unused232' | 'unused233' | 'unused234' | 'unused235' | 'unused236' | 'unused237' | 'unused238' | 'unused239' | 'unused24' | 'unused240' | 'unused241' | 'unused242' | 'unused243' | 'unused244' | 'unused245' | 'unused246' | 'unused247' | 'unused248' | 'unused249' | 'unused25' | 'unused250' | 'unused251' | 'unused252' | 'unused253' | 'unused254' | 'unused255' | 'unused26' | 'unused27' | 'unused28' | 'unused29' | 'unused3' | 'unused30' | 'unused31' | 'unused32' | 'unused33' | 'unused34' | 'unused35' | 'unused36' | 'unused37' | 'unused38' | 'unused39' | 'unused4' | 'unused40' | 'unused41' | 'unused42' | 'unused43' | 'unused44' | 'unused45' | 'unused46' | 'unused47' | 'unused48' | 'unused49' | 'unused5' | 'unused50' | 'unused51' | 'unused52' | 'unused53' | 'unused54' | 'unused55' | 'unused56' | 'unused57' | 'unused58' | 'unused59' | 'unused6' | 'unused60' | 'unused61' | 'unused62' | 'unused63' | 'unused64' | 'unused65' | 'unused66' | 'unused67' | 'unused68' | 'unused69' | 'unused7' | 'unused70' | 'unused71' | 'unused72' | 'unused73' | 'unused74' | 'unused75' | 'unused76' | 'unused77' | 'unused78' | 'unused79' | 'unused8' | 'unused80' | 'unused81' | 'unused82' | 'unused83' | 'unused84' | 'unused85' | 'unused86' | 'unused87' | 'unused88' | 'unused89' | 'unused9' | 'unused90' | 'unused91' | 'unused92' | 'unused93' | 'unused94' | 'unused95' | 'unused96' | 'unused97' | 'unused98' | 'unused99';
  /**
   * Specify the time frame you are interested in.
   */
  export type Ttimeframe = 'day' | 'hour' | 'month' | 'week' | 'year';
  /**
   * The source file name. This parameter is usually set by the REST handler. You can only overwrite it when connecting to the trusted port on localhost.
   * @pattern /var/tmp/pveupload-[0-9a-f]+
   */
  export type Ttmpfilename = string;
  /**
   * Configure a Disk for storing TPM state. The format is fixed to 'raw'. Use the special syntax STORAGE_ID:SIZE_IN_GiB to allocate a new volume. Note that SIZE_IN_GiB is ignored here and 4 MiB will be used instead. Use STORAGE_ID:0 and the 'import-from' parameter to import from an existing volume.
   * @format {"file":{"default_key":1,"description":"The drive's backing volume.","format":"pve-volume-id-or-qm-path","format_description":"volume","type":"string"},"import-from":{"description":"Create a new disk, importing from this source (volume ID or absolute path). When an absolute path is specified, it's up to you to ensure that the source is not actively used by another process during the import!","format":"pve-volume-id-or-absolute-path","format_description":"source volume","optional":1,"type":"string"},"size":{"description":"Disk size. This is purely informational and has no effect.","format":"disk-size","format_description":"DiskSize","optional":1,"type":"string"},"version":{"default":"v2.0","description":"The TPM interface version. v2.0 is newer and should be preferred. Note that this cannot be changed later on.","enum":["v1.2","v2.0"],"optional":1,"type":"string"},"volume":{"alias":"file"}}
   */
  export type Ttpmstate0 = string;
  /**
   * Gluster transport: tcp or rdma
   */
  export type Ttransport = 'rdma' | 'tcp' | 'unix';
  /**
   * Section type.
   */
  export type Ttype = 'local';
  /**
   * Rule type.
   */
  export type Ttype_1 = 'group' | 'in' | 'out';
  /**
   * Only list sdn ipams of specific type
   */
  export type Ttype_10 = 'netbox' | 'phpipam' | 'pve';
  /**
   * Only list sdn dns of specific type
   */
  export type Ttype_11 = 'powerdns';
  export type Ttype_12 = 'node' | 'sdn' | 'storage' | 'vm';
  /**
   * Config type.
   */
  export type Ttype_13 = 'meta' | 'network' | 'user';
  /**
   * OSD device type
   */
  export type Ttype_14 = 'block' | 'db' | 'wal';
  /**
   * Only list specific interface types.
   */
  export type Ttype_15 = 'OVSBond' | 'OVSBridge' | 'OVSIntPort' | 'OVSPort' | 'alias' | 'any_bridge' | 'any_local_bridge' | 'bond' | 'bridge' | 'eth' | 'vlan';
  /**
   * Network interface type
   */
  export type Ttype_16 = 'OVSBond' | 'OVSBridge' | 'OVSIntPort' | 'OVSPort' | 'alias' | 'bond' | 'bridge' | 'eth' | 'unknown' | 'vlan';
  /**
   * Either 'qemu' or 'lxc'. Only consider backups for guests of this type.
   */
  export type Ttype_17 = 'lxc' | 'qemu';
  /**
   * Only list specific types of disks.
   */
  export type Ttype_18 = 'journal_disks' | 'unused';
  /**
   * Only list storage of specific type
   */
  export type Ttype_19 = 'btrfs' | 'cephfs' | 'cifs' | 'dir' | 'glusterfs' | 'iscsi' | 'iscsidirect' | 'lvm' | 'lvmthin' | 'nfs' | 'pbs' | 'rbd' | 'zfs' | 'zfspool';
  /**
   * Only list references of specified type.
   */
  export type Ttype_2 = 'alias' | 'ipset';
  /**
   * Realm type.
   */
  export type Ttype_20 = 'ad' | 'ldap' | 'openid' | 'pam' | 'pve';
  /**
   * TFA Entry Type.
   */
  export type Ttype_21 = 'recovery' | 'totp' | 'u2f' | 'webauthn' | 'yubico';
  export type Ttype_22 = 'lxc' | 'qemu' | 'storage';
  /**
   * Only list resources of specific type
   */
  export type Ttype_3 = 'ct' | 'vm';
  /**
   * Group type.
   */
  export type Ttype_4 = 'group';
  /**
   * Only list ACME plugins of a specific type
   */
  export type Ttype_5 = 'dns' | 'standalone';
  /**
   * Type
   */
  export type Ttype_6 = 'vnet';
  export type Ttype_7 = 'subnet';
  /**
   * Only list SDN zones of specific type
   */
  export type Ttype_8 = 'evpn' | 'faucet' | 'qinq' | 'simple' | 'vlan' | 'vxlan';
  /**
   * Only list sdn controllers of specific type
   */
  export type Ttype_9 = 'bgp' | 'evpn' | 'faucet' | 'isis';
  /**
   * u2f
   * @format {"appid":{"description":"U2F AppId URL override. Defaults to the origin.","format_description":"APPID","optional":1,"type":"string"},"origin":{"description":"U2F Origin override. Mostly useful for single nodes with a single URL.","format_description":"URL","optional":1,"type":"string"}}
   */
  export type Tu2f = string;
  /**
   * Reference to unused volumes. This is used internally, and should not be modified manually.
   * @format {"file":{"default_key":1,"description":"The drive's backing volume.","format":"pve-volume-id","format_description":"volume","type":"string"},"volume":{"alias":"file"}}
   */
  export type Tunused = string;
  /**
   * Reference to unused volumes. This is used internally, and should not be modified manually.
   * @format {"volume":{"default_key":1,"description":"The volume that is not used currently.","format":"pve-volume-id","format_description":"volume","type":"string"}}
   */
  export type Tunused_1 = string;
  /**
   * The URL to download the file from.
   * @pattern https?://.*
   */
  export type Turl = string;
  /**
   * Configure an USB device (n is 0 to 4, for machine version >= 7.1 and ostype l26 or windows > 7, n can be up to 14).
   * @format {"host":{"default_key":1,"description":"The Host USB device or port or the value 'spice'. HOSTUSBDEVICE syntax is:\n\n 'bus-port(.port)*' (decimal numbers) or\n 'vendor_id:product_id' (hexadeciaml numbers) or\n 'spice'\n\nYou can use the 'lsusb -t' command to list existing usb devices.\n\nNOTE: This option allows direct access to host hardware. So it is no longer possible to migrate such\nmachines - use with special care.\n\nThe value 'spice' can be used to add a usb redirection devices for spice.\n\nEither this or the 'mapping' key must be set.\n","format_description":"HOSTUSBDEVICE|spice","optional":1,"pattern":"(?^:(?:(?:(?^:(0x)?([0-9A-Fa-f]{4}):(0x)?([0-9A-Fa-f]{4})))|(?:(?^:(\\d+)\\-(\\d+(\\.\\d+)*)))|[Ss][Pp][Ii][Cc][Ee]))","type":"string"},"mapping":{"description":"The ID of a cluster wide mapping. Either this or the default-key 'host' must be set.","format":"pve-configid","format_description":"mapping-id","optional":1,"type":"string"},"usb3":{"default":0,"description":"Specifies whether if given host option is a USB3 device or port. For modern guests (machine version >= 7.1 and ostype l26 and windows > 7), this flag is irrelevant (all devices are plugged into a xhci controller).","optional":1,"type":"boolean"}}
   */
  export type Tusb = string;
  /**
   * LDAP user attribute name
   * @pattern \S{2,}
   * @maxLength 256
   */
  export type Tuser_attr = string;
  /**
   * User ID or full API token ID
   * @pattern (?^:^(?^:[^\s:/]+)\@(?^:[A-Za-z][A-Za-z0-9\.\-_]+)(?:!(?^:[A-Za-z][A-Za-z0-9\.\-_]+))?$)
   */
  export type Tuserid = string;
  /**
   * Privilege options for user-settable tags
   * @format {"user-allow":{"default":"free","description":"Controls tag usage for users without `Sys.Modify` on `/` by either allowing `none`, a `list`, already `existing` or anything (`free`).","enum":["none","list","existing","free"],"optional":1,"type":"string","verbose_description":"Controls which tags can be set or deleted on resources a user controls (such as guests). Users with the `Sys.Modify` privilege on `/` are alwaysunrestricted.\n* 'none' no tags are usable.\n* 'list' tags from 'user-allow-list' are usable.\n* 'existing' like list, but already existing tags of resources are also usable.\n* 'free' no tag restrictions.\n"},"user-allow-list":{"description":"List of tags users are allowed to set and delete (semicolon separated) for 'user-allow' values 'list' and 'existing'.","optional":1,"pattern":"(?^i:[a-z0-9_][a-z0-9_\\-\\+\\.]*)(?:;(?^i:[a-z0-9_][a-z0-9_\\-\\+\\.]*))*","type":"string","typetext":"<tag>[;<tag>...]"}}
   */
  export type Tusertagaccess = string;
  /**
   * UUID for the GPT table
   * @pattern [a-fA-F0-9\-]+
   * @maxLength 36
   */
  export type Tuuid = string;
  /**
   * @pattern [a-zA-Z0-9\.\+\_][a-zA-Z0-9\.\+\_\-]+
   * @maxLength 100
   */
  export type Tvg = string;
  /**
   * Configure the VGA Hardware. If you want to use high resolution modes (>= 1280x1024x16) you may need to increase the vga memory option. Since QEMU 2.9 the default VGA display type is 'std' for all OS types besides some Windows versions (XP and older) which use 'cirrus'. The 'qxl' option enables the SPICE display server. For win* OS you can select how many independent displays you want, Linux guests can add displays them self.
   * You can also run without any graphic card, using a serial device as terminal.
   * @format {"clipboard":{"description":"Enable a specific clipboard. If not set, depending on the display type the SPICE one will be added.","enum":["vnc"],"optional":1,"type":"string"},"memory":{"description":"Sets the VGA memory (in MiB). Has no effect with serial display.","maximum":512,"minimum":4,"optional":1,"type":"integer"},"type":{"default":"std","default_key":1,"description":"Select the VGA type.","enum":["cirrus","qxl","qxl2","qxl3","qxl4","none","serial0","serial1","serial2","serial3","std","virtio","virtio-gl","vmware"],"optional":1,"type":"string"}}
   */
  export type Tvga = string;
  /**
   * Use volume as VIRTIO hard disk (n is 0 to 15). Use the special syntax STORAGE_ID:SIZE_IN_GiB to allocate a new volume. Use STORAGE_ID:0 and the 'import-from' parameter to import from an existing volume.
   * @format {"aio":{"description":"AIO type to use.","enum":["native","threads","io_uring"],"optional":1,"type":"string"},"backup":{"description":"Whether the drive should be included when making backups.","optional":1,"type":"boolean"},"bps":{"description":"Maximum r/w speed in bytes per second.","format_description":"bps","optional":1,"type":"integer"},"bps_max_length":{"description":"Maximum length of I/O bursts in seconds.","format_description":"seconds","minimum":1,"optional":1,"type":"integer"},"bps_rd":{"description":"Maximum read speed in bytes per second.","format_description":"bps","optional":1,"type":"integer"},"bps_rd_length":{"alias":"bps_rd_max_length"},"bps_rd_max_length":{"description":"Maximum length of read I/O bursts in seconds.","format_description":"seconds","minimum":1,"optional":1,"type":"integer"},"bps_wr":{"description":"Maximum write speed in bytes per second.","format_description":"bps","optional":1,"type":"integer"},"bps_wr_length":{"alias":"bps_wr_max_length"},"bps_wr_max_length":{"description":"Maximum length of write I/O bursts in seconds.","format_description":"seconds","minimum":1,"optional":1,"type":"integer"},"cache":{"description":"The drive's cache mode","enum":["none","writethrough","writeback","unsafe","directsync"],"optional":1,"type":"string"},"cyls":{"description":"Force the drive's physical geometry to have a specific cylinder count.","optional":1,"type":"integer"},"detect_zeroes":{"description":"Controls whether to detect and try to optimize writes of zeroes.","optional":1,"type":"boolean"},"discard":{"description":"Controls whether to pass discard/trim requests to the underlying storage.","enum":["ignore","on"],"optional":1,"type":"string"},"file":{"default_key":1,"description":"The drive's backing volume.","format":"pve-volume-id-or-qm-path","format_description":"volume","type":"string"},"format":{"description":"The drive's backing file's data format.","enum":["raw","cow","qcow","qed","qcow2","vmdk","cloop"],"optional":1,"type":"string"},"heads":{"description":"Force the drive's physical geometry to have a specific head count.","optional":1,"type":"integer"},"import-from":{"description":"Create a new disk, importing from this source (volume ID or absolute path). When an absolute path is specified, it's up to you to ensure that the source is not actively used by another process during the import!","format":"pve-volume-id-or-absolute-path","format_description":"source volume","optional":1,"type":"string"},"iops":{"description":"Maximum r/w I/O in operations per second.","format_description":"iops","optional":1,"type":"integer"},"iops_max":{"description":"Maximum unthrottled r/w I/O pool in operations per second.","format_description":"iops","optional":1,"type":"integer"},"iops_max_length":{"description":"Maximum length of I/O bursts in seconds.","format_description":"seconds","minimum":1,"optional":1,"type":"integer"},"iops_rd":{"description":"Maximum read I/O in operations per second.","format_description":"iops","optional":1,"type":"integer"},"iops_rd_length":{"alias":"iops_rd_max_length"},"iops_rd_max":{"description":"Maximum unthrottled read I/O pool in operations per second.","format_description":"iops","optional":1,"type":"integer"},"iops_rd_max_length":{"description":"Maximum length of read I/O bursts in seconds.","format_description":"seconds","minimum":1,"optional":1,"type":"integer"},"iops_wr":{"description":"Maximum write I/O in operations per second.","format_description":"iops","optional":1,"type":"integer"},"iops_wr_length":{"alias":"iops_wr_max_length"},"iops_wr_max":{"description":"Maximum unthrottled write I/O pool in operations per second.","format_description":"iops","optional":1,"type":"integer"},"iops_wr_max_length":{"description":"Maximum length of write I/O bursts in seconds.","format_description":"seconds","minimum":1,"optional":1,"type":"integer"},"iothread":{"description":"Whether to use iothreads for this drive","optional":1,"type":"boolean"},"mbps":{"description":"Maximum r/w speed in megabytes per second.","format_description":"mbps","optional":1,"type":"number"},"mbps_max":{"description":"Maximum unthrottled r/w pool in megabytes per second.","format_description":"mbps","optional":1,"type":"number"},"mbps_rd":{"description":"Maximum read speed in megabytes per second.","format_description":"mbps","optional":1,"type":"number"},"mbps_rd_max":{"description":"Maximum unthrottled read pool in megabytes per second.","format_description":"mbps","optional":1,"type":"number"},"mbps_wr":{"description":"Maximum write speed in megabytes per second.","format_description":"mbps","optional":1,"type":"number"},"mbps_wr_max":{"description":"Maximum unthrottled write pool in megabytes per second.","format_description":"mbps","optional":1,"type":"number"},"media":{"default":"disk","description":"The drive's media type.","enum":["cdrom","disk"],"optional":1,"type":"string"},"replicate":{"default":1,"description":"Whether the drive should considered for replication jobs.","optional":1,"type":"boolean"},"rerror":{"description":"Read error action.","enum":["ignore","report","stop"],"optional":1,"type":"string"},"ro":{"description":"Whether the drive is read-only.","optional":1,"type":"boolean"},"secs":{"description":"Force the drive's physical geometry to have a specific sector count.","optional":1,"type":"integer"},"serial":{"description":"The drive's reported serial number, url-encoded, up to 20 bytes long.","format":"urlencoded","format_description":"serial","maxLength":60,"optional":1,"type":"string"},"shared":{"default":0,"description":"Mark this locally-managed volume as available on all nodes","optional":1,"type":"boolean","verbose_description":"Mark this locally-managed volume as available on all nodes.\n\nWARNING: This option does not share the volume automatically, it assumes it is shared already!"},"size":{"description":"Disk size. This is purely informational and has no effect.","format":"disk-size","format_description":"DiskSize","optional":1,"type":"string"},"snapshot":{"description":"Controls qemu's snapshot mode feature. If activated, changes made to the disk are temporary and will be discarded when the VM is shutdown.","optional":1,"type":"boolean"},"trans":{"description":"Force disk geometry bios translation mode.","enum":["none","lba","auto"],"optional":1,"type":"string"},"volume":{"alias":"file"},"werror":{"description":"Write error action.","enum":["enospc","ignore","report","stop"],"optional":1,"type":"string"}}
   */
  export type Tvirtio = string;
  export type Tvlanprotocol = '802.1ad' | '802.1q';
  /**
   * The VM generation ID (vmgenid) device exposes a 128-bit integer value identifier to the guest OS. This allows to notify the guest operating system when the virtual machine is executed with a different configuration (e.g. snapshot execution or creation from a template). The guest operating system notices the change, and is then able to react as appropriate by marking its copies of distributed databases as dirty, re-initializing its random number generator, etc.
   * Note that auto-creation only works when done through API/CLI create or update methods, but not when manually editing the config file.
   * @pattern (?:[a-fA-F0-9]{8}(?:-[a-fA-F0-9]{4}){3}-[a-fA-F0-9]{12}|[01])
   */
  export type Tvmgenid = string;
  /**
   * If a block.wal is requested but the size is not given, will be automatically selected by: bluestore_block_wal_size from the ceph database (osd or global section) or config (osd or global section) in that order. If this is not available, it will be sized 1% of the size of the OSD device. Fails if the available size is not enough.
   * @minimum 0.5
   * @type number
   */
  export type Twal_dev_size = number;
  /**
   * webauthn configuration
   * @format {"allow-subdomains":{"default":1,"description":"Whether to allow the origin to be a subdomain, rather than the exact URL.","optional":1,"type":"boolean"},"id":{"description":"Relying party ID. Must be the domain name without protocol, port or location. Changing this *will* break existing credentials.","format_description":"DOMAINNAME","optional":1,"type":"string"},"origin":{"description":"Site origin. Must be a `https://` URL (or `http://localhost`). Should contain the address users type in their browsers to access the web interface. Changing this *may* break existing credentials.","format_description":"URL","optional":1,"type":"string"},"rp":{"description":"Relying party name. Any text identifier. Changing this *may* break existing credentials.","format_description":"RELYING_PARTY","optional":1,"type":"string"}}
   */
  export type Twebauthn = string;
  /**
   * server dns name or IP address
   * @format address
   */
  export type address = string;
  /**
   * Server IP address (or DNS name)
   * @format address
   * @maxLength 256
   */
  export type address_1 = string;
  /**
   * cloud-init: Sets DNS server IP address for a container. Create will automatically use the setting from the host if neither searchdomain nor nameserver are set.
   * @format address-list
   */
  export type addresslist = string;
  /**
   * Other performance-related settings.
   * @format backup-performance
   */
  export type backupperformance = string;
  /**
   * Mapping from source to target bridges. Providing only a single bridge ID maps all source bridges to that bridge. Providing the special value '1' will map each source bridge to itself.
   * @format bridge-pair-list
   */
  export type bridgepairlist = string;
  /**
   * dns domain zone prefix  ex: 'adm' -> <hostname>.adm.mydomain.com
   * @format dns-name
   */
  export type dnsname = string;
  /**
   * Set a host name for the container.
   * @format dns-name
   * @maxLength 255
   */
  export type dnsname_1 = string;
  /**
   * Sets DNS search domains for a container. Create will automatically use the setting from the host if you neither set searchdomain nor nameserver.
   * @format dns-name-list
   */
  export type dnsnamelist = string;
  /**
   * Contact email addresses.
   * @format email-list
   */
  export type emaillist = string;
  /**
   * Specify email address to send notification from (default is root@$hostname)
   * @format email-opt
   */
  export type emailopt = string;
  /**
   * Comma-separated list of email addresses or users that should receive email notifications. Has no effect if the 'notification-target' option  is set at the same time.
   * @format email-or-username-list
   */
  export type emailorusernamelist = string;
  /**
   * root graphite path (ex: proxmox.mycluster.mykey)
   * @format graphite-path
   */
  export type graphitepath = string;
  /**
   * The port to be used. Defaults to 465 for TLS based connections, 587 for STARTTLS based connections and port 25 for insecure plain-text connections.
   * @type integer
   */
  export type integer = number;
  /**
   * Network mask.
   * @minimum 0
   * @maximum 128
   * @type integer
   */
  export type integer0_128 = number;
  /**
   * Extra delay in seconds to wait before requesting validation. Allows to cope with a long TTL of DNS records.
   * @minimum 0
   * @maximum 172800
   * @type integer
   */
  export type integer0_172800 = number;
  /**
   * Initial delay in seconds, before starting all the Virtual Guests with on-boot enabled.
   * @minimum 0
   * @maximum 300
   * @type integer
   */
  export type integer0_300 = number;
  /**
   * autonomous system number
   * @minimum 0
   * @maximum 4294967296
   * @type integer
   */
  export type integer0_4294967296 = number;
  /**
   * Amount of memory shares for auto-ballooning. The larger the number is, the more memory this VM gets. Number is relative to weights of all other running VMs. Using zero disables auto-ballooning. Auto-ballooning is done by pvestatd.
   * @minimum 0
   * @maximum 50000
   * @type integer
   */
  export type integer0_50000 = number;
  /**
   * CPU weight for a container. Argument is used in the kernel fair scheduler. The larger the number is, the more CPU time this container gets. Number is relative to the weights of all the other running guests.
   * @minimum 0
   * @maximum 500000
   * @type integer
   */
  export type integer0_500000 = number;
  /**
   * Specify the number of tty available to the container
   * @minimum 0
   * @maximum 6
   * @type integer
   */
  export type integer0_6 = number;
  /**
   * Timeout for each guest shutdown task. Depending on `force-stop`, the shutdown gets then simply aborted or a hard-stop is forced.
   * @minimum 0
   * @maximum 7200
   * @type integer
   */
  export type integer0_7200 = number;
  /**
   * Set IO priority when using the BFQ scheduler. For snapshot and suspend mode backups of VMs, this only affects the compressor. A value of 8 means the idle priority is used, otherwise the best-effort priority is used with the specified value.
   * @minimum 0
   * @maximum 8
   * @type integer
   */
  export type integer0_8 = number;
  /**
   * MTU.
   * @minimum 1280
   * @maximum 65520
   * @type integer
   */
  export type integer1280_65520 = number;
  /**
   * sets the height of the console in pixels.
   * @minimum 16
   * @maximum 2160
   * @type integer
   */
  export type integer16_2160 = number;
  /**
   * sets the width of the console in pixels.
   * @minimum 16
   * @maximum 4096
   * @type integer
   */
  export type integer16_4096 = number;
  /**
   * Number of event-iteration to simulate and return.
   * @minimum 1
   * @maximum 100
   * @type integer
   */
  export type integer1_100 = number;
  /**
   * CPU weight for a VM. Argument is used in the kernel fair scheduler. The larger the number is, the more CPU time this VM gets. Number is relative to weights of all the other running VMs.
   * @minimum 1
   * @maximum 262144
   * @type integer
   */
  export type integer1_262144 = number;
  /**
   * Time to wait for the task to finish. We return 'null' if the task finish within that time.
   * @minimum 1
   * @maximum 30
   * @type integer
   */
  export type integer1_30 = number;
  /**
   * Number of placement groups.
   * @minimum 1
   * @maximum 32768
   * @type integer
   */
  export type integer1_32768 = number;
  /**
   * Specify a VLan tag (used by OVSPort, OVSIntPort, OVSBond)
   * @minimum 1
   * @maximum 4094
   * @type integer
   */
  export type integer1_4094 = number;
  /**
   * Optional port.
   * @minimum 1
   * @maximum 65535
   * @type integer
   */
  export type integer1_65535 = number;
  /**
   * server network port
   * @minimum 1
   * @maximum 65536
   * @type integer
   */
  export type integer1_65536 = number;
  /**
   * Minimum number of replicas per object
   * @minimum 1
   * @maximum 7
   * @type integer
   */
  export type integer1_7 = number;
  /**
   * Number of replicas per object
   * @minimum 1
   * @maximum 7
   * @type integer
   */
  export type integer1_7_1 = number;
  /**
   * Minimum number of available replicas per object to allow I/O
   * @minimum 1
   * @maximum 7
   * @type integer
   */
  export type integer1_7_2 = number;
  /**
   * The number of cores assigned to the container. A container can use all available cores by default.
   * @minimum 1
   * @maximum 8192
   * @type integer
   */
  export type integer1_8192 = number;
  /**
   * Conntrack syn recv timeout.
   * @minimum 30
   * @maximum 60
   * @type integer
   */
  export type integer30_60 = number;
  /**
   * MTU for metrics transmission over UDP
   * @minimum 512
   * @maximum 65536
   * @type integer
   */
  export type integer512_65536 = number;
  /**
   * Port number returned by previous vncproxy call.
   * @minimum 5900
   * @maximum 5999
   * @type integer
   */
  export type integer5900_5999 = number;
  /**
   * Placement group bits, used to specify the default number of placement groups.
   * Depreacted. This setting was deprecated in recent Ceph versions.
   * @minimum 6
   * @maximum 14
   * @type integer
   */
  export type integer6_14 = number;
  /**
   * Number of placement groups for the backing data pool. The metadata pool will use a quarter of this.
   * @minimum 8
   * @maximum 32768
   * @type integer
   */
  export type integer8_32768 = number;
  /**
   * Pool sector size exponent.
   * @minimum 9
   * @maximum 16
   * @type integer
   */
  export type integer9_16 = number;
  /**
   * Minimal number of placement groups.
   * @maximum 32768
   * @type integer
   */
  export type integerMax32768 = number;
  /**
   * graphite TCP socket timeout (default=1)
   * @minimum 0
   * @type integer
   */
  export type integer_Min0 = number;
  /**
   * Override I/O bandwidth limit (in KiB/s).
   * @minimum 0
   * @type integer
   */
  export type integer_Min0_1 = number;
  /**
   * InfluxDB max-body-size in bytes. Requests are batched up to this size.
   * @minimum 1
   * @type integer
   */
  export type integer_Min1 = number;
  /**
   * Amount of RAM for the container in MB.
   * @minimum 16
   * @type integer
   */
  export type integer_Min16 = number;
  /**
   * OSD services per physical device. Only useful for fast NVMe devices"
   * ." to utilize their performance better.
   * @minimum 1
   * @type integer
   */
  export type integer_Min1_1 = number;
  /**
   * Maximum number of tracked connections.
   * @minimum 32768
   * @type integer
   */
  export type integer_Min32768 = number;
  /**
   * Conntrack established timeout.
   * @minimum 7875
   * @type integer
   */
  export type integer_Min7875 = number;
  /**
   * Maximal number of protected backups per guest. Use '-1' for unlimited.
   * @minimum -1
   * @type integer
   */
  export type integer_Min__1 = number;
  /**
   * IP Address of node to add. Used as fallback if no links are given.
   * @format ip
   */
  export type ip = string;
  /**
   * peers address list.
   * @format ip-list
   */
  export type iplist = string;
  /**
   * IP address.
   * @format ipv4
   */
  export type ipv4 = string;
  /**
   * Network mask.
   * @format ipv4mask
   */
  export type ipv4mask = string;
  /**
   * IP address.
   * @format ipv6
   */
  export type ipv6 = string;
  /**
   * LDAP attribute representing a groups name. If not set or found, the first value of the DN will be used as name.
   * @format ldap-simple-attr
   * @maxLength 256
   */
  export type ldapsimpleattr = string;
  /**
   * The objectclasses for groups.
   * @format ldap-simple-attr-list
   */
  export type ldapsimpleattrlist = string;
  /**
   * Sets DNS server IP address for a container. Create will automatically use the setting from the host if you neither set searchdomain nor nameserver.
   * @format lxc-ip-with-ll-iface-list
   */
  export type lxcipwithllifacelist = string;
  /**
   * A common MAC address with the I/G (Individual/Group) bit not set.
   * @format mac-addr
   */
  export type macaddr = string;
  /**
   * Prefix for the auto-generated MAC addresses of virtual guests. The default `BC:24:11` is the Organizationally Unique Identifier (OUI) assigned by the IEEE to Proxmox Server Solutions GmbH for a MAC Address Block Large (MA-L). You're allowed to use this in local networks, i.e., those not directly reachable by the public (e.g., in a LAN or NAT/Masquerading).
   *
   * Note that when you run multiple cluster that (partially) share the networks of their virtual guests, it's highly recommended that you extend the default MAC prefix, or generate a custom (valid) one, to reduce the chance of MAC collisions. For example, add a separate extra hexadecimal to the Proxmox OUI for each cluster, like `BC:24:11:0` for the first, `BC:24:11:1` for the second, and so on.
   * Alternatively, you can also separate the networks of the guests logically, e.g., by using VLANs.
   * For publicly accessible guests it's recommended that you get your own https://standards.ieee.org/products-programs/regauth/[OUI from the IEEE] registered or coordinate with your, or your hosting providers, network admins.
   * @format mac-prefix
   */
  export type macprefix = string;
  /**
   * PEM encoded certificate (chain).
   * @format pem-certificate-chain
   */
  export type pemcertificatechain = string;
  /**
   * PEM encoded private key.
   * @format pem-string
   */
  export type pemstring = string;
  /**
   * Remote target endpoint
   * @format proxmox-remote
   */
  export type proxmoxremote = string;
  /**
   * Use these retention options instead of those from the storage configuration.
   * @format prune-backups
   */
  export type prunebackups = string;
  /**
   * List of network bridges to check availability. Will be checked again for actually used bridges during migration.
   * @format pve-bridge-id-list
   */
  export type pvebridgeidlist = string;
  /**
   * Storage replication schedule. The format is a subset of `systemd` calendar events.
   * @format pve-calendar-event
   * @maxLength 128
   */
  export type pvecalendarevent = string;
  /**
   * JSON encoded array of commands, where each command is an object with the following properties:
   * args:      <object>
   * A set of parameter names and their values.
   * method:    (GET|POST|PUT|DELETE)
   * A method related to the API endpoint (GET, POST etc.).
   * path:      <string>
   * A relative path to an API endpoint on this node.
   *
   * @format pve-command-batch
   */
  export type pvecommandbatch = string;
  /**
   * Plugin type.
   * @format pve-configid
   */
  export type pveconfigid = 'graphite' | 'influxdb';
  /**
   * The name of the endpoint.
   * @format pve-configid
   */
  export type pveconfigid_1 = string;
  /**
   * Plugin type.
   * @format pve-configid
   */
  export type pveconfigid_2 = 'evpn' | 'faucet' | 'qinq' | 'simple' | 'vlan' | 'vxlan';
  /**
   * Plugin type.
   * @format pve-configid
   */
  export type pveconfigid_3 = 'bgp' | 'evpn' | 'faucet' | 'isis';
  /**
   * Plugin type.
   * @format pve-configid
   */
  export type pveconfigid_4 = 'netbox' | 'phpipam' | 'pve';
  /**
   * Plugin type.
   * @format pve-configid
   */
  export type pveconfigid_5 = 'powerdns';
  /**
   * Fetch config values from given snapshot.
   * @format pve-configid
   * @maxLength 40
   */
  export type pveconfigid_6 = string;
  /**
   * A list of settings you want to delete.
   * @format pve-configid-list
   * @maxLength 4096
   */
  export type pveconfigidlist = string;
  /**
   * A list of settings you want to delete.
   * @format pve-configid-list
   */
  export type pveconfigidlist_1 = string;
  /**
   * List of host cores used to execute guest processes, for example: 0,5,8-11
   * @format pve-cpuset
   */
  export type pvecpuset = string;
  /**
   * Time zone to use in the container. If option isn't set, then nothing will be done. Can be set to 'host' to match the host time zone, or an arbitrary time zone option from /usr/share/zoneinfo/zone.tab
   * @format pve-ct-timezone
   */
  export type pvecttimezone = string;
  /**
   * Day of week selection.
   * @format pve-day-of-week-list
   */
  export type pvedayofweeklist = string;
  /**
   * Overrides for default content type directories.
   * @format pve-dir-override-list
   */
  export type pvediroverridelist = string;
  /**
   * Restrict packet destination address. This can refer to a single IP address, an IP set ('+ipsetname') or an IP alias definition. You can also specify an address range like '20.34.101.207-201.3.9.99', or a list of IP addresses and networks (entries are separated by comma). Please do not mix IPv4 and IPv6 addresses inside such lists.
   * @format pve-fw-addr-spec
   * @maxLength 512
   */
  export type pvefwaddrspec = string;
  /**
   * Enable conntrack helpers for specific protocols. Supported protocols: amanda, ftp, irc, netbios-ns, pptp, sane, sip, snmp, tftp
   * @format pve-fw-conntrack-helper
   */
  export type pvefwconntrackhelper = string;
  /**
   * Restrict TCP/UDP destination port. You can use service names or simple numbers (0-65535), as defined in '/etc/services'. Port ranges can be specified with '\d+:\d+', for example '80:85', and you can use comma separated list to match several ports or ranges.
   * @format pve-fw-dport-spec
   */
  export type pvefwdportspec = string;
  /**
   * Specify icmp-type. Only valid if proto equals 'icmp' or 'icmpv6'/'ipv6-icmp'.
   * @format pve-fw-icmp-type-spec
   */
  export type pvefwicmptypespec = string;
  /**
   * IP protocol. You can use protocol names ('tcp'/'udp') or simple numbers, as defined in '/etc/protocols'.
   * @format pve-fw-protocol-spec
   */
  export type pvefwprotocolspec = string;
  /**
   * Restrict TCP/UDP source port. You can use service names or simple numbers (0-65535), as defined in '/etc/services'. Port ranges can be specified with '\d+:\d+', for example '80:85', and you can use comma separated list to match several ports or ranges.
   * @format pve-fw-sport-spec
   */
  export type pvefwsportspec = string;
  /**
   * @format pve-groupid
   */
  export type pvegroupid = string;
  /**
   * @format pve-groupid-list
   */
  export type pvegroupidlist = string;
  /**
   * List of cluster node members, where a priority can be given to each node. A resource bound to a group will run on the available nodes with the highest priority. If there are more nodes in the highest priority class, the services will get distributed to those nodes. The priorities have a relative meaning only.
   * @format pve-ha-group-node-list
   */
  export type pvehagroupnodelist = string;
  /**
   * HA resource ID. This consists of a resource type followed by a resource specific name, separated with colon (example: vm:100 / ct:100). For virtual machines and containers, you can simply use the VM or CT id as a shortcut (example: 100).
   * @format pve-ha-resource-or-vm-id
   */
  export type pveharesourceorvmid = string;
  /**
   * Selectively enable hotplug features. This is a comma separated list of hotplug features: 'network', 'disk', 'cpu', 'memory', 'usb' and 'cloudinit'. Use '0' to disable hotplug completely. Using '1' as value is an alias for the default `network,disk,usb`. USB hotplugging is possible for guests with machine version >= 7.1 and ostype l26 or windows > 7.
   * @format pve-hotplug-features
   */
  export type pvehotplugfeatures = string;
  /**
   * Network interface name. You have to use network configuration key names for VMs and containers ('net\d+'). Host related rules can use arbitrary strings.
   * @format pve-iface
   * @minLength 2
   * @maxLength 20
   */
  export type pveiface = string;
  /**
   * Specify the primary interface for active-backup bond.
   * @format pve-iface
   */
  export type pveiface_1 = string;
  /**
   * ISIS interface.
   * @format pve-iface-list
   */
  export type pveifacelist = string;
  /**
   * For internal use, to detect if the guest was stolen.
   * @format pve-node
   */
  export type pvenode = string;
  /**
   * The name of the cluster.
   * @format pve-node
   * @maxLength 15
   */
  export type pvenode_1 = string;
  /**
   * List of cluster node names.
   * @format pve-node-list
   */
  export type pvenodelist = string;
  /**
   * Add the VM to the specified pool.
   * @format pve-poolid
   */
  export type pvepoolid = string;
  /**
   * @format pve-priv-list
   */
  export type pveprivlist = string;
  /**
   * Verify ticket, and check if user have access 'privs' on 'path'
   * @format pve-priv-list
   * @maxLength 64
   */
  export type pveprivlist_1 = string;
  /**
   * Specify guest boot order. Use the 'order=' sub-property as usage with no key or 'legacy=' is deprecated.
   * @format pve-qm-boot
   */
  export type pveqmboot = string;
  /**
   * Enable booting from specified disk. Deprecated: Use 'boot: order=foo;bar' instead.
   * @pattern (ide|sata|scsi|virtio)\d+
   * @format pve-qm-bootdisk
   */
  export type pveqmbootdisk = string;
  /**
   * cloud-init: Specify custom files to replace the automatically generated ones at start.
   * @format pve-qm-cicustom
   */
  export type pveqmcicustom = string;
  /**
   * Map host PCI devices into guest.
   * NOTE: This option allows direct access to host hardware. So it is no longer
   * possible to migrate such machines - use with special care.
   * CAUTION: Experimental! User reported problems with this option.
   *
   * @format pve-qm-hostpci
   */
  export type pveqmhostpci = string;
  /**
   * This is an alias for option -ide2
   * @format pve-qm-ide
   */
  export type pveqmide = string;
  /**
   * cloud-init: Specify IP addresses and gateways for the corresponding interface.
   * IP addresses use CIDR notation, gateways are optional but need an IP of the same type specified.
   * The special string 'dhcp' can be used for IP addresses to use DHCP, in which case no explicit
   * gateway should be provided.
   * For IPv6 the special string 'auto' can be used to use stateless autoconfiguration. This requires
   * cloud-init 19.4 or newer.
   * If cloud-init is enabled and neither an IPv4 nor an IPv6 address is specified, it defaults to using
   * dhcp on IPv4.
   *
   * @format pve-qm-ipconfig
   */
  export type pveqmipconfig = string;
  /**
   * Specify SMBIOS type 1 fields.
   * @format pve-qm-smbios1
   * @maxLength 512
   */
  export type pveqmsmbios1 = string;
  /**
   * Create a virtual hardware watchdog device. Once enabled (by a guest action), the watchdog must be periodically polled by an agent inside the guest or else the watchdog will reset the guest (or execute the respective action specified)
   * @format pve-qm-watchdog
   */
  export type pveqmwatchdog = string;
  /**
   * Authentication domain ID
   * @format pve-realm
   * @maxLength 32
   */
  export type pverealm = string;
  /**
   * Replication Job ID. The ID is composed of a Guest ID and a job number, separated by a hyphen, i.e. '<GUEST>-<JOBNUM>'.
   * @pattern [1-9][0-9]{2,8}-\d{1,9}
   * @format pve-replication-job-id
   */
  export type pvereplicationjobid = string;
  /**
   * @format pve-roleid
   */
  export type pveroleid = string;
  /**
   * List of roles.
   * @format pve-roleid-list
   */
  export type pveroleidlist = string;
  /**
   * Route-Target import
   * @format pve-sdn-bgp-rt-list
   */
  export type pvesdnbgprtlist = string;
  /**
   * The SDN controller object identifier.
   * @format pve-sdn-controller-id
   */
  export type pvesdncontrollerid = string;
  /**
   * The SDN dns object identifier.
   * @format pve-sdn-dns-id
   */
  export type pvesdndnsid = string;
  /**
   * The SDN ipam object identifier.
   * @format pve-sdn-ipam-id
   */
  export type pvesdnipamid = string;
  /**
   * The SDN subnet object identifier.
   * @format pve-sdn-subnet-id
   */
  export type pvesdnsubnetid = string;
  /**
   * The SDN vnet object identifier.
   * @format pve-sdn-vnet-id
   */
  export type pvesdnvnetid = string;
  /**
   * The SDN zone object identifier.
   * @format pve-sdn-zone-id
   */
  export type pvesdnzoneid = string;
  /**
   * Startup and shutdown behavior. Order is a non-negative number defining the general startup order. Shutdown in done with reverse ordering. Additionally you can set the 'up' or 'down' delay in seconds, which specifies a delay to wait before the next VM is started or stopped.
   * @format pve-startup-order
   */
  export type pvestartuporder = string;
  /**
   * Only list content of this type.
   * @format pve-storage-content
   */
  export type pvestoragecontent = string;
  /**
   * Content type.
   * @format pve-storage-content
   */
  export type pvestoragecontent_1 = 'iso' | 'vztmpl';
  /**
   * Only list stores which support this content type.
   * @format pve-storage-content-list
   */
  export type pvestoragecontentlist = string;
  /**
   * Default image format.
   * @format pve-storage-format
   */
  export type pvestorageformat = string;
  /**
   * Store resulting file to this storage.
   * @format pve-storage-id
   */
  export type pvestorageid = string;
  /**
   * List of storages to check permission and availability. Will be checked again for all actually used storages during migration.
   * @format pve-storage-id-list
   */
  export type pvestorageidlist = string;
  /**
   * NFS/CIFS mount options (see 'man nfs' or 'man mount.cifs')
   * @format pve-storage-options
   */
  export type pvestorageoptions = string;
  /**
   * NFS export path.
   * @format pve-storage-path
   */
  export type pvestoragepath = string;
  /**
   * The iSCSI portal (IP or DNS name with optional port).
   * @format pve-storage-portal-dns
   */
  export type pvestorageportaldns = string;
  /**
   * IP addresses of monitors (for external clusters).
   * @format pve-storage-portal-dns-list
   */
  export type pvestorageportaldnslist = string;
  /**
   * The server address (name or IP).
   * @format pve-storage-server
   */
  export type pvestorageserver = string;
  /**
   * LVM thin pool LV name.
   * @format pve-storage-vgname
   */
  export type pvestoragevgname = string;
  /**
   * Tags of the VM. This is only meta information.
   * @format pve-tag-list
   */
  export type pvetaglist = string;
  /**
   * List of Task States that should be returned.
   * @format pve-task-status-type-list
   */
  export type pvetaskstatustypelist = string;
  /**
   * Use Two-factor authentication.
   * @format pve-tfa-config
   * @maxLength 128
   */
  export type pvetfaconfig = string;
  /**
   * List of API tokens.
   * @format pve-tokenid-list
   */
  export type pvetokenidlist = string;
  /**
   * Full User ID, in the `name@realm` format.
   * @format pve-userid
   * @maxLength 64
   */
  export type pveuserid = string;
  /**
   * List of users.
   * @format pve-userid-list
   */
  export type pveuseridlist = string;
  /**
   * Emulated CPU type.
   * @format pve-vm-cpu-conf
   */
  export type pvevmcpuconf = string;
  /**
   * The (unique) ID of the VM.
   * @format pve-vmid
   * @minimum 100
   * @maximum 999999999
   * @type integer
   */
  export type pvevmid = number;
  /**
   * Exclude specified guest systems (assumes --all)
   * @format pve-vmid-list
   */
  export type pvevmidlist = string;
  /**
   * Script that will be executed during various steps in the vms lifetime.
   * @format pve-volume-id
   */
  export type pvevolumeid = string;
  /**
   * The default options for behavior of synchronizations.
   * @format realm-sync-options
   */
  export type realmsyncoptions = string;
  /**
   * Mapping from source to target storages. Providing only a single storage ID maps all source storages to that storage. Providing the special value '1' will map each source storage to itself.
   * @format storage-pair-list
   */
  export type storagepairlist = string;
  /**
   * A list of blacklisted PCI classes, which will not be returned. Following are filtered by default: Memory Controller (05), Bridge (06) and Processor (0b).
   * @format string-list
   */
  export type stringlist = string;
  /**
   * cloud-init: Setup public SSH keys (one key per line, OpenSSH format).
   * @format urlencoded
   */
  export type urlencoded = string;
  /**
   * Returned by GET /access/acl
   */
  export interface accessAclReadAcl {
    /**
     * Access control path
     */
    path: string;
    /**
     * Allow to propagate (inherit) permissions.
     */
    propagate?: boolean;
    roleid: string;
    type: string;
    ugid: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /access/domains
   */
  export interface accessDomainsIndex {
    /**
     * A comment. The GUI use this text when you select a domain (Realm) on the login window.
     */
    comment?: string;
    realm: string;
    /**
     * Two-factor authentication provider.
     */
    tfa?: string;
    type: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /access/groups
   */
  export interface accessGroupsIndex {
    comment?: string;
    groupid: string;
    /**
     * list of users which form this group
     */
    users?: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /access/groups/\{groupid\}
   */
  export interface accessGroupsReadGroup {
    comment?: string;
    members: string[];
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /access
   */
  export interface accessIndex {
    subdir: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /access/openid
   */
  export interface accessOpenidIndex {
    subdir: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by POST /access/openid/login
   */
  export interface accessOpenidLoginLogin {
    CSRFPreventionToken: string;
    cap: any;
    clustername?: string;
    ticket: string;
    username: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /access/roles
   */
  export interface accessRolesIndex {
    privs?: string;
    roleid: string;
    special?: boolean;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /access/roles/\{roleid\}
   */
  export interface accessRolesReadRole {
    'Datastore.Allocate'?: boolean;
    'Datastore.AllocateSpace'?: boolean;
    'Datastore.AllocateTemplate'?: boolean;
    'Datastore.Audit'?: boolean;
    'Group.Allocate'?: boolean;
    'Mapping.Audit'?: boolean;
    'Mapping.Modify'?: boolean;
    'Mapping.Use'?: boolean;
    'Permissions.Modify'?: boolean;
    'Pool.Allocate'?: boolean;
    'Pool.Audit'?: boolean;
    'Realm.Allocate'?: boolean;
    'Realm.AllocateUser'?: boolean;
    'SDN.Allocate'?: boolean;
    'SDN.Audit'?: boolean;
    'SDN.Use'?: boolean;
    'Sys.Audit'?: boolean;
    'Sys.Console'?: boolean;
    'Sys.Incoming'?: boolean;
    'Sys.Modify'?: boolean;
    'Sys.PowerMgmt'?: boolean;
    'Sys.Syslog'?: boolean;
    'User.Modify'?: boolean;
    'VM.Allocate'?: boolean;
    'VM.Audit'?: boolean;
    'VM.Backup'?: boolean;
    'VM.Clone'?: boolean;
    'VM.Config.CDROM'?: boolean;
    'VM.Config.CPU'?: boolean;
    'VM.Config.Cloudinit'?: boolean;
    'VM.Config.Disk'?: boolean;
    'VM.Config.HWType'?: boolean;
    'VM.Config.Memory'?: boolean;
    'VM.Config.Network'?: boolean;
    'VM.Config.Options'?: boolean;
    'VM.Console'?: boolean;
    'VM.Migrate'?: boolean;
    'VM.Monitor'?: boolean;
    'VM.PowerMgmt'?: boolean;
    'VM.Snapshot'?: boolean;
    'VM.Snapshot.Rollback'?: boolean;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by POST /access/tfa/\{userid\}
   */
  export interface accessTfaAddTfaEntry {
    /**
     * When adding u2f entries, this contains a challenge the user must respond to in order to finish the registration.
     */
    challenge?: string;
    /**
     * The id of a newly added TFA entry.
     */
    id: string;
    /**
     * When adding recovery codes, this contains the list of codes to be displayed to the user
     */
    recovery?: string[];
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /access/tfa/\{userid\}/\{id\}
   */
  export interface accessTfaGetTfaEntry {
    /**
     * Creation time of this entry as unix epoch.
     */
    created: number;
    /**
     * User chosen description for this entry.
     */
    description: string;
    /**
     * Whether this TFA entry is currently enabled.
     */
    enable?: boolean;
    /**
     * The id used to reference this entry.
     */
    id: string;
    /**
     * TFA Entry Type.
     */
    type: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /access/tfa
   */
  export interface accessTfaListTfa {
    entries: {
      /**
       * Creation time of this entry as unix epoch.
       */
      created: number;
      /**
       * User chosen description for this entry.
       */
      description: string;
      /**
       * Whether this TFA entry is currently enabled.
       */
      enable?: boolean;
      /**
       * The id used to reference this entry.
       */
      id: string;
      /**
       * TFA Entry Type.
       */
      type: string;
    }[];
    /**
     * Contains a timestamp until when a user is locked out of 2nd factors.
     */
    'tfa-locked-until'?: number;
    /**
     * True if the user is currently locked out of TOTP factors.
     */
    'totp-locked'?: boolean;
    /**
     * User this entry belongs to.
     */
    userid: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /access/tfa/\{userid\}
   */
  export interface accessTfaListUserTfa {
    /**
     * Creation time of this entry as unix epoch.
     */
    created: number;
    /**
     * User chosen description for this entry.
     */
    description: string;
    /**
     * Whether this TFA entry is currently enabled.
     */
    enable?: boolean;
    /**
     * The id used to reference this entry.
     */
    id: string;
    /**
     * TFA Entry Type.
     */
    type: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by POST /access/ticket
   */
  export interface accessTicketCreateTicket {
    CSRFPreventionToken?: string;
    clustername?: string;
    ticket?: string;
    username: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /access/users
   */
  export interface accessUsersIndex {
    comment?: string;
    email?: string;
    /**
     * Enable the account (default). You can set this to '0' to disable the account
     */
    enable?: boolean;
    /**
     * Account expiration date (seconds since epoch). '0' means no expiration date.
     */
    expire?: number;
    firstname?: string;
    groups?: string;
    /**
     * Keys for two factor auth (yubico).
     */
    keys?: string;
    lastname?: string;
    /**
     * The type of the users realm
     */
    'realm-type'?: string;
    /**
     * Contains a timestamp until when a user is locked out of 2nd factors.
     */
    'tfa-locked-until'?: number;
    tokens?: {
      comment?: string;
      /**
       * API token expiration date (seconds since epoch). '0' means no expiration date.
       */
      expire?: number;
      /**
       * Restrict API token privileges with separate ACLs (default), or give full privileges of corresponding user.
       */
      privsep?: boolean;
      /**
       * User-specific token identifier.
       */
      tokenid: string;
    }[];
    /**
     * True if the user is currently locked out of TOTP factors.
     */
    'totp-locked'?: boolean;
    /**
     * Full User ID, in the `name@realm` format.
     */
    userid: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /access/users/\{userid\}
   */
  export interface accessUsersReadUser {
    comment?: string;
    email?: string;
    /**
     * Enable the account (default). You can set this to '0' to disable the account
     */
    enable?: boolean;
    /**
     * Account expiration date (seconds since epoch). '0' means no expiration date.
     */
    expire?: number;
    firstname?: string;
    groups?: string[];
    /**
     * Keys for two factor auth (yubico).
     */
    keys?: string;
    lastname?: string;
    tokens?: {
      comment?: string;
      /**
       * API token expiration date (seconds since epoch). '0' means no expiration date.
       */
      expire?: number;
      /**
       * Restrict API token privileges with separate ACLs (default), or give full privileges of corresponding user.
       */
      privsep?: boolean;
    };
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /access/users/\{userid\}/tfa
   */
  export interface accessUsersTfaReadUserTfaType {
    /**
     * The type of TFA the users realm has set, if any.
     */
    realm?: string;
    /**
     * Array of the user configured TFA types, if any. Only available if 'multiple' was not passed.
     */
    types?: string[];
    /**
     * The type of TFA the user has set, if any. Only set if 'multiple' was not passed.
     */
    user?: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by POST /access/users/\{userid\}/token/\{tokenid\}
   */
  export interface accessUsersTokenGenerateToken {
    /**
     * The full token id.
     */
    'full-tokenid': string;
    info: {
      comment?: string;
      /**
       * API token expiration date (seconds since epoch). '0' means no expiration date.
       */
      expire?: number;
      /**
       * Restrict API token privileges with separate ACLs (default), or give full privileges of corresponding user.
       */
      privsep?: boolean;
    };
    /**
     * API token value used for authentication.
     */
    value: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /access/users/\{userid\}/token/\{tokenid\}
   */
  export interface accessUsersTokenReadToken {
    comment?: string;
    /**
     * API token expiration date (seconds since epoch). '0' means no expiration date.
     */
    expire?: number;
    /**
     * Restrict API token privileges with separate ACLs (default), or give full privileges of corresponding user.
     */
    privsep?: boolean;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /access/users/\{userid\}/token
   */
  export interface accessUsersTokenTokenIndex {
    comment?: string;
    /**
     * API token expiration date (seconds since epoch). '0' means no expiration date.
     */
    expire?: number;
    /**
     * Restrict API token privileges with separate ACLs (default), or give full privileges of corresponding user.
     */
    privsep?: boolean;
    /**
     * User-specific token identifier.
     */
    tokenid: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by PUT /access/users/\{userid\}/token/\{tokenid\}
   */
  export interface accessUsersTokenUpdateTokenInfo {
    comment?: string;
    /**
     * API token expiration date (seconds since epoch). '0' means no expiration date.
     */
    expire?: number;
    /**
     * Restrict API token privileges with separate ACLs (default), or give full privileges of corresponding user.
     */
    privsep?: boolean;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /cluster/acme/account
   */
  export interface clusterAcmeAccountAccountIndex {
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /cluster/acme/account/\{name\}
   */
  export interface clusterAcmeAccountGetAccount {
    account?: any;
    /**
     * URL of ACME CA directory endpoint.
     */
    directory?: string;
    location?: string;
    tos?: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /cluster/acme/challenge-schema
   */
  export interface clusterAcmeChallengeSchemaChallengeschema {
    id: string;
    /**
     * Human readable name, falls back to id
     */
    name: string;
    schema: any;
    type: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /cluster/acme/directories
   */
  export interface clusterAcmeDirectoriesGetDirectories {
    name: string;
    /**
     * URL of ACME CA directory endpoint.
     */
    url: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /cluster/acme
   */
  export interface clusterAcmeIndex {
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /cluster/acme/meta
   */
  export interface clusterAcmeMetaGetMeta {
    /**
     * Hostnames referring to the ACME servers.
     */
    caaIdentities?: string[];
    /**
     * EAB Required
     */
    externalAccountRequired?: boolean;
    /**
     * ACME TermsOfService URL.
     */
    termsOfService?: string;
    /**
     * URL to more information about the ACME server.
     */
    website?: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /cluster/acme/plugins
   */
  export interface clusterAcmePluginsIndex {
    /**
     * Unique identifier for ACME plugin instance.
     */
    plugin: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /cluster/backup/\{id\}/included_volumes
   */
  export interface clusterBackupIncludedVolumesGetVolumeBackupIncluded {
    children: {
      /**
       * The volumes of the guest with the information if they will be included in backups.
       */
      children?: {
        /**
         * Configuration key of the volume.
         */
        id: string;
        /**
         * Whether the volume is included in the backup or not.
         */
        included: boolean;
        /**
         * Name of the volume.
         */
        name: string;
        /**
         * The reason why the volume is included (or excluded).
         */
        reason: string;
      }[];
      /**
       * VMID of the guest.
       */
      id: number;
      /**
       * Name of the guest
       */
      name?: string;
      /**
       * Type of the guest, VM, CT or unknown for removed but not purged guests.
       */
      type: string;
    }[];
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /cluster/backup
   */
  export interface clusterBackupIndex {
    /**
     * The job ID.
     */
    id: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /cluster/backup-info
   */
  export interface clusterBackupInfoIndex {
    /**
     * API sub-directory endpoint
     */
    subdir: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /cluster/backup-info/not-backed-up
   */
  export interface clusterBackupInfoNotBackedUpGetGuestsNotInBackup {
    /**
     * Name of the guest
     */
    name?: string;
    /**
     * Type of the guest.
     */
    type: string;
    /**
     * VMID of the guest.
     */
    vmid: number;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /cluster/ceph
   */
  export interface clusterCephCephindex {
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /cluster/ceph/flags
   */
  export interface clusterCephFlagsGetAllFlags {
    /**
     * Flag description.
     */
    description: string;
    /**
     * Flag name.
     */
    name: string;
    /**
     * Flag value.
     */
    value: boolean;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /cluster/ceph/metadata
   */
  export interface clusterCephMetadataMetadata {
    /**
     * Metadata servers configured in the cluster and their properties.
     */
    mds: {
      /**
       * Useful properties are listed, but not the full list.
       */
      $(id: string): {
        /**
         * Bind addresses and ports.
         */
        addr: string;
        /**
         * Ceph release codename currently used.
         */
        ceph_release: string;
        /**
         * Version info currently used by the service.
         */
        ceph_version: string;
        /**
         * Short version (numerical) info currently used by the service.
         */
        ceph_version_short: string;
        /**
         * Hostname on which the service is running.
         */
        hostname: string;
        /**
         * Memory of the service currently in swap.
         */
        mem_swap_kb: number;
        /**
         * Memory consumption of the service.
         */
        mem_total_kb: number;
        /**
         * Name of the service instance.
         */
        name: string;
      };
    };
    /**
     * Managers configured in the cluster and their properties.
     */
    mgr: {
      /**
       * Useful properties are listed, but not the full list.
       */
      $(id: string): {
        /**
         * Bind address
         */
        addr: string;
        /**
         * Ceph release codename currently used.
         */
        ceph_release: string;
        /**
         * Version info currently used by the service.
         */
        ceph_version: string;
        /**
         * Short version (numerical) info currently used by the service.
         */
        ceph_version_short: string;
        /**
         * Hostname on which the service is running.
         */
        hostname: string;
        /**
         * Memory of the service currently in swap.
         */
        mem_swap_kb: number;
        /**
         * Memory consumption of the service.
         */
        mem_total_kb: number;
        /**
         * Name of the service instance.
         */
        name: string;
      };
    };
    /**
     * Monitors configured in the cluster and their properties.
     */
    mon: {
      /**
       * Useful properties are listed, but not the full list.
       */
      $(id: string): {
        /**
         * Bind addresses and ports.
         */
        addrs: string;
        /**
         * Ceph release codename currently used.
         */
        ceph_release: string;
        /**
         * Version info currently used by the service.
         */
        ceph_version: string;
        /**
         * Short version (numerical) info currently used by the service.
         */
        ceph_version_short: string;
        /**
         * Hostname on which the service is running.
         */
        hostname: string;
        /**
         * Memory of the service currently in swap.
         */
        mem_swap_kb: number;
        /**
         * Memory consumption of the service.
         */
        mem_total_kb: number;
        /**
         * Name of the service instance.
         */
        name: string;
      };
    };
    /**
     * Ceph version installed on the nodes.
     */
    node: {
      $(node: string): {
        /**
         * GIT commit used for the build.
         */
        buildcommit: string;
        /**
         * Version info.
         */
        version: {
          /**
           * major, minor & patch
           */
          parts: string[];
          /**
           * Version as single string.
           */
          str: string;
        };
      };
    };
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /cluster/config
   */
  export interface clusterConfigIndex {
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /cluster/config/join
   */
  export interface clusterConfigJoinJoinInfo {
    config_digest: string;
    nodelist: {
      /**
       * The cluster node name.
       */
      name: string;
      /**
       * Node id for this node.
       */
      nodeid?: number;
      pve_addr: string;
      /**
       * Certificate SHA 256 fingerprint.
       */
      pve_fp: string;
      quorum_votes: number;
      /**
       * Address and priority information of a single corosync link. (up to 8 links supported; link0..link7)
       */
      ring0_addr?: string;
    }[];
    /**
     * The cluster node name.
     */
    preferred_node: string;
    totem: any;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by POST /cluster/config/nodes/\{node\}
   */
  export interface clusterConfigNodesAddnode {
    corosync_authkey: string;
    corosync_conf: string;
    warnings: string[];
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /cluster/config/nodes
   */
  export interface clusterConfigNodesNodes {
    node: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /cluster/firewall/aliases
   */
  export interface clusterFirewallAliasesGetAliases {
    cidr: string;
    comment?: string;
    /**
     * Prevent changes if current configuration file has a different digest. This can be used to prevent concurrent modifications.
     */
    digest: string;
    name: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /cluster/firewall/groups/\{group\}/\{pos\}
   */
  export interface clusterFirewallGroupsGetRule {
    action: string;
    comment?: string;
    dest?: string;
    dport?: string;
    enable?: number;
    'icmp-type'?: string;
    iface?: string;
    ipversion?: number;
    /**
     * Log level for firewall rule
     */
    log?: string;
    macro?: string;
    pos: number;
    proto?: string;
    source?: string;
    sport?: string;
    type: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /cluster/firewall/groups/\{group\}
   */
  export interface clusterFirewallGroupsGetRules {
    pos: number;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /cluster/firewall/groups
   */
  export interface clusterFirewallGroupsListSecurityGroups {
    comment?: string;
    /**
     * Prevent changes if current configuration file has a different digest. This can be used to prevent concurrent modifications.
     */
    digest: string;
    /**
     * Security Group name.
     */
    group: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /cluster/firewall
   */
  export interface clusterFirewallIndex {
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /cluster/firewall/ipset/\{name\}
   */
  export interface clusterFirewallIpsetGetIpset {
    cidr: string;
    comment?: string;
    /**
     * Prevent changes if current configuration file has a different digest. This can be used to prevent concurrent modifications.
     */
    digest: string;
    nomatch?: boolean;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /cluster/firewall/ipset
   */
  export interface clusterFirewallIpsetIpsetIndex {
    comment?: string;
    /**
     * Prevent changes if current configuration file has a different digest. This can be used to prevent concurrent modifications.
     */
    digest: string;
    /**
     * IP set name.
     */
    name: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /cluster/firewall/macros
   */
  export interface clusterFirewallMacrosGetMacros {
    /**
     * More verbose description (if available).
     */
    descr: string;
    /**
     * Macro name.
     */
    macro: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /cluster/firewall/options
   */
  export interface clusterFirewallOptionsGetOptions {
    /**
     * Enable ebtables rules cluster wide.
     */
    ebtables?: boolean;
    /**
     * Enable or disable the firewall cluster wide.
     */
    enable?: number;
    /**
     * Log ratelimiting settings
     */
    log_ratelimit?: string;
    /**
     * Input policy.
     */
    policy_in?: string;
    /**
     * Output policy.
     */
    policy_out?: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /cluster/firewall/refs
   */
  export interface clusterFirewallRefsRefs {
    comment?: string;
    name: string;
    ref: string;
    scope: string;
    type: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /cluster/firewall/rules/\{pos\}
   */
  export interface clusterFirewallRulesGetRule {
    action: string;
    comment?: string;
    dest?: string;
    dport?: string;
    enable?: number;
    'icmp-type'?: string;
    iface?: string;
    ipversion?: number;
    /**
     * Log level for firewall rule
     */
    log?: string;
    macro?: string;
    pos: number;
    proto?: string;
    source?: string;
    sport?: string;
    type: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /cluster/firewall/rules
   */
  export interface clusterFirewallRulesGetRules {
    pos: number;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /cluster/ha/groups
   */
  export interface clusterHaGroupsIndex {
    group: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /cluster/ha
   */
  export interface clusterHaIndex {
    id: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /cluster/ha/resources
   */
  export interface clusterHaResourcesIndex {
    sid: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /cluster/ha/resources/\{sid\}
   */
  export interface clusterHaResourcesRead {
    /**
     * Description.
     */
    comment?: string;
    /**
     * Can be used to prevent concurrent modifications.
     */
    digest: string;
    /**
     * The HA group identifier.
     */
    group?: string;
    /**
     * Maximal number of service relocate tries when a service failes to start.
     */
    max_relocate?: number;
    /**
     * Maximal number of tries to restart the service on a node after its start failed.
     */
    max_restart?: number;
    /**
     * HA resource ID. This consists of a resource type followed by a resource specific name, separated with colon (example: vm:100 / ct:100). For virtual machines and containers, you can simply use the VM or CT id as a shortcut (example: 100).
     */
    sid: string;
    /**
     * Requested resource state.
     */
    state?: string;
    /**
     * The type of the resources.
     */
    type: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /cluster/ha/status/current
   */
  export interface clusterHaStatusCurrentStatus {
    /**
     * For type 'service'. Service state as seen by the CRM.
     */
    crm_state?: string;
    /**
     * Status entry ID (quorum, master, lrm:<node>, service:<sid>).
     */
    id: string;
    /**
     * For type 'service'.
     */
    max_relocate?: number;
    /**
     * For type 'service'.
     */
    max_restart?: number;
    /**
     * Node associated to status entry.
     */
    node: string;
    /**
     * For type 'quorum'. Whether the cluster is quorate or not.
     */
    quorate?: boolean;
    /**
     * For type 'service'. Requested service state.
     */
    request_state?: string;
    /**
     * For type 'service'. Service ID.
     */
    sid?: string;
    /**
     * For type 'service'. Verbose service state.
     */
    state?: string;
    /**
     * Status of the entry (value depends on type).
     */
    status: string;
    /**
     * For type 'lrm','master'. Timestamp of the status information.
     */
    timestamp?: number;
    /**
     * Type of status entry.
     */
    type: any;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /cluster/ha/status
   */
  export interface clusterHaStatusIndex {
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /cluster
   */
  export interface clusterIndex {
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /cluster/jobs
   */
  export interface clusterJobsIndex {
    /**
     * API sub-directory endpoint
     */
    subdir: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /cluster/jobs/realm-sync
   */
  export interface clusterJobsRealmSyncSyncjobIndex {
    /**
     * A comment for the job.
     */
    comment?: string;
    /**
     * If the job is enabled or not.
     */
    enabled: boolean;
    /**
     * The ID of the entry.
     */
    id: string;
    /**
     * Last execution time of the job in seconds since the beginning of the UNIX epoch
     */
    'last-run'?: number;
    /**
     * Next planned execution time of the job in seconds since the beginning of the UNIX epoch.
     */
    'next-run'?: number;
    /**
     * Authentication domain ID
     */
    realm: string;
    /**
     * A semicolon-seperated list of things to remove when they or the user vanishes during a sync. The following values are possible: 'entry' removes the user/group when not returned from the sync. 'properties' removes the set properties on existing user/group that do not appear in the source (even custom ones). 'acl' removes acls when the user/group is not returned from the sync. Instead of a list it also can be 'none' (the default).
     */
    'remove-vanished'?: string;
    /**
     * The configured sync schedule.
     */
    schedule: string;
    /**
     * Select what to sync.
     */
    scope?: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /cluster/jobs/schedule-analyze
   */
  export interface clusterJobsScheduleAnalyzeScheduleAnalyze {
    /**
     * UNIX timestamp for the run.
     */
    timestamp: number;
    /**
     * UTC timestamp for the run.
     */
    utc: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /cluster/log
   */
  export interface clusterLogLog {
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /cluster/mapping/pci
   */
  export interface clusterMappingPciIndex {
    /**
     * A list of checks, only present if 'check_node' is set.
     */
    checks?: {
      /**
       * The message of the error
       */
      message: string;
      /**
       * The severity of the error
       */
      severity: string;
    }[];
    /**
     * A description of the logical mapping.
     */
    description: string;
    /**
     * The logical ID of the mapping.
     */
    id: string;
    /**
     * The entries of the mapping.
     */
    map: string[];
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /cluster/mapping/usb
   */
  export interface clusterMappingUsbIndex {
    /**
     * A description of the logical mapping.
     */
    description: string;
    /**
     * A list of errors when 'check_node' is given.
     */
    error: any;
    /**
     * The logical ID of the mapping.
     */
    id: string;
    /**
     * The entries of the mapping.
     */
    map: string[];
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /cluster/metrics
   */
  export interface clusterMetricsIndex {
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /cluster/metrics/server
   */
  export interface clusterMetricsServerServerIndex {
    /**
     * Flag to disable the plugin.
     */
    disable: boolean;
    /**
     * The ID of the entry.
     */
    id: string;
    /**
     * Server network port
     */
    port: number;
    /**
     * Server dns name or IP address
     */
    server: string;
    /**
     * Plugin type.
     */
    type: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /cluster/notifications/endpoints
   */
  export interface clusterNotificationsEndpointsEndpointsIndex {
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /cluster/notifications/endpoints/gotify/\{name\}
   */
  export interface clusterNotificationsEndpointsGotifyGetGotifyEndpoint {
    /**
     * Comment
     */
    comment?: string;
    /**
     * Prevent changes if current configuration file has a different digest. This can be used to prevent concurrent modifications.
     */
    digest?: string;
    /**
     * Disable this target
     */
    disable?: boolean;
    /**
     * The name of the endpoint.
     */
    name: string;
    /**
     * Server URL
     */
    server: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /cluster/notifications/endpoints/gotify
   */
  export interface clusterNotificationsEndpointsGotifyGetGotifyEndpoints {
    /**
     * Comment
     */
    comment?: string;
    /**
     * Disable this target
     */
    disable?: boolean;
    /**
     * The name of the endpoint.
     */
    name: string;
    /**
     * Show if this entry was created by a user or was built-in
     */
    origin: string;
    /**
     * Server URL
     */
    server: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /cluster/notifications/endpoints/sendmail/\{name\}
   */
  export interface clusterNotificationsEndpointsSendmailGetSendmailEndpoint {
    /**
     * Author of the mail
     */
    author?: string;
    /**
     * Comment
     */
    comment?: string;
    /**
     * Prevent changes if current configuration file has a different digest. This can be used to prevent concurrent modifications.
     */
    digest?: string;
    /**
     * Disable this target
     */
    disable?: boolean;
    /**
     * `From` address for the mail
     */
    'from-address'?: string;
    /**
     * List of email recipients
     */
    mailto?: string[];
    /**
     * List of users
     */
    'mailto-user'?: string[];
    /**
     * The name of the endpoint.
     */
    name: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /cluster/notifications/endpoints/sendmail
   */
  export interface clusterNotificationsEndpointsSendmailGetSendmailEndpoints {
    /**
     * Author of the mail
     */
    author?: string;
    /**
     * Comment
     */
    comment?: string;
    /**
     * Disable this target
     */
    disable?: boolean;
    /**
     * `From` address for the mail
     */
    'from-address'?: string;
    /**
     * List of email recipients
     */
    mailto?: string[];
    /**
     * List of users
     */
    'mailto-user'?: string[];
    /**
     * The name of the endpoint.
     */
    name: string;
    /**
     * Show if this entry was created by a user or was built-in
     */
    origin: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /cluster/notifications/endpoints/smtp/\{name\}
   */
  export interface clusterNotificationsEndpointsSmtpGetSmtpEndpoint {
    /**
     * Author of the mail. Defaults to 'Proxmox VE'.
     */
    author?: string;
    /**
     * Comment
     */
    comment?: string;
    /**
     * Prevent changes if current configuration file has a different digest. This can be used to prevent concurrent modifications.
     */
    digest?: string;
    /**
     * Disable this target
     */
    disable?: boolean;
    /**
     * `From` address for the mail
     */
    'from-address': string;
    /**
     * List of email recipients
     */
    mailto?: string[];
    /**
     * List of users
     */
    'mailto-user'?: string[];
    /**
     * Determine which encryption method shall be used for the connection.
     */
    mode?: string;
    /**
     * The name of the endpoint.
     */
    name: string;
    /**
     * The port to be used. Defaults to 465 for TLS based connections, 587 for STARTTLS based connections and port 25 for insecure plain-text connections.
     */
    port?: number;
    /**
     * The address of the SMTP server.
     */
    server: string;
    /**
     * Username for SMTP authentication
     */
    username?: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /cluster/notifications/endpoints/smtp
   */
  export interface clusterNotificationsEndpointsSmtpGetSmtpEndpoints {
    /**
     * Author of the mail. Defaults to 'Proxmox VE'.
     */
    author?: string;
    /**
     * Comment
     */
    comment?: string;
    /**
     * Disable this target
     */
    disable?: boolean;
    /**
     * `From` address for the mail
     */
    'from-address': string;
    /**
     * List of email recipients
     */
    mailto?: string[];
    /**
     * List of users
     */
    'mailto-user'?: string[];
    /**
     * Determine which encryption method shall be used for the connection.
     */
    mode?: string;
    /**
     * The name of the endpoint.
     */
    name: string;
    /**
     * Show if this entry was created by a user or was built-in
     */
    origin: string;
    /**
     * The port to be used. Defaults to 465 for TLS based connections, 587 for STARTTLS based connections and port 25 for insecure plain-text connections.
     */
    port?: number;
    /**
     * The address of the SMTP server.
     */
    server: string;
    /**
     * Username for SMTP authentication
     */
    username?: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /cluster/notifications
   */
  export interface clusterNotificationsIndex {
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /cluster/notifications/matchers/\{name\}
   */
  export interface clusterNotificationsMatchersGetMatcher {
    /**
     * Comment
     */
    comment?: string;
    /**
     * Prevent changes if current configuration file has a different digest. This can be used to prevent concurrent modifications.
     */
    digest?: string;
    /**
     * Disable this matcher
     */
    disable?: boolean;
    /**
     * Invert match of the whole matcher
     */
    'invert-match'?: boolean;
    /**
     * Match notification timestamp
     */
    'match-calendar'?: string[];
    /**
     * Metadata fields to match (regex or exact match). Must be in the form (regex|exact):<field>=<value>
     */
    'match-field'?: string[];
    /**
     * Notification severities to match
     */
    'match-severity'?: string[];
    /**
     * Choose between 'all' and 'any' for when multiple properties are specified
     */
    mode?: string;
    /**
     * Name of the matcher.
     */
    name: string;
    /**
     * Targets to notify on match
     */
    target?: string[];
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /cluster/notifications/matchers
   */
  export interface clusterNotificationsMatchersGetMatchers {
    /**
     * Comment
     */
    comment?: string;
    /**
     * Disable this matcher
     */
    disable?: boolean;
    /**
     * Invert match of the whole matcher
     */
    'invert-match'?: boolean;
    /**
     * Match notification timestamp
     */
    'match-calendar'?: string[];
    /**
     * Metadata fields to match (regex or exact match). Must be in the form (regex|exact):<field>=<value>
     */
    'match-field'?: string[];
    /**
     * Notification severities to match
     */
    'match-severity'?: string[];
    /**
     * Choose between 'all' and 'any' for when multiple properties are specified
     */
    mode?: string;
    /**
     * Name of the matcher.
     */
    name: string;
    /**
     * Show if this entry was created by a user or was built-in
     */
    origin: string;
    /**
     * Targets to notify on match
     */
    target?: string[];
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /cluster/notifications/targets
   */
  export interface clusterNotificationsTargetsGetAllTargets {
    /**
     * Comment
     */
    comment?: string;
    /**
     * Show if this target is disabled
     */
    disable?: boolean;
    /**
     * Name of the target.
     */
    name: string;
    /**
     * Show if this entry was created by a user or was built-in
     */
    origin: string;
    /**
     * Type of the target.
     */
    type: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /cluster/replication
   */
  export interface clusterReplicationIndex {
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /cluster/resources
   */
  export interface clusterResourcesResources {
    /**
     * The cgroup mode the node operates under (when type == node).
     */
    'cgroup-mode'?: number;
    /**
     * Allowed storage content types (when type == storage).
     */
    content?: string;
    /**
     * CPU utilization (when type in node,qemu,lxc).
     */
    cpu?: number;
    /**
     * Used disk space in bytes (when type in storage), used root image spave for VMs (type in qemu,lxc).
     */
    disk?: number;
    /**
     * HA service status (for HA managed VMs).
     */
    hastate?: string;
    /**
     * Resource id.
     */
    id: string;
    /**
     * Support level (when type == node).
     */
    level?: string;
    /**
     * Number of available CPUs (when type in node,qemu,lxc).
     */
    maxcpu?: number;
    /**
     * Storage size in bytes (when type in storage), root image size for VMs (type in qemu,lxc).
     */
    maxdisk?: number;
    /**
     * Number of available memory in bytes (when type in node,qemu,lxc).
     */
    maxmem?: number;
    /**
     * Used memory in bytes (when type in node,qemu,lxc).
     */
    mem?: number;
    /**
     * Name of the resource.
     */
    name?: string;
    /**
     * The cluster node name (when type in node,storage,qemu,lxc).
     */
    node?: string;
    /**
     * More specific type, if available.
     */
    plugintype?: string;
    /**
     * The pool name (when type in pool,qemu,lxc).
     */
    pool?: string;
    /**
     * Resource type dependent status.
     */
    status?: string;
    /**
     * The storage identifier (when type == storage).
     */
    storage?: string;
    /**
     * Resource type.
     */
    type: string;
    /**
     * Node uptime in seconds (when type in node,qemu,lxc).
     */
    uptime?: number;
    /**
     * The numerical vmid (when type in qemu,lxc).
     */
    vmid?: number;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /cluster/sdn/controllers
   */
  export interface clusterSdnControllersIndex {
    controller: string;
    pending?: boolean;
    state?: string;
    type: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /cluster/sdn/dns
   */
  export interface clusterSdnDnsIndex {
    dns: string;
    type: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /cluster/sdn
   */
  export interface clusterSdnIndex {
    id: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /cluster/sdn/ipams
   */
  export interface clusterSdnIpamsIndex {
    ipam: string;
    type: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /cluster/sdn/vnets
   */
  export interface clusterSdnVnetsIndex {
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /cluster/sdn/vnets/\{vnet\}/subnets
   */
  export interface clusterSdnVnetsSubnetsIndex {
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /cluster/sdn/zones
   */
  export interface clusterSdnZonesIndex {
    dhcp?: string;
    dns?: string;
    dnszone?: string;
    ipam?: string;
    mtu?: number;
    nodes?: string;
    pending?: boolean;
    reversedns?: string;
    state?: string;
    type: string;
    zone: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /cluster/status
   */
  export interface clusterStatusGetStatus {
    id: string;
    /**
     * [node] IP of the resolved nodename.
     */
    ip?: string;
    /**
     * [node] Proxmox VE Subscription level, indicates if eligible for enterprise support as well as access to the stable Proxmox VE Enterprise Repository.
     */
    level?: string;
    /**
     * [node] Indicates if this is the responding node.
     */
    local?: boolean;
    name: string;
    /**
     * [node] ID of the node from the corosync configuration.
     */
    nodeid?: number;
    /**
     * [cluster] Nodes count, including offline nodes.
     */
    nodes?: number;
    /**
     * [node] Indicates if the node is online or offline.
     */
    online?: boolean;
    /**
     * [cluster] Indicates if there is a majority of nodes online to make decisions
     */
    quorate?: boolean;
    /**
     * Indicates the type, either cluster or node. The type defines the object properties e.g. quorate available for type cluster.
     */
    type: string;
    /**
     * [cluster] Current version of the corosync configuration file.
     */
    version?: number;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /cluster/tasks
   */
  export interface clusterTasksTasks {
    upid: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/aplinfo
   */
  export interface nodesAplinfoAplinfo {
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/apt
   */
  export interface nodesAptIndex {
    id: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/apt/repositories
   */
  export interface nodesAptRepositoriesRepositories {
    /**
     * Common digest of all files.
     */
    digest: string;
    /**
     * List of problematic repository files.
     */
    errors: {
      /**
       * The error message
       */
      error: string;
      /**
       * Path to the problematic file.
       */
      path: string;
    }[];
    /**
     * List of parsed repository files.
     */
    files: {
      /**
       * Digest of the file as bytes.
       */
      digest: any[];
      /**
       * Format of the file.
       */
      'file-type': string;
      /**
       * Path to the problematic file.
       */
      path: string;
      /**
       * The parsed repositories.
       */
      repositories: {
        /**
         * Associated comment
         */
        Comment?: string;
        /**
         * List of repository components
         */
        Components?: string[];
        /**
         * Whether the repository is enabled or not
         */
        Enabled: boolean;
        /**
         * Format of the defining file.
         */
        FileType: string;
        /**
         * Additional options
         */
        Options?: {
          Key: string;
          Values: string[];
        }[];
        /**
         * List of package distribuitions
         */
        Suites: string[];
        /**
         * List of package types.
         */
        Types: string[];
        /**
         * List of repository URIs.
         */
        URIs: string[];
      }[];
    }[];
    /**
     * Additional information/warnings for APT repositories.
     */
    infos: {
      /**
       * Index of the associated repository within the file.
       */
      index: string;
      /**
       * Kind of the information (e.g. warning).
       */
      kind: string;
      /**
       * Information message.
       */
      message: string;
      /**
       * Path to the associated file.
       */
      path: string;
      /**
       * Property from which the info originates.
       */
      property?: string;
    }[];
    /**
     * List of standard repositories and their configuration status
     */
    'standard-repos': {
      /**
       * Handle to identify the repository.
       */
      handle: string;
      /**
       * Full name of the repository.
       */
      name: string;
      /**
       * Indicating enabled/disabled status, if the repository is configured.
       */
      status?: boolean;
    }[];
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/apt/update
   */
  export interface nodesAptUpdateListUpdates {
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/apt/versions
   */
  export interface nodesAptVersionsVersions {
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/capabilities
   */
  export interface nodesCapabilitiesIndex {
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/capabilities/qemu/cpu
   */
  export interface nodesCapabilitiesQemuCpuIndex {
    /**
     * True if this is a custom CPU model.
     */
    custom: boolean;
    /**
     * Name of the CPU model. Identifies it for subsequent API calls. Prefixed with 'custom-' for custom models.
     */
    name: string;
    /**
     * CPU vendor visible to the guest when this model is selected. Vendor of 'reported-model' in case of custom models.
     */
    vendor: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/capabilities/qemu/machines
   */
  export interface nodesCapabilitiesQemuMachinesTypes {
    /**
     * Full name of machine type and version.
     */
    id: string;
    /**
     * The machine type.
     */
    type: string;
    /**
     * The machine version.
     */
    version: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/capabilities/qemu
   */
  export interface nodesCapabilitiesQemuQemuCapsIndex {
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/ceph/cfg/db
   */
  export interface nodesCephCfgDbDb {
    can_update_at_runtime: boolean;
    level: string;
    mask: string;
    name: string;
    section: string;
    value: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/ceph/cfg
   */
  export interface nodesCephCfgIndex {
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/ceph/cmd-safety
   */
  export interface nodesCephCmdSafetyCmdSafety {
    /**
     * If it is safe to run the command.
     */
    safe: boolean;
    /**
     * Status message given by Ceph.
     */
    status?: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/ceph/fs
   */
  export interface nodesCephFsIndex {
    /**
     * The name of the data pool.
     */
    data_pool: string;
    /**
     * The name of the metadata pool.
     */
    metadata_pool: string;
    /**
     * The ceph filesystem name.
     */
    name: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/ceph
   */
  export interface nodesCephIndex {
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/ceph/log
   */
  export interface nodesCephLogLog {
    /**
     * Line number
     */
    n: number;
    /**
     * Line text
     */
    t: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/ceph/mds
   */
  export interface nodesCephMdsIndex {
    addr?: string;
    host?: string;
    /**
     * The name (ID) for the MDS
     */
    name: string;
    rank?: number;
    /**
     * If true, the standby MDS is polling the active MDS for faster recovery (hot standby).
     */
    standby_replay?: boolean;
    /**
     * State of the MDS
     */
    state: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/ceph/mgr
   */
  export interface nodesCephMgrIndex {
    addr?: string;
    host?: string;
    /**
     * The name (ID) for the MGR
     */
    name: string;
    /**
     * State of the MGR
     */
    state: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/ceph/mon
   */
  export interface nodesCephMonListmon {
    addr?: string;
    ceph_version?: string;
    ceph_version_short?: string;
    direxists?: string;
    host?: boolean;
    name: string;
    quorum?: boolean;
    rank?: number;
    service?: number;
    state?: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/ceph/osd/\{osdid\}/lv-info
   */
  export interface nodesCephOsdLvInfoOsdvolume {
    /**
     * Creation time as reported by `lvs`.
     */
    creation_time: string;
    /**
     * Name of the logical volume (LV).
     */
    lv_name: string;
    /**
     * Path to the logical volume (LV).
     */
    lv_path: string;
    /**
     * Size of the logical volume (LV).
     */
    lv_size: number;
    /**
     * UUID of the logical volume (LV).
     */
    lv_uuid: string;
    /**
     * Name of the volume group (VG).
     */
    vg_name: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/ceph/osd/\{osdid\}/metadata
   */
  export interface nodesCephOsdMetadataOsddetails {
    /**
     * Array containing data about devices
     */
    devices: {
      /**
       * Device node
       */
      dev_node: string;
      /**
       * Kind of OSD device
       */
      device: string;
      /**
       * Physical disks used
       */
      devices: string;
      /**
       * Size in bytes
       */
      size: number;
      /**
       * Discard support of the physical device
       */
      support_discard: boolean;
      /**
       * Type of device. For example, hdd or ssd
       */
      type: string;
    }[];
    /**
     * General information about the OSD
     */
    osd: {
      /**
       * Address and port used to talk to other OSDs.
       */
      back_addr: string;
      /**
       * Address and port used to talk to clients and monitors.
       */
      front_addr: string;
      /**
       * Heartbeat address and port for other OSDs.
       */
      hb_back_addr: string;
      /**
       * Heartbeat address and port for clients and monitors.
       */
      hb_front_addr: string;
      /**
       * Name of the host containing the OSD.
       */
      hostname: string;
      /**
       * ID of the OSD.
       */
      id: number;
      /**
       * Memory usage of the OSD service.
       */
      mem_usage: number;
      /**
       * Path to the OSD's data directory.
       */
      osd_data: string;
      /**
       * The type of object store used.
       */
      osd_objectstore: string;
      /**
       * OSD process ID.
       */
      pid: number;
      /**
       * Ceph version of the OSD service.
       */
      version: string;
    };
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/ceph/osd/\{osdid\}
   */
  export interface nodesCephOsdOsdindex {
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/ceph/pool
   */
  export interface nodesCephPoolLspools {
    application_metadata?: any;
    autoscale_status?: any;
    bytes_used: number;
    crush_rule: number;
    crush_rule_name: string;
    min_size: number;
    percent_used: number;
    pg_autoscale_mode?: string;
    pg_num: number;
    pg_num_final?: number;
    pg_num_min?: number;
    pool: number;
    pool_name: string;
    size: number;
    target_size?: number;
    target_size_ratio?: number;
    type: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/ceph/pool/\{name\}
   */
  export interface nodesCephPoolPoolindex {
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/ceph/pool/\{name\}/status
   */
  export interface nodesCephPoolStatusGetpool {
    /**
     * The application of the pool.
     */
    application?: string;
    application_list?: string[];
    autoscale_status?: any;
    /**
     * The rule to use for mapping object placement in the cluster.
     */
    crush_rule?: string;
    fast_read: boolean;
    hashpspool: boolean;
    id: number;
    /**
     * Minimum number of replicas per object
     */
    min_size?: number;
    /**
     * The name of the pool. It must be unique.
     */
    name: string;
    'nodeep-scrub': boolean;
    nodelete: boolean;
    nopgchange: boolean;
    noscrub: boolean;
    nosizechange: boolean;
    /**
     * The automatic PG scaling mode of the pool.
     */
    pg_autoscale_mode?: string;
    /**
     * Number of placement groups.
     */
    pg_num?: number;
    /**
     * Minimal number of placement groups.
     */
    pg_num_min?: number;
    pgp_num: number;
    /**
     * Number of replicas per object
     */
    size?: number;
    statistics?: any;
    /**
     * The estimated target size of the pool for the PG autoscaler.
     */
    target_size?: string;
    /**
     * The estimated target ratio of the pool for the PG autoscaler.
     */
    target_size_ratio?: number;
    use_gmt_hitset: boolean;
    write_fadvise_dontneed: boolean;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/ceph/rules
   */
  export interface nodesCephRulesRules {
    /**
     * Name of the CRUSH rule.
     */
    name: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/certificates/acme
   */
  export interface nodesCertificatesAcmeIndex {
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by POST /nodes/\{node\}/certificates/custom
   */
  export interface nodesCertificatesCustomUploadCustomCert {
    filename?: string;
    /**
     * Certificate SHA 256 fingerprint.
     */
    fingerprint?: string;
    /**
     * Certificate issuer name.
     */
    issuer?: string;
    /**
     * Certificate's notAfter timestamp (UNIX epoch).
     */
    notafter?: number;
    /**
     * Certificate's notBefore timestamp (UNIX epoch).
     */
    notbefore?: number;
    /**
     * Certificate in PEM format
     */
    pem?: string;
    /**
     * Certificate's public key size
     */
    'public-key-bits'?: number;
    /**
     * Certificate's public key algorithm
     */
    'public-key-type'?: string;
    /**
     * List of Certificate's SubjectAlternativeName entries.
     */
    san?: string[];
    /**
     * Certificate subject name.
     */
    subject?: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/certificates
   */
  export interface nodesCertificatesIndex {
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/certificates/info
   */
  export interface nodesCertificatesInfoInfo {
    filename?: string;
    /**
     * Certificate SHA 256 fingerprint.
     */
    fingerprint?: string;
    /**
     * Certificate issuer name.
     */
    issuer?: string;
    /**
     * Certificate's notAfter timestamp (UNIX epoch).
     */
    notafter?: number;
    /**
     * Certificate's notBefore timestamp (UNIX epoch).
     */
    notbefore?: number;
    /**
     * Certificate in PEM format
     */
    pem?: string;
    /**
     * Certificate's public key size
     */
    'public-key-bits'?: number;
    /**
     * Certificate's public key algorithm
     */
    'public-key-type'?: string;
    /**
     * List of Certificate's SubjectAlternativeName entries.
     */
    san?: string[];
    /**
     * Certificate subject name.
     */
    subject?: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/config
   */
  export interface nodesConfigGetConfig {
    /**
     * Node specific ACME settings.
     */
    acme?: string;
    /**
     * ACME domain and validation plugin
     */
    acmedomain0?: string;
    /**
     * ACME domain and validation plugin
     */
    acmedomain1?: string;
    /**
     * ACME domain and validation plugin
     */
    acmedomain2?: string;
    /**
     * ACME domain and validation plugin
     */
    acmedomain3?: string;
    /**
     * Description for the Node. Shown in the web-interface node notes panel. This is saved as comment inside the configuration file.
     */
    description?: string;
    /**
     * Prevent changes if current configuration file has different SHA1 digest. This can be used to prevent concurrent modifications.
     */
    digest?: string;
    /**
     * Initial delay in seconds, before starting all the Virtual Guests with on-boot enabled.
     */
    'startall-onboot-delay'?: number;
    /**
     * MAC address for wake on LAN
     */
    wakeonlan?: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/disks/directory
   */
  export interface nodesDisksDirectoryIndex {
    /**
     * The mounted device.
     */
    device: string;
    /**
     * The mount options.
     */
    options: string;
    /**
     * The mount path.
     */
    path: string;
    /**
     * The filesystem type.
     */
    type: string;
    /**
     * The path of the mount unit.
     */
    unitfile: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/disks
   */
  export interface nodesDisksIndex {
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/disks/list
   */
  export interface nodesDisksListList {
    /**
     * The device path
     */
    devpath: string;
    gpt: boolean;
    health?: string;
    model?: string;
    mounted: boolean;
    osdid: number;
    'osdid-list': any[];
    /**
     * For partitions only. The device path of the disk the partition resides on.
     */
    parent?: string;
    serial?: string;
    size: number;
    used?: string;
    vendor?: string;
    wwn?: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/disks/lvm
   */
  export interface nodesDisksLvmIndex {
    children: {
      /**
       * The underlying physical volumes
       */
      children?: {
        /**
         * The free bytes in the physical volume
         */
        free: number;
        leaf: boolean;
        /**
         * The name of the physical volume
         */
        name: string;
        /**
         * The size of the physical volume in bytes
         */
        size: number;
      }[];
      /**
       * The free bytes in the volume group
       */
      free: number;
      leaf: boolean;
      /**
       * The name of the volume group
       */
      name: string;
      /**
       * The size of the volume group in bytes
       */
      size: number;
    }[];
    leaf: boolean;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/disks/lvmthin
   */
  export interface nodesDisksLvmthinIndex {
    /**
     * The name of the thinpool.
     */
    lv: string;
    /**
     * The size of the thinpool in bytes.
     */
    lv_size: number;
    /**
     * The size of the metadata lv in bytes.
     */
    metadata_size: number;
    /**
     * The used bytes of the metadata lv.
     */
    metadata_used: number;
    /**
     * The used bytes of the thinpool.
     */
    used: number;
    /**
     * The associated volume group.
     */
    vg: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/disks/smart
   */
  export interface nodesDisksSmartSmart {
    attributes?: string[];
    health: string;
    text?: string;
    type?: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/disks/zfs/\{name\}
   */
  export interface nodesDisksZfsDetail {
    /**
     * Information about the recommended action to fix the state.
     */
    action?: string;
    /**
     * The pool configuration information, including the vdevs for each section (e.g. spares, cache), may be nested.
     */
    children: {
      cksum?: number;
      /**
       * An optional message about the vdev.
       */
      msg: string;
      /**
       * The name of the vdev or section.
       */
      name: string;
      read?: number;
      /**
       * The state of the vdev.
       */
      state?: string;
      write?: number;
    }[];
    /**
     * Information about the errors on the zpool.
     */
    errors: string;
    /**
     * The name of the zpool.
     */
    name: string;
    /**
     * Information about the last/current scrub.
     */
    scan?: string;
    /**
     * The state of the zpool.
     */
    state: string;
    /**
     * Information about the state of the zpool.
     */
    status?: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/disks/zfs
   */
  export interface nodesDisksZfsIndex {
    alloc: number;
    dedup: number;
    frag: number;
    free: number;
    health: string;
    name: string;
    size: number;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/dns
   */
  export interface nodesDnsDns {
    /**
     * First name server IP address.
     */
    dns1?: string;
    /**
     * Second name server IP address.
     */
    dns2?: string;
    /**
     * Third name server IP address.
     */
    dns3?: string;
    /**
     * Search domain for host-name lookup.
     */
    search?: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by POST /nodes/\{node\}/execute
   */
  export interface nodesExecuteExecute {
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/firewall
   */
  export interface nodesFirewallIndex {
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/firewall/log
   */
  export interface nodesFirewallLogLog {
    /**
     * Line number
     */
    n: number;
    /**
     * Line text
     */
    t: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/firewall/options
   */
  export interface nodesFirewallOptionsGetOptions {
    /**
     * Enable host firewall rules.
     */
    enable?: boolean;
    /**
     * Log level for incoming traffic.
     */
    log_level_in?: string;
    /**
     * Log level for outgoing traffic.
     */
    log_level_out?: string;
    /**
     * Enable logging of conntrack information.
     */
    log_nf_conntrack?: boolean;
    /**
     * Enable NDP (Neighbor Discovery Protocol).
     */
    ndp?: boolean;
    /**
     * Allow invalid packets on connection tracking.
     */
    nf_conntrack_allow_invalid?: boolean;
    /**
     * Enable conntrack helpers for specific protocols. Supported protocols: amanda, ftp, irc, netbios-ns, pptp, sane, sip, snmp, tftp
     */
    nf_conntrack_helpers?: string;
    /**
     * Maximum number of tracked connections.
     */
    nf_conntrack_max?: number;
    /**
     * Conntrack established timeout.
     */
    nf_conntrack_tcp_timeout_established?: number;
    /**
     * Conntrack syn recv timeout.
     */
    nf_conntrack_tcp_timeout_syn_recv?: number;
    /**
     * Enable SMURFS filter.
     */
    nosmurfs?: boolean;
    /**
     * Enable synflood protection
     */
    protection_synflood?: boolean;
    /**
     * Synflood protection rate burst by ip src.
     */
    protection_synflood_burst?: number;
    /**
     * Synflood protection rate syn/sec by ip src.
     */
    protection_synflood_rate?: number;
    /**
     * Log level for SMURFS filter.
     */
    smurf_log_level?: string;
    /**
     * Log level for illegal tcp flags filter.
     */
    tcp_flags_log_level?: string;
    /**
     * Filter illegal combinations of TCP flags.
     */
    tcpflags?: boolean;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/firewall/rules/\{pos\}
   */
  export interface nodesFirewallRulesGetRule {
    action: string;
    comment?: string;
    dest?: string;
    dport?: string;
    enable?: number;
    'icmp-type'?: string;
    iface?: string;
    ipversion?: number;
    /**
     * Log level for firewall rule
     */
    log?: string;
    macro?: string;
    pos: number;
    proto?: string;
    source?: string;
    sport?: string;
    type: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/firewall/rules
   */
  export interface nodesFirewallRulesGetRules {
    pos: number;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/hardware
   */
  export interface nodesHardwareIndex {
    type: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/hardware/pci/\{pciid\}/mdev
   */
  export interface nodesHardwarePciMdevMdevscan {
    /**
     * The number of still available instances of this type.
     */
    available: number;
    description: string;
    /**
     * The name of the mdev type.
     */
    type: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/hardware/pci/\{pciid\}
   */
  export interface nodesHardwarePciPciindex {
    method: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/hardware/pci
   */
  export interface nodesHardwarePciPciscan {
    /**
     * The PCI Class of the device.
     */
    class: string;
    /**
     * The Device ID.
     */
    device: string;
    device_name?: string;
    /**
     * The PCI ID.
     */
    id: string;
    /**
     * The IOMMU group in which the device is in. If no IOMMU group is detected, it is set to -1.
     */
    iommugroup: number;
    /**
     * If set, marks that the device is capable of creating mediated devices.
     */
    mdev?: boolean;
    /**
     * The Subsystem Device ID.
     */
    subsystem_device?: string;
    subsystem_device_name?: string;
    /**
     * The Subsystem Vendor ID.
     */
    subsystem_vendor?: string;
    subsystem_vendor_name?: string;
    /**
     * The Vendor ID.
     */
    vendor: string;
    vendor_name?: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/hardware/usb
   */
  export interface nodesHardwareUsbUsbscan {
    busnum: number;
    class: number;
    devnum: number;
    level: number;
    manufacturer?: string;
    port: number;
    prodid: string;
    product?: string;
    serial?: string;
    speed: string;
    usbpath?: string;
    vendid: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/hosts
   */
  export interface nodesHostsGetEtcHosts {
    /**
     * The content of /etc/hosts.
     */
    data: string;
    /**
     * Prevent changes if current configuration file has a different digest. This can be used to prevent concurrent modifications.
     */
    digest?: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes
   */
  export interface nodesIndex {
    /**
     * CPU utilization.
     */
    cpu?: number;
    /**
     * Support level.
     */
    level?: string;
    /**
     * Number of available CPUs.
     */
    maxcpu?: number;
    /**
     * Number of available memory in bytes.
     */
    maxmem?: number;
    /**
     * Used memory in bytes.
     */
    mem?: number;
    /**
     * The cluster node name.
     */
    node: string;
    /**
     * The SSL fingerprint for the node certificate.
     */
    ssl_fingerprint?: string;
    /**
     * Node status.
     */
    status: string;
    /**
     * Node uptime in seconds.
     */
    uptime?: number;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}
   */
  export interface nodesIndex2 {
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/lxc/\{vmid\}/config
   */
  export interface nodesLxcConfigVmConfig {
    /**
     * OS architecture type.
     */
    arch?: string;
    /**
     * Console mode. By default, the console command tries to open a connection to one of the available tty devices. By setting cmode to 'console' it tries to attach to /dev/console instead. If you set cmode to 'shell', it simply invokes a shell inside the container (no login).
     */
    cmode?: string;
    /**
     * Attach a console device (/dev/console) to the container.
     */
    console?: boolean;
    /**
     * The number of cores assigned to the container. A container can use all available cores by default.
     */
    cores?: number;
    /**
     * Limit of CPU usage.
     * NOTE: If the computer has 2 CPUs, it has a total of '2' CPU time. Value '0' indicates no CPU limit.
     */
    cpulimit?: number;
    /**
     * CPU weight for a container. Argument is used in the kernel fair scheduler. The larger the number is, the more CPU time this container gets. Number is relative to the weights of all the other running guests.
     */
    cpuunits?: number;
    /**
     * Try to be more verbose. For now this only enables debug log-level on start.
     */
    debug?: boolean;
    /**
     * Description for the Container. Shown in the web-interface CT's summary. This is saved as comment inside the configuration file.
     */
    description?: string;
    /**
     * Device to pass through to the container
     */
    dev0?: string;
    /**
     * Device to pass through to the container
     */
    dev1?: string;
    /**
     * Device to pass through to the container
     */
    dev2?: string;
    /**
     * Device to pass through to the container
     */
    dev3?: string;
    /**
     * SHA1 digest of configuration file. This can be used to prevent concurrent modifications.
     */
    digest: string;
    /**
     * Allow containers access to advanced features.
     */
    features?: string;
    /**
     * Script that will be exectued during various steps in the containers lifetime.
     */
    hookscript?: string;
    /**
     * Set a host name for the container.
     */
    hostname?: string;
    /**
     * Lock/unlock the container.
     */
    lock?: string;
    /**
     * Array of lxc low-level configurations ([[key1, value1], [key2, value2] ...]).
     */
    lxc?: string[][];
    /**
     * Amount of RAM for the container in MB.
     */
    memory?: number;
    /**
     * Use volume as container mount point. Use the special syntax STORAGE_ID:SIZE_IN_GiB to allocate a new volume.
     */
    mp0?: string;
    /**
     * Use volume as container mount point. Use the special syntax STORAGE_ID:SIZE_IN_GiB to allocate a new volume.
     */
    mp1?: string;
    /**
     * Use volume as container mount point. Use the special syntax STORAGE_ID:SIZE_IN_GiB to allocate a new volume.
     */
    mp2?: string;
    /**
     * Use volume as container mount point. Use the special syntax STORAGE_ID:SIZE_IN_GiB to allocate a new volume.
     */
    mp3?: string;
    /**
     * Sets DNS server IP address for a container. Create will automatically use the setting from the host if you neither set searchdomain nor nameserver.
     */
    nameserver?: string;
    /**
     * Specifies network interfaces for the container.
     */
    net0?: string;
    /**
     * Specifies network interfaces for the container.
     */
    net1?: string;
    /**
     * Specifies network interfaces for the container.
     */
    net2?: string;
    /**
     * Specifies network interfaces for the container.
     */
    net3?: string;
    /**
     * Specifies whether a container will be started during system bootup.
     */
    onboot?: boolean;
    /**
     * OS type. This is used to setup configuration inside the container, and corresponds to lxc setup scripts in /usr/share/lxc/config/<ostype>.common.conf. Value 'unmanaged' can be used to skip and OS specific setup.
     */
    ostype?: string;
    /**
     * Sets the protection flag of the container. This will prevent the CT or CT's disk remove/update operation.
     */
    protection?: boolean;
    /**
     * Use volume as container root.
     */
    rootfs?: string;
    /**
     * Sets DNS search domains for a container. Create will automatically use the setting from the host if you neither set searchdomain nor nameserver.
     */
    searchdomain?: string;
    /**
     * Startup and shutdown behavior. Order is a non-negative number defining the general startup order. Shutdown in done with reverse ordering. Additionally you can set the 'up' or 'down' delay in seconds, which specifies a delay to wait before the next VM is started or stopped.
     */
    startup?: string;
    /**
     * Amount of SWAP for the container in MB.
     */
    swap?: number;
    /**
     * Tags of the Container. This is only meta information.
     */
    tags?: string;
    /**
     * Enable/disable Template.
     */
    template?: boolean;
    /**
     * Time zone to use in the container. If option isn't set, then nothing will be done. Can be set to 'host' to match the host time zone, or an arbitrary time zone option from /usr/share/zoneinfo/zone.tab
     */
    timezone?: string;
    /**
     * Specify the number of tty available to the container
     */
    tty?: number;
    /**
     * Makes the container run as unprivileged user. (Should not be modified manually.)
     */
    unprivileged?: boolean;
    /**
     * Reference to unused volumes. This is used internally, and should not be modified manually.
     */
    unused0?: string;
    /**
     * Reference to unused volumes. This is used internally, and should not be modified manually.
     */
    unused1?: string;
    /**
     * Reference to unused volumes. This is used internally, and should not be modified manually.
     */
    unused2?: string;
    /**
     * Reference to unused volumes. This is used internally, and should not be modified manually.
     */
    unused3?: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/lxc/\{vmid\}/feature
   */
  export interface nodesLxcFeatureVmFeature {
    hasFeature: boolean;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/lxc/\{vmid\}/firewall/aliases
   */
  export interface nodesLxcFirewallAliasesGetAliases {
    cidr: string;
    comment?: string;
    /**
     * Prevent changes if current configuration file has a different digest. This can be used to prevent concurrent modifications.
     */
    digest: string;
    name: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/lxc/\{vmid\}/firewall
   */
  export interface nodesLxcFirewallIndex {
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/lxc/\{vmid\}/firewall/ipset/\{name\}
   */
  export interface nodesLxcFirewallIpsetGetIpset {
    cidr: string;
    comment?: string;
    /**
     * Prevent changes if current configuration file has a different digest. This can be used to prevent concurrent modifications.
     */
    digest: string;
    nomatch?: boolean;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/lxc/\{vmid\}/firewall/ipset
   */
  export interface nodesLxcFirewallIpsetIpsetIndex {
    comment?: string;
    /**
     * Prevent changes if current configuration file has a different digest. This can be used to prevent concurrent modifications.
     */
    digest: string;
    /**
     * IP set name.
     */
    name: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/lxc/\{vmid\}/firewall/log
   */
  export interface nodesLxcFirewallLogLog {
    /**
     * Line number
     */
    n: number;
    /**
     * Line text
     */
    t: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/lxc/\{vmid\}/firewall/options
   */
  export interface nodesLxcFirewallOptionsGetOptions {
    /**
     * Enable DHCP.
     */
    dhcp?: boolean;
    /**
     * Enable/disable firewall rules.
     */
    enable?: boolean;
    /**
     * Enable default IP filters. This is equivalent to adding an empty ipfilter-net<id> ipset for every interface. Such ipsets implicitly contain sane default restrictions such as restricting IPv6 link local addresses to the one derived from the interface's MAC address. For containers the configured IP addresses will be implicitly added.
     */
    ipfilter?: boolean;
    /**
     * Log level for incoming traffic.
     */
    log_level_in?: string;
    /**
     * Log level for outgoing traffic.
     */
    log_level_out?: string;
    /**
     * Enable/disable MAC address filter.
     */
    macfilter?: boolean;
    /**
     * Enable NDP (Neighbor Discovery Protocol).
     */
    ndp?: boolean;
    /**
     * Input policy.
     */
    policy_in?: string;
    /**
     * Output policy.
     */
    policy_out?: string;
    /**
     * Allow sending Router Advertisement.
     */
    radv?: boolean;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/lxc/\{vmid\}/firewall/refs
   */
  export interface nodesLxcFirewallRefsRefs {
    comment?: string;
    name: string;
    ref: string;
    scope: string;
    type: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/lxc/\{vmid\}/firewall/rules/\{pos\}
   */
  export interface nodesLxcFirewallRulesGetRule {
    action: string;
    comment?: string;
    dest?: string;
    dport?: string;
    enable?: number;
    'icmp-type'?: string;
    iface?: string;
    ipversion?: number;
    /**
     * Log level for firewall rule
     */
    log?: string;
    macro?: string;
    pos: number;
    proto?: string;
    source?: string;
    sport?: string;
    type: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/lxc/\{vmid\}/firewall/rules
   */
  export interface nodesLxcFirewallRulesGetRules {
    pos: number;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/lxc/\{vmid\}/interfaces
   */
  export interface nodesLxcInterfacesIp {
    /**
     * The MAC address of the interface
     */
    hwaddr: string;
    /**
     * The IPv4 address of the interface
     */
    inet?: string;
    /**
     * The IPv6 address of the interface
     */
    inet6?: string;
    /**
     * The name of the interface
     */
    name: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by POST /nodes/\{node\}/lxc/\{vmid\}/mtunnel
   */
  export interface nodesLxcMtunnelMtunnel {
    socket: string;
    ticket: string;
    upid: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/lxc/\{vmid\}/mtunnelwebsocket
   */
  export interface nodesLxcMtunnelwebsocketMtunnelwebsocket {
    port?: string;
    socket?: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/lxc/\{vmid\}/pending
   */
  export interface nodesLxcPendingVmPending {
    /**
     * Indicates a pending delete request if present and not 0.
     */
    delete?: number;
    /**
     * Configuration option name.
     */
    key: string;
    /**
     * Pending value.
     */
    pending?: string;
    /**
     * Current value.
     */
    value?: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/lxc/\{vmid\}/rrd
   */
  export interface nodesLxcRrdRrd {
    filename: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/lxc/\{vmid\}/rrddata
   */
  export interface nodesLxcRrddataRrddata {
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/lxc/\{vmid\}/snapshot
   */
  export interface nodesLxcSnapshotList {
    /**
     * Snapshot description.
     */
    description: string;
    /**
     * Snapshot identifier. Value 'current' identifies the current VM.
     */
    name: string;
    /**
     * Parent snapshot identifier.
     */
    parent?: string;
    /**
     * Snapshot creation time
     */
    snaptime?: number;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/lxc/\{vmid\}/snapshot/\{snapname\}
   */
  export interface nodesLxcSnapshotSnapshotCmdIdx {
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by POST /nodes/\{node\}/lxc/\{vmid\}/spiceproxy
   */
  export interface nodesLxcSpiceproxySpiceproxy {
    host: string;
    password: string;
    proxy: string;
    'tls-port': number;
    type: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/lxc/\{vmid\}/status/current
   */
  export interface nodesLxcStatusCurrentVmStatus {
    /**
     * Maximum usable CPUs.
     */
    cpus?: number;
    /**
     * HA manager service status.
     */
    ha: any;
    /**
     * The current config lock, if any.
     */
    lock?: string;
    /**
     * Root disk size in bytes.
     */
    maxdisk?: number;
    /**
     * Maximum memory in bytes.
     */
    maxmem?: number;
    /**
     * Maximum SWAP memory in bytes.
     */
    maxswap?: number;
    /**
     * Container name.
     */
    name?: string;
    /**
     * LXC Container status.
     */
    status: string;
    /**
     * The current configured tags, if any.
     */
    tags?: string;
    /**
     * Uptime.
     */
    uptime?: number;
    /**
     * The (unique) ID of the VM.
     */
    vmid: number;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/lxc/\{vmid\}/status
   */
  export interface nodesLxcStatusVmcmdidx {
    subdir: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by POST /nodes/\{node\}/lxc/\{vmid\}/termproxy
   */
  export interface nodesLxcTermproxyTermproxy {
    port: number;
    ticket: string;
    upid: string;
    user: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/lxc
   */
  export interface nodesLxcVm {
    /**
     * Maximum usable CPUs.
     */
    cpus?: number;
    /**
     * The current config lock, if any.
     */
    lock?: string;
    /**
     * Root disk size in bytes.
     */
    maxdisk?: number;
    /**
     * Maximum memory in bytes.
     */
    maxmem?: number;
    /**
     * Maximum SWAP memory in bytes.
     */
    maxswap?: number;
    /**
     * Container name.
     */
    name?: string;
    /**
     * LXC Container status.
     */
    status: string;
    /**
     * The current configured tags, if any.
     */
    tags?: string;
    /**
     * Uptime.
     */
    uptime?: number;
    /**
     * The (unique) ID of the VM.
     */
    vmid: number;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/lxc/\{vmid\}
   */
  export interface nodesLxcVmdiridx {
    subdir: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by POST /nodes/\{node\}/lxc/\{vmid\}/vncproxy
   */
  export interface nodesLxcVncproxyVncproxy {
    cert: string;
    port: number;
    ticket: string;
    upid: string;
    user: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/lxc/\{vmid\}/vncwebsocket
   */
  export interface nodesLxcVncwebsocketVncwebsocket {
    port: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/netstat
   */
  export interface nodesNetstatNetstat {
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/network
   */
  export interface nodesNetworkIndex {
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/network/\{iface\}
   */
  export interface nodesNetworkNetworkConfig {
    method: string;
    type: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by POST /nodes/\{node\}/qemu/\{vmid\}/agent/exec
   */
  export interface nodesQemuAgentExecExec {
    /**
     * The PID of the process started by the guest-agent.
     */
    pid: number;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/qemu/\{vmid\}/agent/exec-status
   */
  export interface nodesQemuAgentExecStatusExecStatus {
    /**
     * stderr of the process
     */
    'err-data'?: string;
    /**
     * true if stderr was not fully captured
     */
    'err-truncated'?: boolean;
    /**
     * process exit code if it was normally terminated.
     */
    exitcode?: number;
    /**
     * Tells if the given command has exited yet.
     */
    exited: boolean;
    /**
     * stdout of the process
     */
    'out-data'?: string;
    /**
     * true if stdout was not fully captured
     */
    'out-truncated'?: boolean;
    /**
     * signal number or exception code if the process was abnormally terminated.
     */
    signal?: number;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/qemu/\{vmid\}/agent/file-read
   */
  export interface nodesQemuAgentFileReadFileRead {
    /**
     * The content of the file, maximum 16777216
     */
    content: string;
    /**
     * If set to 1, the output is truncated and not complete
     */
    truncated?: boolean;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/qemu/\{vmid\}/agent
   */
  export interface nodesQemuAgentIndex {
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/qemu/\{vmid\}/cloudinit
   */
  export interface nodesQemuCloudinitCloudinitPending {
    /**
     * Indicates a pending delete request if present and not 0.
     */
    delete?: number;
    /**
     * Configuration option name.
     */
    key: string;
    /**
     * The new pending value.
     */
    pending?: string;
    /**
     * Value as it was used to generate the current cloudinit image.
     */
    value?: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/qemu/\{vmid\}/config
   */
  export interface nodesQemuConfigVmConfig {
    /**
     * Enable/disable ACPI.
     */
    acpi?: boolean;
    /**
     * List of host cores used to execute guest processes, for example: 0,5,8-11
     */
    affinity?: string;
    /**
     * Enable/disable communication with the QEMU Guest Agent and its properties.
     */
    agent?: string;
    /**
     * Virtual processor architecture. Defaults to the host.
     */
    arch?: string;
    /**
     * Arbitrary arguments passed to kvm, for example:
     * args: -no-reboot -smbios 'type=0,vendor=FOO'
     * NOTE: this option is for experts only.
     */
    args?: string;
    /**
     * Configure a audio device, useful in combination with QXL/Spice.
     */
    audio0?: string;
    /**
     * Automatic restart after crash (currently ignored).
     */
    autostart?: boolean;
    /**
     * Amount of target RAM for the VM in MiB. Using zero disables the ballon driver.
     */
    balloon?: number;
    /**
     * Select BIOS implementation.
     */
    bios?: string;
    /**
     * Specify guest boot order. Use the 'order=' sub-property as usage with no key or 'legacy=' is deprecated.
     */
    boot?: string;
    /**
     * Enable booting from specified disk. Deprecated: Use 'boot: order=foo;bar' instead.
     */
    bootdisk?: string;
    /**
     * This is an alias for option -ide2
     */
    cdrom?: string;
    /**
     * cloud-init: Specify custom files to replace the automatically generated ones at start.
     */
    cicustom?: string;
    /**
     * cloud-init: Password to assign the user. Using this is generally not recommended. Use ssh keys instead. Also note that older cloud-init versions do not support hashed passwords.
     */
    cipassword?: string;
    /**
     * Specifies the cloud-init configuration format. The default depends on the configured operating system type (`ostype`. We use the `nocloud` format for Linux, and `configdrive2` for windows.
     */
    citype?: string;
    /**
     * cloud-init: do an automatic package upgrade after the first boot.
     */
    ciupgrade?: boolean;
    /**
     * cloud-init: User name to change ssh keys and password for instead of the image's configured default user.
     */
    ciuser?: string;
    /**
     * The number of cores per socket.
     */
    cores?: number;
    /**
     * Emulated CPU type.
     */
    cpu?: string;
    /**
     * Limit of CPU usage.
     * NOTE: If the computer has 2 CPUs, it has total of '2' CPU time. Value '0' indicates no CPU limit.
     */
    cpulimit?: number;
    /**
     * CPU weight for a VM. Argument is used in the kernel fair scheduler. The larger the number is, the more CPU time this VM gets. Number is relative to weights of all the other running VMs.
     */
    cpuunits?: number;
    /**
     * Description for the VM. Shown in the web-interface VM's summary. This is saved as comment inside the configuration file.
     */
    description?: string;
    /**
     * SHA1 digest of configuration file. This can be used to prevent concurrent modifications.
     */
    digest: string;
    /**
     * Configure a disk for storing EFI vars.
     */
    efidisk0?: string;
    /**
     * Freeze CPU at startup (use 'c' monitor command to start execution).
     */
    freeze?: boolean;
    /**
     * Script that will be executed during various steps in the vms lifetime.
     */
    hookscript?: string;
    /**
     * Map host PCI devices into guest.
     * NOTE: This option allows direct access to host hardware. So it is no longer
     * possible to migrate such machines - use with special care.
     * CAUTION: Experimental! User reported problems with this option.
     */
    hostpci0?: string;
    /**
     * Map host PCI devices into guest.
     * NOTE: This option allows direct access to host hardware. So it is no longer
     * possible to migrate such machines - use with special care.
     * CAUTION: Experimental! User reported problems with this option.
     */
    hostpci1?: string;
    /**
     * Map host PCI devices into guest.
     * NOTE: This option allows direct access to host hardware. So it is no longer
     * possible to migrate such machines - use with special care.
     * CAUTION: Experimental! User reported problems with this option.
     */
    hostpci2?: string;
    /**
     * Map host PCI devices into guest.
     * NOTE: This option allows direct access to host hardware. So it is no longer
     * possible to migrate such machines - use with special care.
     * CAUTION: Experimental! User reported problems with this option.
     */
    hostpci3?: string;
    /**
     * Map host PCI devices into guest.
     * NOTE: This option allows direct access to host hardware. So it is no longer
     * possible to migrate such machines - use with special care.
     * CAUTION: Experimental! User reported problems with this option.
     */
    hostpci4?: string;
    /**
     * Map host PCI devices into guest.
     * NOTE: This option allows direct access to host hardware. So it is no longer
     * possible to migrate such machines - use with special care.
     * CAUTION: Experimental! User reported problems with this option.
     */
    hostpci5?: string;
    /**
     * Map host PCI devices into guest.
     * NOTE: This option allows direct access to host hardware. So it is no longer
     * possible to migrate such machines - use with special care.
     * CAUTION: Experimental! User reported problems with this option.
     */
    hostpci6?: string;
    /**
     * Map host PCI devices into guest.
     * NOTE: This option allows direct access to host hardware. So it is no longer
     * possible to migrate such machines - use with special care.
     * CAUTION: Experimental! User reported problems with this option.
     */
    hostpci7?: string;
    /**
     * Selectively enable hotplug features. This is a comma separated list of hotplug features: 'network', 'disk', 'cpu', 'memory', 'usb' and 'cloudinit'. Use '0' to disable hotplug completely. Using '1' as value is an alias for the default `network,disk,usb`. USB hotplugging is possible for guests with machine version >= 7.1 and ostype l26 or windows > 7.
     */
    hotplug?: string;
    /**
     * Enable/disable hugepages memory.
     */
    hugepages?: string;
    /**
     * Use volume as IDE hard disk or CD-ROM (n is 0 to 3).
     */
    ide0?: string;
    /**
     * Use volume as IDE hard disk or CD-ROM (n is 0 to 3).
     */
    ide1?: string;
    /**
     * Use volume as IDE hard disk or CD-ROM (n is 0 to 3).
     */
    ide2?: string;
    /**
     * Use volume as IDE hard disk or CD-ROM (n is 0 to 3).
     */
    ide3?: string;
    /**
     * cloud-init: Specify IP addresses and gateways for the corresponding interface.
     * IP addresses use CIDR notation, gateways are optional but need an IP of the same type specified.
     * The special string 'dhcp' can be used for IP addresses to use DHCP, in which case no explicit
     * gateway should be provided.
     * For IPv6 the special string 'auto' can be used to use stateless autoconfiguration. This requires
     * cloud-init 19.4 or newer.
     * If cloud-init is enabled and neither an IPv4 nor an IPv6 address is specified, it defaults to using
     * dhcp on IPv4.
     *
     */
    ipconfig0?: string;
    /**
     * cloud-init: Specify IP addresses and gateways for the corresponding interface.
     * IP addresses use CIDR notation, gateways are optional but need an IP of the same type specified.
     * The special string 'dhcp' can be used for IP addresses to use DHCP, in which case no explicit
     * gateway should be provided.
     * For IPv6 the special string 'auto' can be used to use stateless autoconfiguration. This requires
     * cloud-init 19.4 or newer.
     * If cloud-init is enabled and neither an IPv4 nor an IPv6 address is specified, it defaults to using
     * dhcp on IPv4.
     *
     */
    ipconfig1?: string;
    /**
     * cloud-init: Specify IP addresses and gateways for the corresponding interface.
     * IP addresses use CIDR notation, gateways are optional but need an IP of the same type specified.
     * The special string 'dhcp' can be used for IP addresses to use DHCP, in which case no explicit
     * gateway should be provided.
     * For IPv6 the special string 'auto' can be used to use stateless autoconfiguration. This requires
     * cloud-init 19.4 or newer.
     * If cloud-init is enabled and neither an IPv4 nor an IPv6 address is specified, it defaults to using
     * dhcp on IPv4.
     *
     */
    ipconfig2?: string;
    /**
     * cloud-init: Specify IP addresses and gateways for the corresponding interface.
     * IP addresses use CIDR notation, gateways are optional but need an IP of the same type specified.
     * The special string 'dhcp' can be used for IP addresses to use DHCP, in which case no explicit
     * gateway should be provided.
     * For IPv6 the special string 'auto' can be used to use stateless autoconfiguration. This requires
     * cloud-init 19.4 or newer.
     * If cloud-init is enabled and neither an IPv4 nor an IPv6 address is specified, it defaults to using
     * dhcp on IPv4.
     *
     */
    ipconfig3?: string;
    /**
     * cloud-init: Specify IP addresses and gateways for the corresponding interface.
     * IP addresses use CIDR notation, gateways are optional but need an IP of the same type specified.
     * The special string 'dhcp' can be used for IP addresses to use DHCP, in which case no explicit
     * gateway should be provided.
     * For IPv6 the special string 'auto' can be used to use stateless autoconfiguration. This requires
     * cloud-init 19.4 or newer.
     * If cloud-init is enabled and neither an IPv4 nor an IPv6 address is specified, it defaults to using
     * dhcp on IPv4.
     *
     */
    ipconfig4?: string;
    /**
     * cloud-init: Specify IP addresses and gateways for the corresponding interface.
     * IP addresses use CIDR notation, gateways are optional but need an IP of the same type specified.
     * The special string 'dhcp' can be used for IP addresses to use DHCP, in which case no explicit
     * gateway should be provided.
     * For IPv6 the special string 'auto' can be used to use stateless autoconfiguration. This requires
     * cloud-init 19.4 or newer.
     * If cloud-init is enabled and neither an IPv4 nor an IPv6 address is specified, it defaults to using
     * dhcp on IPv4.
     *
     */
    ipconfig5?: string;
    /**
     * cloud-init: Specify IP addresses and gateways for the corresponding interface.
     * IP addresses use CIDR notation, gateways are optional but need an IP of the same type specified.
     * The special string 'dhcp' can be used for IP addresses to use DHCP, in which case no explicit
     * gateway should be provided.
     * For IPv6 the special string 'auto' can be used to use stateless autoconfiguration. This requires
     * cloud-init 19.4 or newer.
     * If cloud-init is enabled and neither an IPv4 nor an IPv6 address is specified, it defaults to using
     * dhcp on IPv4.
     *
     */
    ipconfig6?: string;
    /**
     * cloud-init: Specify IP addresses and gateways for the corresponding interface.
     * IP addresses use CIDR notation, gateways are optional but need an IP of the same type specified.
     * The special string 'dhcp' can be used for IP addresses to use DHCP, in which case no explicit
     * gateway should be provided.
     * For IPv6 the special string 'auto' can be used to use stateless autoconfiguration. This requires
     * cloud-init 19.4 or newer.
     * If cloud-init is enabled and neither an IPv4 nor an IPv6 address is specified, it defaults to using
     * dhcp on IPv4.
     *
     */
    ipconfig7?: string;
    /**
     * Inter-VM shared memory. Useful for direct communication between VMs, or to the host.
     */
    ivshmem?: string;
    /**
     * Use together with hugepages. If enabled, hugepages will not not be deleted after VM shutdown and can be used for subsequent starts.
     */
    keephugepages?: boolean;
    /**
     * Keyboard layout for VNC server. This option is generally not required and is often better handled from within the guest OS.
     */
    keyboard?: string;
    /**
     * Enable/disable KVM hardware virtualization.
     */
    kvm?: boolean;
    /**
     * Set the real time clock (RTC) to local time. This is enabled by default if the `ostype` indicates a Microsoft Windows OS.
     */
    localtime?: boolean;
    /**
     * Lock/unlock the VM.
     */
    lock?: string;
    /**
     * Specifies the QEMU machine type.
     */
    machine?: string;
    /**
     * Memory properties.
     */
    memory?: string;
    /**
     * Set maximum tolerated downtime (in seconds) for migrations.
     */
    migrate_downtime?: number;
    /**
     * Set maximum speed (in MB/s) for migrations. Value 0 is no limit.
     */
    migrate_speed?: number;
    /**
     * Set a name for the VM. Only used on the configuration web interface.
     */
    name?: string;
    /**
     * cloud-init: Sets DNS server IP address for a container. Create will automatically use the setting from the host if neither searchdomain nor nameserver are set.
     */
    nameserver?: string;
    /**
     * Specify network devices.
     */
    net0?: string;
    /**
     * Specify network devices.
     */
    net1?: string;
    /**
     * Specify network devices.
     */
    net2?: string;
    /**
     * Specify network devices.
     */
    net3?: string;
    /**
     * Enable/disable NUMA.
     */
    numa?: boolean;
    /**
     * NUMA topology.
     */
    numa0?: string;
    /**
     * NUMA topology.
     */
    numa1?: string;
    /**
     * NUMA topology.
     */
    numa2?: string;
    /**
     * NUMA topology.
     */
    numa3?: string;
    /**
     * Specifies whether a VM will be started during system bootup.
     */
    onboot?: boolean;
    /**
     * Specify guest operating system. This is used to enable special
     * optimization/features for specific operating systems:
     * [horizontal]
     * other;; unspecified OS
     * wxp;; Microsoft Windows XP
     * w2k;; Microsoft Windows 2000
     * w2k3;; Microsoft Windows 2003
     * w2k8;; Microsoft Windows 2008
     * wvista;; Microsoft Windows Vista
     * win7;; Microsoft Windows 7
     * win8;; Microsoft Windows 8/2012/2012r2
     * win10;; Microsoft Windows 10/2016/2019
     * win11;; Microsoft Windows 11/2022
     * l24;; Linux 2.4 Kernel
     * l26;; Linux 2.6 - 6.X Kernel
     * solaris;; Solaris/OpenSolaris/OpenIndiania kernel
     */
    ostype?: string;
    /**
     * Map host parallel devices (n is 0 to 2).
     * NOTE: This option allows direct access to host hardware. So it is no longer possible to migrate such
     * machines - use with special care.
     * CAUTION: Experimental! User reported problems with this option.
     */
    parallel0?: string;
    /**
     * Map host parallel devices (n is 0 to 2).
     * NOTE: This option allows direct access to host hardware. So it is no longer possible to migrate such
     * machines - use with special care.
     * CAUTION: Experimental! User reported problems with this option.
     */
    parallel1?: string;
    /**
     * Map host parallel devices (n is 0 to 2).
     * NOTE: This option allows direct access to host hardware. So it is no longer possible to migrate such
     * machines - use with special care.
     * CAUTION: Experimental! User reported problems with this option.
     */
    parallel2?: string;
    /**
     * Map host parallel devices (n is 0 to 2).
     * NOTE: This option allows direct access to host hardware. So it is no longer possible to migrate such
     * machines - use with special care.
     * CAUTION: Experimental! User reported problems with this option.
     */
    parallel3?: string;
    /**
     * Sets the protection flag of the VM. This will disable the remove VM and remove disk operations.
     */
    protection?: boolean;
    /**
     * Allow reboot. If set to '0' the VM exit on reboot.
     */
    reboot?: boolean;
    /**
     * Configure a VirtIO-based Random Number Generator.
     */
    rng0?: string;
    /**
     * Use volume as SATA hard disk or CD-ROM (n is 0 to 5).
     */
    sata0?: string;
    /**
     * Use volume as SATA hard disk or CD-ROM (n is 0 to 5).
     */
    sata1?: string;
    /**
     * Use volume as SATA hard disk or CD-ROM (n is 0 to 5).
     */
    sata2?: string;
    /**
     * Use volume as SATA hard disk or CD-ROM (n is 0 to 5).
     */
    sata3?: string;
    /**
     * Use volume as SCSI hard disk or CD-ROM (n is 0 to 30).
     */
    scsi0?: string;
    /**
     * Use volume as SCSI hard disk or CD-ROM (n is 0 to 30).
     */
    scsi1?: string;
    /**
     * Use volume as SCSI hard disk or CD-ROM (n is 0 to 30).
     */
    scsi2?: string;
    /**
     * Use volume as SCSI hard disk or CD-ROM (n is 0 to 30).
     */
    scsi3?: string;
    /**
     * SCSI controller model
     */
    scsihw?: string;
    /**
     * cloud-init: Sets DNS search domains for a container. Create will automatically use the setting from the host if neither searchdomain nor nameserver are set.
     */
    searchdomain?: string;
    /**
     * Create a serial device inside the VM (n is 0 to 3), and pass through a
     * host serial device (i.e. /dev/ttyS0), or create a unix socket on the
     * host side (use 'qm terminal' to open a terminal connection).
     * NOTE: If you pass through a host serial device, it is no longer possible to migrate such machines -
     * use with special care.
     * CAUTION: Experimental! User reported problems with this option.
     */
    serial0?: string;
    /**
     * Create a serial device inside the VM (n is 0 to 3), and pass through a
     * host serial device (i.e. /dev/ttyS0), or create a unix socket on the
     * host side (use 'qm terminal' to open a terminal connection).
     * NOTE: If you pass through a host serial device, it is no longer possible to migrate such machines -
     * use with special care.
     * CAUTION: Experimental! User reported problems with this option.
     */
    serial1?: string;
    /**
     * Create a serial device inside the VM (n is 0 to 3), and pass through a
     * host serial device (i.e. /dev/ttyS0), or create a unix socket on the
     * host side (use 'qm terminal' to open a terminal connection).
     * NOTE: If you pass through a host serial device, it is no longer possible to migrate such machines -
     * use with special care.
     * CAUTION: Experimental! User reported problems with this option.
     */
    serial2?: string;
    /**
     * Create a serial device inside the VM (n is 0 to 3), and pass through a
     * host serial device (i.e. /dev/ttyS0), or create a unix socket on the
     * host side (use 'qm terminal' to open a terminal connection).
     * NOTE: If you pass through a host serial device, it is no longer possible to migrate such machines -
     * use with special care.
     * CAUTION: Experimental! User reported problems with this option.
     */
    serial3?: string;
    /**
     * Amount of memory shares for auto-ballooning. The larger the number is, the more memory this VM gets. Number is relative to weights of all other running VMs. Using zero disables auto-ballooning. Auto-ballooning is done by pvestatd.
     */
    shares?: number;
    /**
     * Specify SMBIOS type 1 fields.
     */
    smbios1?: string;
    /**
     * The number of CPUs. Please use option -sockets instead.
     */
    smp?: number;
    /**
     * The number of CPU sockets.
     */
    sockets?: number;
    /**
     * Configure additional enhancements for SPICE.
     */
    spice_enhancements?: string;
    /**
     * cloud-init: Setup public SSH keys (one key per line, OpenSSH format).
     */
    sshkeys?: string;
    /**
     * Set the initial date of the real time clock. Valid format for date are:'now' or '2006-06-17T16:01:21' or '2006-06-17'.
     */
    startdate?: string;
    /**
     * Startup and shutdown behavior. Order is a non-negative number defining the general startup order. Shutdown in done with reverse ordering. Additionally you can set the 'up' or 'down' delay in seconds, which specifies a delay to wait before the next VM is started or stopped.
     */
    startup?: string;
    /**
     * Enable/disable the USB tablet device. This device is usually needed to allow absolute mouse positioning with VNC. Else the mouse runs out of sync with normal VNC clients. If you're running lots of console-only guests on one host, you may consider disabling this to save some context switches. This is turned off by default if you use spice (`qm set <vmid> --vga qxl`).
     */
    tablet?: boolean;
    /**
     * Tags of the VM. This is only meta information.
     */
    tags?: string;
    /**
     * Enable/disable time drift fix.
     */
    tdf?: boolean;
    /**
     * Enable/disable Template.
     */
    template?: boolean;
    /**
     * Configure a Disk for storing TPM state. The format is fixed to 'raw'.
     */
    tpmstate0?: string;
    /**
     * Reference to unused volumes. This is used internally, and should not be modified manually.
     */
    unused0?: string;
    /**
     * Reference to unused volumes. This is used internally, and should not be modified manually.
     */
    unused1?: string;
    /**
     * Reference to unused volumes. This is used internally, and should not be modified manually.
     */
    unused2?: string;
    /**
     * Reference to unused volumes. This is used internally, and should not be modified manually.
     */
    unused3?: string;
    /**
     * Configure an USB device (n is 0 to 4, for machine version >= 7.1 and ostype l26 or windows > 7, n can be up to 14).
     */
    usb0?: string;
    /**
     * Configure an USB device (n is 0 to 4, for machine version >= 7.1 and ostype l26 or windows > 7, n can be up to 14).
     */
    usb1?: string;
    /**
     * Configure an USB device (n is 0 to 4, for machine version >= 7.1 and ostype l26 or windows > 7, n can be up to 14).
     */
    usb2?: string;
    /**
     * Configure an USB device (n is 0 to 4, for machine version >= 7.1 and ostype l26 or windows > 7, n can be up to 14).
     */
    usb3?: string;
    /**
     * Number of hotplugged vcpus.
     */
    vcpus?: number;
    /**
     * Configure the VGA Hardware. If you want to use high resolution modes (>= 1280x1024x16) you may need to increase the vga memory option. Since QEMU 2.9 the default VGA display type is 'std' for all OS types besides some Windows versions (XP and older) which use 'cirrus'. The 'qxl' option enables the SPICE display server. For win* OS you can select how many independent displays you want, Linux guests can add displays them self.
     * You can also run without any graphic card, using a serial device as terminal.
     */
    vga?: string;
    /**
     * Use volume as VIRTIO hard disk (n is 0 to 15).
     */
    virtio0?: string;
    /**
     * Use volume as VIRTIO hard disk (n is 0 to 15).
     */
    virtio1?: string;
    /**
     * Use volume as VIRTIO hard disk (n is 0 to 15).
     */
    virtio2?: string;
    /**
     * Use volume as VIRTIO hard disk (n is 0 to 15).
     */
    virtio3?: string;
    /**
     * The VM generation ID (vmgenid) device exposes a 128-bit integer value identifier to the guest OS. This allows to notify the guest operating system when the virtual machine is executed with a different configuration (e.g. snapshot execution or creation from a template). The guest operating system notices the change, and is then able to react as appropriate by marking its copies of distributed databases as dirty, re-initializing its random number generator, etc.
     * Note that auto-creation only works when done through API/CLI create or update methods, but not when manually editing the config file.
     */
    vmgenid?: string;
    /**
     * Default storage for VM state volumes/files.
     */
    vmstatestorage?: string;
    /**
     * Create a virtual hardware watchdog device. Once enabled (by a guest action), the watchdog must be periodically polled by an agent inside the guest or else the watchdog will reset the guest (or execute the respective action specified)
     */
    watchdog?: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/qemu/\{vmid\}/feature
   */
  export interface nodesQemuFeatureVmFeature {
    hasFeature: boolean;
    nodes: string[];
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/qemu/\{vmid\}/firewall/aliases
   */
  export interface nodesQemuFirewallAliasesGetAliases {
    cidr: string;
    comment?: string;
    /**
     * Prevent changes if current configuration file has a different digest. This can be used to prevent concurrent modifications.
     */
    digest: string;
    name: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/qemu/\{vmid\}/firewall
   */
  export interface nodesQemuFirewallIndex {
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/qemu/\{vmid\}/firewall/ipset/\{name\}
   */
  export interface nodesQemuFirewallIpsetGetIpset {
    cidr: string;
    comment?: string;
    /**
     * Prevent changes if current configuration file has a different digest. This can be used to prevent concurrent modifications.
     */
    digest: string;
    nomatch?: boolean;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/qemu/\{vmid\}/firewall/ipset
   */
  export interface nodesQemuFirewallIpsetIpsetIndex {
    comment?: string;
    /**
     * Prevent changes if current configuration file has a different digest. This can be used to prevent concurrent modifications.
     */
    digest: string;
    /**
     * IP set name.
     */
    name: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/qemu/\{vmid\}/firewall/log
   */
  export interface nodesQemuFirewallLogLog {
    /**
     * Line number
     */
    n: number;
    /**
     * Line text
     */
    t: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/qemu/\{vmid\}/firewall/options
   */
  export interface nodesQemuFirewallOptionsGetOptions {
    /**
     * Enable DHCP.
     */
    dhcp?: boolean;
    /**
     * Enable/disable firewall rules.
     */
    enable?: boolean;
    /**
     * Enable default IP filters. This is equivalent to adding an empty ipfilter-net<id> ipset for every interface. Such ipsets implicitly contain sane default restrictions such as restricting IPv6 link local addresses to the one derived from the interface's MAC address. For containers the configured IP addresses will be implicitly added.
     */
    ipfilter?: boolean;
    /**
     * Log level for incoming traffic.
     */
    log_level_in?: string;
    /**
     * Log level for outgoing traffic.
     */
    log_level_out?: string;
    /**
     * Enable/disable MAC address filter.
     */
    macfilter?: boolean;
    /**
     * Enable NDP (Neighbor Discovery Protocol).
     */
    ndp?: boolean;
    /**
     * Input policy.
     */
    policy_in?: string;
    /**
     * Output policy.
     */
    policy_out?: string;
    /**
     * Allow sending Router Advertisement.
     */
    radv?: boolean;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/qemu/\{vmid\}/firewall/refs
   */
  export interface nodesQemuFirewallRefsRefs {
    comment?: string;
    name: string;
    ref: string;
    scope: string;
    type: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/qemu/\{vmid\}/firewall/rules/\{pos\}
   */
  export interface nodesQemuFirewallRulesGetRule {
    action: string;
    comment?: string;
    dest?: string;
    dport?: string;
    enable?: number;
    'icmp-type'?: string;
    iface?: string;
    ipversion?: number;
    /**
     * Log level for firewall rule
     */
    log?: string;
    macro?: string;
    pos: number;
    proto?: string;
    source?: string;
    sport?: string;
    type: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/qemu/\{vmid\}/firewall/rules
   */
  export interface nodesQemuFirewallRulesGetRules {
    pos: number;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/qemu/\{vmid\}/migrate
   */
  export interface nodesQemuMigrateMigrateVmPrecondition {
    /**
     * List nodes allowed for offline migration, only passed if VM is offline
     */
    allowed_nodes?: string[];
    /**
     * List local disks including CD-Rom, unsused and not referenced disks
     */
    local_disks: string[];
    /**
     * List local resources e.g. pci, usb
     */
    local_resources: string[];
    /**
     * List of mapped resources e.g. pci, usb
     */
    'mapped-resources': string[];
    /**
     * List not allowed nodes with additional informations, only passed if VM is offline
     */
    not_allowed_nodes?: any;
    running: boolean;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by POST /nodes/\{node\}/qemu/\{vmid\}/mtunnel
   */
  export interface nodesQemuMtunnelMtunnel {
    socket: string;
    ticket: string;
    upid: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/qemu/\{vmid\}/mtunnelwebsocket
   */
  export interface nodesQemuMtunnelwebsocketMtunnelwebsocket {
    port?: string;
    socket?: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/qemu/\{vmid\}/pending
   */
  export interface nodesQemuPendingVmPending {
    /**
     * Indicates a pending delete request if present and not 0. The value 2 indicates a force-delete request.
     */
    delete?: number;
    /**
     * Configuration option name.
     */
    key: string;
    /**
     * Pending value.
     */
    pending?: string;
    /**
     * Current value.
     */
    value?: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/qemu/\{vmid\}/rrd
   */
  export interface nodesQemuRrdRrd {
    filename: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/qemu/\{vmid\}/rrddata
   */
  export interface nodesQemuRrddataRrddata {
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/qemu/\{vmid\}/snapshot/\{snapname\}
   */
  export interface nodesQemuSnapshotSnapshotCmdIdx {
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/qemu/\{vmid\}/snapshot
   */
  export interface nodesQemuSnapshotSnapshotList {
    /**
     * Snapshot description.
     */
    description: string;
    /**
     * Snapshot identifier. Value 'current' identifies the current VM.
     */
    name: string;
    /**
     * Parent snapshot identifier.
     */
    parent?: string;
    /**
     * Snapshot creation time
     */
    snaptime?: number;
    /**
     * Snapshot includes RAM.
     */
    vmstate?: boolean;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by POST /nodes/\{node\}/qemu/\{vmid\}/spiceproxy
   */
  export interface nodesQemuSpiceproxySpiceproxy {
    host: string;
    password: string;
    proxy: string;
    'tls-port': number;
    type: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/qemu/\{vmid\}/status/current
   */
  export interface nodesQemuStatusCurrentVmStatus {
    /**
     * QEMU Guest Agent is enabled in config.
     */
    agent?: boolean;
    /**
     * Enable a specific clipboard. If not set, depending on the display type the SPICE one will be added.
     */
    clipboard?: string;
    /**
     * Maximum usable CPUs.
     */
    cpus?: number;
    /**
     * HA manager service status.
     */
    ha: any;
    /**
     * The current config lock, if any.
     */
    lock?: string;
    /**
     * Root disk size in bytes.
     */
    maxdisk?: number;
    /**
     * Maximum memory in bytes.
     */
    maxmem?: number;
    /**
     * VM name.
     */
    name?: string;
    /**
     * PID of running qemu process.
     */
    pid?: number;
    /**
     * VM run state from the 'query-status' QMP monitor command.
     */
    qmpstatus?: string;
    /**
     * The currently running machine type (if running).
     */
    'running-machine'?: string;
    /**
     * The currently running QEMU version (if running).
     */
    'running-qemu'?: string;
    /**
     * QEMU VGA configuration supports spice.
     */
    spice?: boolean;
    /**
     * QEMU process status.
     */
    status: string;
    /**
     * The current configured tags, if any
     */
    tags?: string;
    /**
     * Uptime.
     */
    uptime?: number;
    /**
     * The (unique) ID of the VM.
     */
    vmid: number;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/qemu/\{vmid\}/status
   */
  export interface nodesQemuStatusVmcmdidx {
    subdir: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by POST /nodes/\{node\}/qemu/\{vmid\}/termproxy
   */
  export interface nodesQemuTermproxyTermproxy {
    port: number;
    ticket: string;
    upid: string;
    user: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/qemu
   */
  export interface nodesQemuVm {
    /**
     * Maximum usable CPUs.
     */
    cpus?: number;
    /**
     * The current config lock, if any.
     */
    lock?: string;
    /**
     * Root disk size in bytes.
     */
    maxdisk?: number;
    /**
     * Maximum memory in bytes.
     */
    maxmem?: number;
    /**
     * VM name.
     */
    name?: string;
    /**
     * PID of running qemu process.
     */
    pid?: number;
    /**
     * VM run state from the 'query-status' QMP monitor command.
     */
    qmpstatus?: string;
    /**
     * The currently running machine type (if running).
     */
    'running-machine'?: string;
    /**
     * The currently running QEMU version (if running).
     */
    'running-qemu'?: string;
    /**
     * QEMU process status.
     */
    status: string;
    /**
     * The current configured tags, if any
     */
    tags?: string;
    /**
     * Uptime.
     */
    uptime?: number;
    /**
     * The (unique) ID of the VM.
     */
    vmid: number;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/qemu/\{vmid\}
   */
  export interface nodesQemuVmdiridx {
    subdir: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by POST /nodes/\{node\}/qemu/\{vmid\}/vncproxy
   */
  export interface nodesQemuVncproxyVncproxy {
    cert: string;
    /**
     * Returned if requested with 'generate-password' param. Consists of printable ASCII characters ('!' .. '~').
     */
    password?: string;
    port: number;
    ticket: string;
    upid: string;
    user: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/qemu/\{vmid\}/vncwebsocket
   */
  export interface nodesQemuVncwebsocketVncwebsocket {
    port: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/query-url-metadata
   */
  export interface nodesQueryUrlMetadataQueryUrlMetadata {
    filename?: string;
    mimetype?: string;
    size?: number;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/replication/\{id\}
   */
  export interface nodesReplicationIndex {
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/replication/\{id\}/log
   */
  export interface nodesReplicationLogReadJobLog {
    /**
     * Line number
     */
    n: number;
    /**
     * Line text
     */
    t: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/replication
   */
  export interface nodesReplicationStatus {
    id: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/rrd
   */
  export interface nodesRrdRrd {
    filename: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/rrddata
   */
  export interface nodesRrddataRrddata {
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/scan/cifs
   */
  export interface nodesScanCifsCifsscan {
    /**
     * Descriptive text from server.
     */
    description: string;
    /**
     * The cifs share name.
     */
    share: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/scan/glusterfs
   */
  export interface nodesScanGlusterfsGlusterfsscan {
    /**
     * The volume name.
     */
    volname: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/scan
   */
  export interface nodesScanIndex {
    method: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/scan/iscsi
   */
  export interface nodesScanIscsiIscsiscan {
    /**
     * The iSCSI portal name.
     */
    portal: string;
    /**
     * The iSCSI target name.
     */
    target: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/scan/lvm
   */
  export interface nodesScanLvmLvmscan {
    /**
     * The LVM logical volume group name.
     */
    vg: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/scan/lvmthin
   */
  export interface nodesScanLvmthinLvmthinscan {
    /**
     * The LVM Thin Pool name (LVM logical volume).
     */
    lv: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/scan/nfs
   */
  export interface nodesScanNfsNfsscan {
    /**
     * NFS export options.
     */
    options: string;
    /**
     * The exported path.
     */
    path: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/scan/pbs
   */
  export interface nodesScanPbsPbsscan {
    /**
     * Comment from server.
     */
    comment?: string;
    /**
     * The datastore name.
     */
    store: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/scan/zfs
   */
  export interface nodesScanZfsZfsscan {
    /**
     * ZFS pool name.
     */
    pool: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/sdn
   */
  export interface nodesSdnSdnindex {
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/sdn/zones/\{zone\}/content
   */
  export interface nodesSdnZonesContentIndex {
    /**
     * Status.
     */
    status?: string;
    /**
     * Status details
     */
    statusmsg?: string;
    /**
     * Vnet identifier.
     */
    vnet: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/sdn/zones/\{zone\}
   */
  export interface nodesSdnZonesDiridx {
    subdir: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/sdn/zones
   */
  export interface nodesSdnZonesIndex {
    /**
     * Status of zone
     */
    status: string;
    /**
     * The SDN zone object identifier.
     */
    zone: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/services
   */
  export interface nodesServicesIndex {
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/services/\{service\}
   */
  export interface nodesServicesSrvcmdidx {
    subdir: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by POST /nodes/\{node\}/spiceshell
   */
  export interface nodesSpiceshellSpiceshell {
    host: string;
    password: string;
    proxy: string;
    'tls-port': number;
    type: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/storage/\{storage\}/content
   */
  export interface nodesStorageContentIndex {
    /**
     * Creation time (seconds since the UNIX Epoch).
     */
    ctime?: number;
    /**
     * If whole backup is encrypted, value is the fingerprint or '1'  if encrypted. Only useful for the Proxmox Backup Server storage type.
     */
    encrypted?: string;
    /**
     * Format identifier ('raw', 'qcow2', 'subvol', 'iso', 'tgz' ...)
     */
    format: string;
    /**
     * Optional notes. If they contain multiple lines, only the first one is returned here.
     */
    notes?: string;
    /**
     * Volume identifier of parent (for linked cloned).
     */
    parent?: string;
    /**
     * Protection status. Currently only supported for backups.
     */
    protected?: boolean;
    /**
     * Volume size in bytes.
     */
    size: number;
    /**
     * Used space. Please note that most storage plugins do not report anything useful here.
     */
    used?: number;
    /**
     * Last backup verification result, only useful for PBS storages.
     */
    verification?: {
      /**
       * Last backup verification state.
       */
      state: string;
      /**
       * Last backup verification UPID.
       */
      upid: string;
    };
    /**
     * Associated Owner VMID.
     */
    vmid?: number;
    /**
     * Volume identifier.
     */
    volid: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/storage/\{storage\}/content/\{volume\}
   */
  export interface nodesStorageContentInfo {
    /**
     * Format identifier ('raw', 'qcow2', 'subvol', 'iso', 'tgz' ...)
     */
    format: string;
    /**
     * Optional notes.
     */
    notes?: string;
    /**
     * The Path
     */
    path: string;
    /**
     * Protection status. Currently only supported for backups.
     */
    protected?: boolean;
    /**
     * Volume size in bytes.
     */
    size: number;
    /**
     * Used space. Please note that most storage plugins do not report anything useful here.
     */
    used: number;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/storage/\{storage\}
   */
  export interface nodesStorageDiridx {
    subdir: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/storage/\{storage\}/file-restore/list
   */
  export interface nodesStorageFileRestoreListList {
    /**
     * base64 path of the current entry
     */
    filepath: string;
    /**
     * If this entry is a leaf in the directory graph.
     */
    leaf: boolean;
    /**
     * Entry last-modified time (unix timestamp).
     */
    mtime?: number;
    /**
     * Entry file size.
     */
    size?: number;
    /**
     * Entry display text.
     */
    text: string;
    /**
     * Entry type.
     */
    type: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/storage
   */
  export interface nodesStorageIndex {
    /**
     * Set when storage is accessible.
     */
    active?: boolean;
    /**
     * Available storage space in bytes.
     */
    avail?: number;
    /**
     * Allowed storage content types.
     */
    content: string;
    /**
     * Set when storage is enabled (not disabled).
     */
    enabled?: boolean;
    /**
     * Shared flag from storage configuration.
     */
    shared?: boolean;
    /**
     * The storage identifier.
     */
    storage: string;
    /**
     * Total storage space in bytes.
     */
    total?: number;
    /**
     * Storage type.
     */
    type: string;
    /**
     * Used storage space in bytes.
     */
    used?: number;
    /**
     * Used fraction (used/total).
     */
    used_fraction?: number;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/storage/\{storage\}/prunebackups
   */
  export interface nodesStoragePrunebackupsDryrun {
    /**
     * Creation time of the backup (seconds since the UNIX epoch).
     */
    ctime: number;
    /**
     * Whether the backup would be kept or removed. Backups that are protected or don't use the standard naming scheme are not removed.
     */
    mark: string;
    /**
     * One of 'qemu', 'lxc', 'openvz' or 'unknown'.
     */
    type: string;
    /**
     * The VM the backup belongs to.
     */
    vmid?: number;
    /**
     * Backup volume ID.
     */
    volid: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/storage/\{storage\}/rrd
   */
  export interface nodesStorageRrdRrd {
    filename: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/storage/\{storage\}/rrddata
   */
  export interface nodesStorageRrddataRrddata {
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/syslog
   */
  export interface nodesSyslogSyslog {
    /**
     * Line number
     */
    n: number;
    /**
     * Line text
     */
    t: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/tasks/\{upid\}/log
   */
  export interface nodesTasksLogReadTaskLog {
    /**
     * Line number
     */
    n: number;
    /**
     * Line text
     */
    t: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/tasks
   */
  export interface nodesTasksNodeTasks {
    endtime?: number;
    id: string;
    node: string;
    pid: number;
    pstart: number;
    starttime: number;
    status?: string;
    type: string;
    upid: string;
    user: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/tasks/\{upid\}/status
   */
  export interface nodesTasksStatusReadTaskStatus {
    exitstatus?: string;
    id: string;
    node: string;
    pid: number;
    starttime: number;
    status: string;
    type: string;
    upid: string;
    user: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/tasks/\{upid\}
   */
  export interface nodesTasksUpidIndex {
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by POST /nodes/\{node\}/termproxy
   */
  export interface nodesTermproxyTermproxy {
    port: number;
    ticket: string;
    upid: string;
    user: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/time
   */
  export interface nodesTimeTime {
    /**
     * Seconds since 1970-01-01 00:00:00 (local time)
     */
    localtime: number;
    /**
     * Seconds since 1970-01-01 00:00:00 UTC.
     */
    time: number;
    /**
     * Time zone
     */
    timezone: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/version
   */
  export interface nodesVersionVersion {
    /**
     * The current installed Proxmox VE Release
     */
    release: string;
    /**
     * The short git commit hash ID from which this version was build
     */
    repoid: string;
    /**
     * The current installed pve-manager package version
     */
    version: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by POST /nodes/\{node\}/vncshell
   */
  export interface nodesVncshellVncshell {
    cert: string;
    port: number;
    ticket: string;
    upid: string;
    user: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/vncwebsocket
   */
  export interface nodesVncwebsocketVncwebsocket {
    port: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /nodes/\{node\}/vzdump/defaults
   */
  export interface nodesVzdumpDefaultsDefaults {
    /**
     * Backup all known guest systems on this host.
     */
    all?: boolean;
    /**
     * Limit I/O bandwidth (in KiB/s).
     */
    bwlimit?: number;
    /**
     * Compress dump file.
     */
    compress?: string;
    /**
     * Store resulting files to specified directory.
     */
    dumpdir?: string;
    /**
     * Exclude specified guest systems (assumes --all)
     */
    exclude?: string;
    /**
     * Exclude certain files/directories (shell globs). Paths starting with '/' are anchored to the container's root,  other paths match relative to each subdirectory.
     */
    'exclude-path'?: string[];
    /**
     * Set IO priority when using the BFQ scheduler. For snapshot and suspend mode backups of VMs, this only affects the compressor. A value of 8 means the idle priority is used, otherwise the best-effort priority is used with the specified value.
     */
    ionice?: number;
    /**
     * Maximal time to wait for the global lock (minutes).
     */
    lockwait?: number;
    /**
     * Deprecated: use 'notification-policy' instead.
     */
    mailnotification?: string;
    /**
     * Comma-separated list of email addresses or users that should receive email notifications. Has no effect if the 'notification-target' option  is set at the same time.
     */
    mailto?: string;
    /**
     * Deprecated: use 'prune-backups' instead. Maximal number of backup files per guest system.
     */
    maxfiles?: number;
    /**
     * Backup mode.
     */
    mode?: string;
    /**
     * Only run if executed on this node.
     */
    node?: string;
    /**
     * Template string for generating notes for the backup(s). It can contain variables which will be replaced by their values. Currently supported are \{\{cluster\}\}, \{\{guestname\}\}, \{\{node\}\}, and \{\{vmid\}\}, but more might be added in the future. Needs to be a single line, newline and backslash need to be escaped as '\n' and '\\' respectively.
     */
    'notes-template'?: string;
    /**
     * Specify when to send a notification
     */
    'notification-policy'?: string;
    /**
     * Determine the target to which notifications should be sent. Can either be a notification endpoint or a notification group. This option takes precedence over 'mailto', meaning that if both are  set, the 'mailto' option will be ignored.
     */
    'notification-target'?: string;
    /**
     * Other performance-related settings.
     */
    performance?: string;
    /**
     * Use pigz instead of gzip when N>0. N=1 uses half of cores, N>1 uses N as thread count.
     */
    pigz?: number;
    /**
     * Backup all known guest systems included in the specified pool.
     */
    pool?: string;
    /**
     * If true, mark backup(s) as protected.
     */
    protected?: boolean;
    /**
     * Use these retention options instead of those from the storage configuration.
     */
    'prune-backups'?: string;
    /**
     * Be quiet.
     */
    quiet?: boolean;
    /**
     * Prune older backups according to 'prune-backups'.
     */
    remove?: boolean;
    /**
     * Use specified hook script.
     */
    script?: string;
    /**
     * Exclude temporary files and logs.
     */
    stdexcludes?: boolean;
    /**
     * Stop running backup jobs on this host.
     */
    stop?: boolean;
    /**
     * Maximal time to wait until a guest system is stopped (minutes).
     */
    stopwait?: number;
    /**
     * Store resulting file to this storage.
     */
    storage?: string;
    /**
     * Store temporary files to specified directory.
     */
    tmpdir?: string;
    /**
     * The ID of the guest system you want to backup.
     */
    vmid?: string;
    /**
     * Zstd threads. N=0 uses half of the available cores, N>0 uses N as thread count.
     */
    zstd?: number;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /pools
   */
  export interface poolsIndex {
    comment?: string;
    members?: {
      id: string;
      node: string;
      storage?: string;
      type: string;
      vmid?: number;
    }[];
    poolid: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /pools/\{poolid\}
   */
  export interface poolsReadPool {
    comment?: string;
    members: {
      id: string;
      node: string;
      storage?: string;
      type: string;
      vmid?: number;
    }[];
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by POST /storage
   */
  export interface storageCreate {
    /**
     * Partial, possible server generated, configuration properties.
     */
    config?: {
      /**
       * The, possible auto-generated, encryption-key.
       */
      'encryption-key'?: string;
    };
    /**
     * The ID of the created storage.
     */
    storage: string;
    /**
     * The type of the created storage.
     */
    type: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /storage
   */
  export interface storageIndex {
    storage: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by PUT /storage/\{storage\}
   */
  export interface storageUpdate {
    /**
     * Partial, possible server generated, configuration properties.
     */
    config?: {
      /**
       * The, possible auto-generated, encryption-key.
       */
      'encryption-key'?: string;
    };
    /**
     * The ID of the created storage.
     */
    storage: string;
    /**
     * The type of the created storage.
     */
    type: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  /**
   * Returned by GET /version
   */
  export interface versionVersion {
    /**
     * The default console viewer to use.
     */
    console?: string;
    /**
     * The current Proxmox VE point release in `x.y` format.
     */
    release: string;
    /**
     * The short git revision from which this version was build.
     */
    repoid: string;
    /**
     * The full pve-manager package version of this node.
     */
    version: string;
    /**
     * additionalProperties
     */
    [additionalProperties: string]: any;
  }
  export interface Api {
    cluster: {
      /**
       * Cluster index.
       * GET /cluster
       * @allowtoken 1
       * @permissions {"user":"all"}
       */
      $get(): Promise<clusterIndex[]>;
      replication: {
        /**
         * List replication jobs.
         * GET /cluster/replication
         * @allowtoken 1
         * @permissions {"description":"Requires the VM.Audit permission on /vms/<vmid>.","user":"all"}
         */
        $get(): Promise<clusterReplicationIndex[]>;
        /**
         * Create a new replication job
         * POST /cluster/replication
         * @allowtoken 1
         * @permissions {"check":["perm","/storage",["Datastore.Allocate"]]}
         */
        $post(param: { comment?: String0_4096; disable?: boolean; id: pvereplicationjobid; rate?: Trate; remove_job?: Tremove_job; schedule?: pvecalendarevent; source?: pvenode; target: pvenode; type: Ttype }): Promise<null>;
        $(id: string): {
          /**
           * Mark replication job for removal.
           * DELETE /cluster/replication/\{id\}
           * @allowtoken 1
           * @permissions {"check":["perm","/storage",["Datastore.Allocate"]]}
           */
          $delete(param?: { force?: boolean; keep?: boolean }): Promise<null>;
          /**
           * Read replication job configuration.
           * GET /cluster/replication/\{id\}
           * @allowtoken 1
           * @permissions {"description":"Requires the VM.Audit permission on /vms/<vmid>.","user":"all"}
           */
          $get(): Promise<any>;
          /**
           * Update replication job configuration.
           * PUT /cluster/replication/\{id\}
           * @allowtoken 1
           * @permissions {"check":["perm","/storage",["Datastore.Allocate"]]}
           */
          $put(param?: { comment?: String0_4096; delete?: pveconfigidlist; digest?: String0_64; disable?: boolean; rate?: Trate; remove_job?: Tremove_job; schedule?: pvecalendarevent; source?: pvenode }): Promise<null>;
        };
      };
      metrics: {
        /**
         * Metrics index.
         * GET /cluster/metrics
         * @allowtoken 1
         * @permissions {"user":"all"}
         */
        $get(): Promise<clusterMetricsIndex[]>;
        server: {
          /**
           * List configured metric servers.
           * GET /cluster/metrics/server
           * @allowtoken 1
           * @permissions {"check":["perm","/",["Sys.Audit"]]}
           */
          $get(): Promise<clusterMetricsServerServerIndex[]>;
          $(id: string): {
            /**
             * Remove Metric server.
             * DELETE /cluster/metrics/server/\{id\}
             * @allowtoken 1
             * @permissions {"check":["perm","/",["Sys.Modify"]]}
             */
            $delete(): Promise<null>;
            /**
             * Read metric server configuration.
             * GET /cluster/metrics/server/\{id\}
             * @allowtoken 1
             * @permissions {"check":["perm","/",["Sys.Audit"]]}
             */
            $get(): Promise<any>;
            /**
             * Create a new external metric server config
             * POST /cluster/metrics/server/\{id\}
             * @allowtoken 1
             * @permissions {"check":["perm","/",["Sys.Modify"]]}
             */
            $post(param: { 'api-path-prefix'?: string; bucket?: string; disable?: boolean; influxdbproto?: Tinfluxdbproto; 'max-body-size'?: integer_Min1; mtu?: integer512_65536; organization?: string; path?: graphitepath; port: integer1_65536; proto?: Tproto; server: address; timeout?: integer_Min0; token?: string; type: pveconfigid; 'verify-certificate'?: boolean }): Promise<null>;
            /**
             * Update metric server configuration.
             * PUT /cluster/metrics/server/\{id\}
             * @allowtoken 1
             * @permissions {"check":["perm","/",["Sys.Modify"]]}
             */
            $put(param: { 'api-path-prefix'?: string; bucket?: string; delete?: pveconfigidlist; digest?: String0_64; disable?: boolean; influxdbproto?: Tinfluxdbproto; 'max-body-size'?: integer_Min1; mtu?: integer512_65536; organization?: string; path?: graphitepath; port: integer1_65536; proto?: Tproto; server: address; timeout?: integer_Min0; token?: string; 'verify-certificate'?: boolean }): Promise<null>;
          };
        };
      };
      notifications: {
        /**
         * Index for notification-related API endpoints.
         * GET /cluster/notifications
         * @allowtoken 1
         * @permissions {"user":"all"}
         */
        $get(): Promise<clusterNotificationsIndex[]>;
        endpoints: {
          /**
           * Index for all available endpoint types.
           * GET /cluster/notifications/endpoints
           * @allowtoken 1
           * @permissions {"user":"all"}
           */
          $get(): Promise<clusterNotificationsEndpointsEndpointsIndex[]>;
          sendmail: {
            /**
             * Returns a list of all sendmail endpoints
             * GET /cluster/notifications/endpoints/sendmail
             * @allowtoken 1
             * @permissions {"check":["or",["perm","/mapping/notifications",["Mapping.Modify"]],["perm","/mapping/notifications",["Mapping.Audit"]]]}
             */
            $get(): Promise<clusterNotificationsEndpointsSendmailGetSendmailEndpoints[]>;
            /**
             * Create a new sendmail endpoint
             * POST /cluster/notifications/endpoints/sendmail
             * @allowtoken 1
             * @permissions {"check":["perm","/mapping/notifications",["Mapping.Modify"]]}
             */
            $post(param: { author?: string; comment?: string; disable?: boolean; 'from-address'?: string; mailto?: Tmailto; 'mailto-user'?: Tmailtouser; name: pveconfigid_1 }): Promise<null>;
            $(name: string): {
              /**
               * Remove sendmail endpoint
               * DELETE /cluster/notifications/endpoints/sendmail/\{name\}
               * @allowtoken 1
               * @permissions {"check":["perm","/mapping/notifications",["Mapping.Modify"]]}
               */
              $delete(): Promise<null>;
              /**
               * Return a specific sendmail endpoint
               * GET /cluster/notifications/endpoints/sendmail/\{name\}
               * @allowtoken 1
               * @permissions {"check":["or",["perm","/mapping/notifications",["Mapping.Modify"]],["perm","/mapping/notifications",["Mapping.Audit"]]]}
               */
              $get(): Promise<clusterNotificationsEndpointsSendmailGetSendmailEndpoint>;
              /**
               * Update existing sendmail endpoint
               * PUT /cluster/notifications/endpoints/sendmail/\{name\}
               * @allowtoken 1
               * @permissions {"check":["perm","/mapping/notifications",["Mapping.Modify"]]}
               */
              $put(param?: { author?: string; comment?: string; delete?: Tdelete; digest?: String0_64; disable?: boolean; 'from-address'?: string; mailto?: Tmailto; 'mailto-user'?: Tmailtouser }): Promise<null>;
            };
          };
          gotify: {
            /**
             * Returns a list of all gotify endpoints
             * GET /cluster/notifications/endpoints/gotify
             * @allowtoken 1
             * @permissions {"check":["perm","/mapping/notifications",["Mapping.Audit"]]}
             */
            $get(): Promise<clusterNotificationsEndpointsGotifyGetGotifyEndpoints[]>;
            /**
             * Create a new gotify endpoint
             * POST /cluster/notifications/endpoints/gotify
             * @allowtoken 1
             * @permissions {"check":["perm","/mapping/notifications",["Mapping.Modify"]]}
             */
            $post(param: { comment?: string; disable?: boolean; name: pveconfigid_1; server: string; token: string }): Promise<null>;
            $(name: string): {
              /**
               * Remove gotify endpoint
               * DELETE /cluster/notifications/endpoints/gotify/\{name\}
               * @allowtoken 1
               * @permissions {"check":["perm","/mapping/notifications",["Mapping.Modify"]]}
               */
              $delete(): Promise<null>;
              /**
               * Return a specific gotify endpoint
               * GET /cluster/notifications/endpoints/gotify/\{name\}
               * @allowtoken 1
               * @permissions {"check":["or",["perm","/mapping/notifications",["Mapping.Modify"]],["perm","/mapping/notifications",["Mapping.Audit"]]]}
               */
              $get(): Promise<clusterNotificationsEndpointsGotifyGetGotifyEndpoint>;
              /**
               * Update existing gotify endpoint
               * PUT /cluster/notifications/endpoints/gotify/\{name\}
               * @allowtoken 1
               * @permissions {"check":["perm","/mapping/notifications",["Mapping.Modify"]]}
               */
              $put(param?: { comment?: string; delete?: Tdelete; digest?: String0_64; disable?: boolean; server?: string; token?: string }): Promise<null>;
            };
          };
          smtp: {
            /**
             * Returns a list of all smtp endpoints
             * GET /cluster/notifications/endpoints/smtp
             * @allowtoken 1
             * @permissions {"check":["or",["perm","/mapping/notifications",["Mapping.Modify"]],["perm","/mapping/notifications",["Mapping.Audit"]]]}
             */
            $get(): Promise<clusterNotificationsEndpointsSmtpGetSmtpEndpoints[]>;
            /**
             * Create a new smtp endpoint
             * POST /cluster/notifications/endpoints/smtp
             * @allowtoken 1
             * @permissions {"check":["or",["perm","/mapping/notifications",["Mapping.Modify"]]]}
             */
            $post(param: { author?: string; comment?: string; disable?: boolean; 'from-address': string; mailto?: Tmailto; 'mailto-user'?: Tmailtouser; mode?: Tmode; name: pveconfigid_1; password?: string; port?: integer; server: string; username?: string }): Promise<null>;
            $(name: string): {
              /**
               * Remove smtp endpoint
               * DELETE /cluster/notifications/endpoints/smtp/\{name\}
               * @allowtoken 1
               * @permissions {"check":["perm","/mapping/notifications",["Mapping.Modify"]]}
               */
              $delete(): Promise<null>;
              /**
               * Return a specific smtp endpoint
               * GET /cluster/notifications/endpoints/smtp/\{name\}
               * @allowtoken 1
               * @permissions {"check":["or",["perm","/mapping/notifications",["Mapping.Modify"]],["perm","/mapping/notifications",["Mapping.Audit"]]]}
               */
              $get(): Promise<clusterNotificationsEndpointsSmtpGetSmtpEndpoint>;
              /**
               * Update existing smtp endpoint
               * PUT /cluster/notifications/endpoints/smtp/\{name\}
               * @allowtoken 1
               * @permissions {"check":["or",["perm","/mapping/notifications",["Mapping.Modify"]]]}
               */
              $put(param?: { author?: string; comment?: string; delete?: Tdelete; digest?: String0_64; disable?: boolean; 'from-address'?: string; mailto?: Tmailto; 'mailto-user'?: Tmailtouser; mode?: Tmode; password?: string; port?: integer; server?: string; username?: string }): Promise<null>;
            };
          };
        };
        targets: {
          /**
           * Returns a list of all entities that can be used as notification targets.
           * GET /cluster/notifications/targets
           * @allowtoken 1
           * @permissions {"check":["or",["perm","/mapping/notifications",["Mapping.Modify"]],["perm","/mapping/notifications",["Mapping.Audit"]],["perm","/mapping/notifications",["Mapping.Use"]]]}
           */
          $get(): Promise<clusterNotificationsTargetsGetAllTargets[]>;
          $(name: string): {
            test: {
              /**
               * Send a test notification to a provided target.
               * POST /cluster/notifications/targets/\{name\}/test
               * @allowtoken 1
               * @permissions {"check":["or",["perm","/mapping/notifications",["Mapping.Modify"]],["perm","/mapping/notifications",["Mapping.Audit"]],["perm","/mapping/notifications",["Mapping.Use"]]]}
               */
              $post(): Promise<null>;
            };
          };
        };
        matchers: {
          /**
           * Returns a list of all matchers
           * GET /cluster/notifications/matchers
           * @allowtoken 1
           * @permissions {"check":["or",["perm","/mapping/notifications",["Mapping.Modify"]],["perm","/mapping/notifications",["Mapping.Audit"]],["perm","/mapping/notifications",["Mapping.Use"]]]}
           */
          $get(): Promise<clusterNotificationsMatchersGetMatchers[]>;
          /**
           * Create a new matcher
           * POST /cluster/notifications/matchers
           * @allowtoken 1
           * @permissions {"check":["perm","/mapping/notifications",["Mapping.Modify"]]}
           */
          $post(param: { comment?: string; disable?: boolean; 'invert-match'?: boolean; 'match-calendar'?: Tmatchcalendar; 'match-field'?: Tmatchcalendar; 'match-severity'?: Tmatchcalendar; mode?: Tmode_1; name: pveconfigid_1; target?: Tdelete }): Promise<null>;
          $(name: string): {
            /**
             * Remove matcher
             * DELETE /cluster/notifications/matchers/\{name\}
             * @allowtoken 1
             * @permissions {"check":["perm","/mapping/notifications",["Mapping.Modify"]]}
             */
            $delete(): Promise<null>;
            /**
             * Return a specific matcher
             * GET /cluster/notifications/matchers/\{name\}
             * @allowtoken 1
             * @permissions {"check":["or",["perm","/mapping/notifications",["Mapping.Modify"]],["perm","/mapping/notifications",["Mapping.Audit"]]]}
             */
            $get(): Promise<clusterNotificationsMatchersGetMatcher>;
            /**
             * Update existing matcher
             * PUT /cluster/notifications/matchers/\{name\}
             * @allowtoken 1
             * @permissions {"check":["perm","/mapping/notifications",["Mapping.Modify"]]}
             */
            $put(param?: { comment?: string; delete?: Tdelete; digest?: String0_64; disable?: boolean; 'invert-match'?: boolean; 'match-calendar'?: Tmatchcalendar; 'match-field'?: Tmatchcalendar; 'match-severity'?: Tmatchcalendar; mode?: Tmode_1; target?: Tdelete }): Promise<null>;
          };
        };
      };
      config: {
        /**
         * Directory index.
         * GET /cluster/config
         * @allowtoken 1
         * @permissions {"check":["perm","/",["Sys.Audit"]]}
         */
        $get(): Promise<clusterConfigIndex[]>;
        /**
         * Generate new cluster configuration. If no links given, default to local IP address as link0.
         * POST /cluster/config
         * @allowtoken 1
         */
        $post(param: { clustername: pvenode_1; link0?: Tlink; link1?: Tlink; link2?: Tlink; link3?: Tlink; link4?: Tlink; link5?: Tlink; link6?: Tlink; link7?: Tlink; nodeid?: integer_Min1; votes?: integer_Min1 }): Promise<string>;
        apiversion: {
          /**
           * Return the version of the cluster join API available on this node.
           * GET /cluster/config/apiversion
           * @allowtoken 1
           * @permissions {"check":["perm","/",["Sys.Audit"]]}
           */
          $get(): Promise<number>;
        };
        nodes: {
          /**
           * Corosync node list.
           * GET /cluster/config/nodes
           * @allowtoken 1
           * @permissions {"check":["perm","/",["Sys.Audit"]]}
           */
          $get(): Promise<clusterConfigNodesNodes[]>;
          $(node: string): {
            /**
             * Removes a node from the cluster configuration.
             * DELETE /cluster/config/nodes/\{node\}
             * @allowtoken 1
             */
            $delete(): Promise<null>;
            /**
             * Adds a node to the cluster configuration. This call is for internal use.
             * POST /cluster/config/nodes/\{node\}
             * @allowtoken 1
             */
            $post(param?: { apiversion?: integer; force?: boolean; link0?: Tlink; link1?: Tlink; link2?: Tlink; link3?: Tlink; link4?: Tlink; link5?: Tlink; link6?: Tlink; link7?: Tlink; new_node_ip?: ip; nodeid?: integer_Min1; votes?: integer_Min0 }): Promise<clusterConfigNodesAddnode>;
          };
        };
        join: {
          /**
           * Get information needed to join this cluster over the connected node.
           * GET /cluster/config/join
           * @allowtoken 1
           * @permissions {"check":["perm","/",["Sys.Audit"]]}
           */
          $get(param?: { node?: pvenode }): Promise<clusterConfigJoinJoinInfo>;
          /**
           * Joins this node into an existing cluster. If no links are given, default to IP resolved by node's hostname on single link (fallback fails for clusters with multiple links).
           * POST /cluster/config/join
           * @allowtoken 1
           */
          $post(param: { fingerprint: Tfingerprint; force?: boolean; hostname: string; link0?: Tlink; link1?: Tlink; link2?: Tlink; link3?: Tlink; link4?: Tlink; link5?: Tlink; link6?: Tlink; link7?: Tlink; nodeid?: integer_Min1; password: String0_128; votes?: integer_Min0 }): Promise<string>;
        };
        totem: {
          /**
           * Get corosync totem protocol settings.
           * GET /cluster/config/totem
           * @allowtoken 1
           * @permissions {"check":["perm","/",["Sys.Audit"]]}
           */
          $get(): Promise<any>;
        };
        qdevice: {
          /**
           * Get QDevice status
           * GET /cluster/config/qdevice
           * @allowtoken 1
           * @permissions {"check":["perm","/",["Sys.Audit"]]}
           */
          $get(): Promise<any>;
        };
      };
      firewall: {
        /**
         * Directory index.
         * GET /cluster/firewall
         * @allowtoken 1
         * @permissions {"user":"all"}
         */
        $get(): Promise<clusterFirewallIndex[]>;
        groups: {
          /**
           * List security groups.
           * GET /cluster/firewall/groups
           * @allowtoken 1
           * @permissions {"user":"all"}
           */
          $get(): Promise<clusterFirewallGroupsListSecurityGroups[]>;
          /**
           * Create new security group.
           * POST /cluster/firewall/groups
           * @allowtoken 1
           * @permissions {"check":["perm","/",["Sys.Modify"]]}
           */
          $post(param: { comment?: string; digest?: String0_64; group: Tgroup; rename?: Tgroup }): Promise<null>;
          $(group: string): {
            /**
             * Delete security group.
             * DELETE /cluster/firewall/groups/\{group\}
             * @allowtoken 1
             * @permissions {"check":["perm","/",["Sys.Modify"]]}
             */
            $delete(): Promise<null>;
            /**
             * List rules.
             * GET /cluster/firewall/groups/\{group\}
             * @allowtoken 1
             * @permissions {"check":["perm","/",["Sys.Audit"]]}
             */
            $get(): Promise<clusterFirewallGroupsGetRules[]>;
            /**
             * Create new rule.
             * POST /cluster/firewall/groups/\{group\}
             * @allowtoken 1
             * @permissions {"check":["perm","/",["Sys.Modify"]]}
             */
            $post(param: { action: Taction; comment?: string; dest?: pvefwaddrspec; digest?: String0_64; dport?: pvefwdportspec; enable?: integer_Min0; 'icmp-type'?: pvefwicmptypespec; iface?: pveiface; log?: Tlog; macro?: String0_128; pos?: integer_Min0; proto?: pvefwprotocolspec; source?: pvefwaddrspec; sport?: pvefwsportspec; type: Ttype_1 }): Promise<null>;
            $(pos: string): {
              /**
               * Delete rule.
               * DELETE /cluster/firewall/groups/\{group\}/\{pos\}
               * @allowtoken 1
               * @permissions {"check":["perm","/",["Sys.Modify"]]}
               */
              $delete(param?: { digest?: String0_64 }): Promise<null>;
              /**
               * Get single rule data.
               * GET /cluster/firewall/groups/\{group\}/\{pos\}
               * @allowtoken 1
               * @permissions {"check":["perm","/",["Sys.Audit"]]}
               */
              $get(): Promise<clusterFirewallGroupsGetRule>;
              /**
               * Modify rule data.
               * PUT /cluster/firewall/groups/\{group\}/\{pos\}
               * @allowtoken 1
               * @permissions {"check":["perm","/",["Sys.Modify"]]}
               */
              $put(param?: { action?: Taction; comment?: string; delete?: pveconfigidlist_1; dest?: pvefwaddrspec; digest?: String0_64; dport?: pvefwdportspec; enable?: integer_Min0; 'icmp-type'?: pvefwicmptypespec; iface?: pveiface; log?: Tlog; macro?: String0_128; moveto?: integer_Min0; proto?: pvefwprotocolspec; source?: pvefwaddrspec; sport?: pvefwsportspec; type?: Ttype_1 }): Promise<null>;
            };
          };
        };
        rules: {
          /**
           * List rules.
           * GET /cluster/firewall/rules
           * @allowtoken 1
           * @permissions {"check":["perm","/",["Sys.Audit"]]}
           */
          $get(): Promise<clusterFirewallRulesGetRules[]>;
          /**
           * Create new rule.
           * POST /cluster/firewall/rules
           * @allowtoken 1
           * @permissions {"check":["perm","/",["Sys.Modify"]]}
           */
          $post(param: { action: Taction; comment?: string; dest?: pvefwaddrspec; digest?: String0_64; dport?: pvefwdportspec; enable?: integer_Min0; 'icmp-type'?: pvefwicmptypespec; iface?: pveiface; log?: Tlog; macro?: String0_128; pos?: integer_Min0; proto?: pvefwprotocolspec; source?: pvefwaddrspec; sport?: pvefwsportspec; type: Ttype_1 }): Promise<null>;
          $(pos: string): {
            /**
             * Delete rule.
             * DELETE /cluster/firewall/rules/\{pos\}
             * @allowtoken 1
             * @permissions {"check":["perm","/",["Sys.Modify"]]}
             */
            $delete(param?: { digest?: String0_64 }): Promise<null>;
            /**
             * Get single rule data.
             * GET /cluster/firewall/rules/\{pos\}
             * @allowtoken 1
             * @permissions {"check":["perm","/",["Sys.Audit"]]}
             */
            $get(): Promise<clusterFirewallRulesGetRule>;
            /**
             * Modify rule data.
             * PUT /cluster/firewall/rules/\{pos\}
             * @allowtoken 1
             * @permissions {"check":["perm","/",["Sys.Modify"]]}
             */
            $put(param?: { action?: Taction; comment?: string; delete?: pveconfigidlist_1; dest?: pvefwaddrspec; digest?: String0_64; dport?: pvefwdportspec; enable?: integer_Min0; 'icmp-type'?: pvefwicmptypespec; iface?: pveiface; log?: Tlog; macro?: String0_128; moveto?: integer_Min0; proto?: pvefwprotocolspec; source?: pvefwaddrspec; sport?: pvefwsportspec; type?: Ttype_1 }): Promise<null>;
          };
        };
        ipset: {
          /**
           * List IPSets
           * GET /cluster/firewall/ipset
           * @allowtoken 1
           * @permissions {"check":["perm","/",["Sys.Audit"]]}
           */
          $get(): Promise<clusterFirewallIpsetIpsetIndex[]>;
          /**
           * Create new IPSet
           * POST /cluster/firewall/ipset
           * @allowtoken 1
           * @permissions {"check":["perm","/",["Sys.Modify"]]}
           */
          $post(param: { comment?: string; digest?: String0_64; name: Tname; rename?: Tname }): Promise<null>;
          $(name: string): {
            /**
             * Delete IPSet
             * DELETE /cluster/firewall/ipset/\{name\}
             * @allowtoken 1
             * @permissions {"check":["perm","/",["Sys.Modify"]]}
             */
            $delete(param?: { force?: boolean }): Promise<null>;
            /**
             * List IPSet content
             * GET /cluster/firewall/ipset/\{name\}
             * @allowtoken 1
             * @permissions {"check":["perm","/",["Sys.Audit"]]}
             */
            $get(): Promise<clusterFirewallIpsetGetIpset[]>;
            /**
             * Add IP or Network to IPSet.
             * POST /cluster/firewall/ipset/\{name\}
             * @allowtoken 1
             * @permissions {"check":["perm","/",["Sys.Modify"]]}
             */
            $post(param: { cidr: IPorCIDRorAlias; comment?: string; nomatch?: boolean }): Promise<null>;
            $(cidr: string): {
              /**
               * Remove IP or Network from IPSet.
               * DELETE /cluster/firewall/ipset/\{name\}/\{cidr\}
               * @allowtoken 1
               * @permissions {"check":["perm","/",["Sys.Modify"]]}
               */
              $delete(param?: { digest?: String0_64 }): Promise<null>;
              /**
               * Read IP or Network settings from IPSet.
               * GET /cluster/firewall/ipset/\{name\}/\{cidr\}
               * @allowtoken 1
               * @permissions {"check":["perm","/",["Sys.Audit"]]}
               */
              $get(): Promise<any>;
              /**
               * Update IP or Network settings
               * PUT /cluster/firewall/ipset/\{name\}/\{cidr\}
               * @allowtoken 1
               * @permissions {"check":["perm","/",["Sys.Modify"]]}
               */
              $put(param?: { comment?: string; digest?: String0_64; nomatch?: boolean }): Promise<null>;
            };
          };
        };
        aliases: {
          /**
           * List aliases
           * GET /cluster/firewall/aliases
           * @allowtoken 1
           * @permissions {"check":["perm","/",["Sys.Audit"]]}
           */
          $get(): Promise<clusterFirewallAliasesGetAliases[]>;
          /**
           * Create IP or Network Alias.
           * POST /cluster/firewall/aliases
           * @allowtoken 1
           * @permissions {"check":["perm","/",["Sys.Modify"]]}
           */
          $post(param: { cidr: IPorCIDR; comment?: string; name: Tname }): Promise<null>;
          $(name: string): {
            /**
             * Remove IP or Network alias.
             * DELETE /cluster/firewall/aliases/\{name\}
             * @allowtoken 1
             * @permissions {"check":["perm","/",["Sys.Modify"]]}
             */
            $delete(param?: { digest?: String0_64 }): Promise<null>;
            /**
             * Read alias.
             * GET /cluster/firewall/aliases/\{name\}
             * @allowtoken 1
             * @permissions {"check":["perm","/",["Sys.Audit"]]}
             */
            $get(): Promise<any>;
            /**
             * Update IP or Network alias.
             * PUT /cluster/firewall/aliases/\{name\}
             * @allowtoken 1
             * @permissions {"check":["perm","/",["Sys.Modify"]]}
             */
            $put(param: { cidr: IPorCIDR; comment?: string; digest?: String0_64; rename?: Tname }): Promise<null>;
          };
        };
        options: {
          /**
           * Get Firewall options.
           * GET /cluster/firewall/options
           * @allowtoken 1
           * @permissions {"check":["perm","/",["Sys.Audit"]]}
           */
          $get(): Promise<clusterFirewallOptionsGetOptions>;
          /**
           * Set Firewall options.
           * PUT /cluster/firewall/options
           * @allowtoken 1
           * @permissions {"check":["perm","/",["Sys.Modify"]]}
           */
          $put(param?: { delete?: pveconfigidlist_1; digest?: String0_64; ebtables?: boolean; enable?: integer_Min0; log_ratelimit?: Tlog_ratelimit; policy_in?: Tpolicy_in; policy_out?: Tpolicy_in }): Promise<null>;
        };
        macros: {
          /**
           * List available macros
           * GET /cluster/firewall/macros
           * @allowtoken 1
           * @permissions {"user":"all"}
           */
          $get(): Promise<clusterFirewallMacrosGetMacros[]>;
        };
        refs: {
          /**
           * Lists possible IPSet/Alias reference which are allowed in source/dest properties.
           * GET /cluster/firewall/refs
           * @allowtoken 1
           * @permissions {"check":["perm","/",["Sys.Audit"]]}
           */
          $get(param?: { type?: Ttype_2 }): Promise<clusterFirewallRefsRefs[]>;
        };
      };
      backup: {
        /**
         * List vzdump backup schedule.
         * GET /cluster/backup
         * @allowtoken 1
         * @permissions {"check":["perm","/",["Sys.Audit"]]}
         */
        $get(): Promise<clusterBackupIndex[]>;
        /**
         * Create new vzdump backup job.
         * POST /cluster/backup
         * @allowtoken 1
         * @permissions {"check":["perm","/",["Sys.Modify"]],"description":"The 'tmpdir', 'dumpdir' and 'script' parameters are additionally restricted to the 'root@pam' user."}
         */
        $post(param?: { all?: boolean; bwlimit?: integer_Min0; comment?: String0_512; compress?: Tcompress; dow?: pvedayofweeklist; dumpdir?: string; enabled?: boolean; exclude?: pvevmidlist; 'exclude-path'?: Tmatchcalendar; id?: pveconfigid_1; ionice?: integer0_8; lockwait?: integer_Min0; mailnotification?: Tmailnotification; mailto?: emailorusernamelist; maxfiles?: integer_Min1; mode?: Tmode_2; node?: pvenode; 'notes-template'?: String0_1024; 'notification-policy'?: Tnotificationpolicy; 'notification-target'?: pveconfigid_1; performance?: backupperformance; pigz?: integer; pool?: string; protected?: boolean; 'prune-backups'?: prunebackups; quiet?: boolean; remove?: boolean; 'repeat-missed'?: boolean; schedule?: pvecalendarevent; script?: string; starttime?: Tstarttime; stdexcludes?: boolean; stop?: boolean; stopwait?: integer_Min0; storage?: pvestorageid; tmpdir?: string; vmid?: pvevmidlist; zstd?: integer }): Promise<null>;
        $(id: string): {
          /**
           * Delete vzdump backup job definition.
           * DELETE /cluster/backup/\{id\}
           * @allowtoken 1
           * @permissions {"check":["perm","/",["Sys.Modify"]]}
           */
          $delete(): Promise<null>;
          /**
           * Read vzdump backup job definition.
           * GET /cluster/backup/\{id\}
           * @allowtoken 1
           * @permissions {"check":["perm","/",["Sys.Audit"]]}
           */
          $get(): Promise<any>;
          /**
           * Update vzdump backup job definition.
           * PUT /cluster/backup/\{id\}
           * @allowtoken 1
           * @permissions {"check":["perm","/",["Sys.Modify"]],"description":"The 'tmpdir', 'dumpdir' and 'script' parameters are additionally restricted to the 'root@pam' user."}
           */
          $put(param?: { all?: boolean; bwlimit?: integer_Min0; comment?: String0_512; compress?: Tcompress; delete?: pveconfigidlist_1; dow?: pvedayofweeklist; dumpdir?: string; enabled?: boolean; exclude?: pvevmidlist; 'exclude-path'?: Tmatchcalendar; ionice?: integer0_8; lockwait?: integer_Min0; mailnotification?: Tmailnotification; mailto?: emailorusernamelist; maxfiles?: integer_Min1; mode?: Tmode_2; node?: pvenode; 'notes-template'?: String0_1024; 'notification-policy'?: Tnotificationpolicy; 'notification-target'?: pveconfigid_1; performance?: backupperformance; pigz?: integer; pool?: string; protected?: boolean; 'prune-backups'?: prunebackups; quiet?: boolean; remove?: boolean; 'repeat-missed'?: boolean; schedule?: pvecalendarevent; script?: string; starttime?: Tstarttime; stdexcludes?: boolean; stop?: boolean; stopwait?: integer_Min0; storage?: pvestorageid; tmpdir?: string; vmid?: pvevmidlist; zstd?: integer }): Promise<null>;
          included_volumes: {
            /**
             * Returns included guests and the backup status of their disks. Optimized to be used in ExtJS tree views.
             * GET /cluster/backup/\{id\}/included_volumes
             * @allowtoken 1
             * @permissions {"check":["perm","/",["Sys.Audit"]]}
             */
            $get(): Promise<clusterBackupIncludedVolumesGetVolumeBackupIncluded>;
          };
        };
      };
      'backup-info': {
        /**
         * Index for backup info related endpoints
         * GET /cluster/backup-info
         * @allowtoken 1
         */
        $get(): Promise<clusterBackupInfoIndex[]>;
        'not-backed-up': {
          /**
           * Shows all guests which are not covered by any backup job.
           * GET /cluster/backup-info/not-backed-up
           * @allowtoken 1
           * @permissions {"check":["perm","/",["Sys.Audit"]]}
           */
          $get(): Promise<clusterBackupInfoNotBackedUpGetGuestsNotInBackup[]>;
        };
      };
      ha: {
        /**
         * Directory index.
         * GET /cluster/ha
         * @allowtoken 1
         * @permissions {"check":["perm","/",["Sys.Audit"]]}
         */
        $get(): Promise<clusterHaIndex[]>;
        resources: {
          /**
           * List HA resources.
           * GET /cluster/ha/resources
           * @allowtoken 1
           * @permissions {"check":["perm","/",["Sys.Audit"]]}
           */
          $get(param?: { type?: Ttype_3 }): Promise<clusterHaResourcesIndex[]>;
          /**
           * Create a new HA resource.
           * POST /cluster/ha/resources
           * @allowtoken 1
           * @permissions {"check":["perm","/",["Sys.Console"]]}
           */
          $post(param: { comment?: String0_4096; group?: pveconfigid_1; max_relocate?: integer_Min0; max_restart?: integer_Min0; sid: pveharesourceorvmid; state?: Tstate; type?: Ttype_3 }): Promise<null>;
          $(sid: string): {
            /**
             * Delete resource configuration.
             * DELETE /cluster/ha/resources/\{sid\}
             * @allowtoken 1
             * @permissions {"check":["perm","/",["Sys.Console"]]}
             */
            $delete(): Promise<null>;
            /**
             * Read resource configuration.
             * GET /cluster/ha/resources/\{sid\}
             * @allowtoken 1
             * @permissions {"check":["perm","/",["Sys.Audit"]]}
             */
            $get(): Promise<clusterHaResourcesRead>;
            /**
             * Update resource configuration.
             * PUT /cluster/ha/resources/\{sid\}
             * @allowtoken 1
             * @permissions {"check":["perm","/",["Sys.Console"]]}
             */
            $put(param?: { comment?: String0_4096; delete?: pveconfigidlist; digest?: String0_64; group?: pveconfigid_1; max_relocate?: integer_Min0; max_restart?: integer_Min0; state?: Tstate }): Promise<null>;
            migrate: {
              /**
               * Request resource migration (online) to another node.
               * POST /cluster/ha/resources/\{sid\}/migrate
               * @allowtoken 1
               * @permissions {"check":["perm","/",["Sys.Console"]]}
               */
              $post(param: { node: pvenode }): Promise<null>;
            };
            relocate: {
              /**
               * Request resource relocatzion to another node. This stops the service on the old node, and restarts it on the target node.
               * POST /cluster/ha/resources/\{sid\}/relocate
               * @allowtoken 1
               * @permissions {"check":["perm","/",["Sys.Console"]]}
               */
              $post(param: { node: pvenode }): Promise<null>;
            };
          };
        };
        groups: {
          /**
           * Get HA groups.
           * GET /cluster/ha/groups
           * @allowtoken 1
           * @permissions {"check":["perm","/",["Sys.Audit"]]}
           */
          $get(): Promise<clusterHaGroupsIndex[]>;
          /**
           * Create a new HA group.
           * POST /cluster/ha/groups
           * @allowtoken 1
           * @permissions {"check":["perm","/",["Sys.Console"]]}
           */
          $post(param: { comment?: String0_4096; group: pveconfigid_1; nodes: pvehagroupnodelist; nofailback?: boolean; restricted?: boolean; type?: Ttype_4 }): Promise<null>;
          $(group: string): {
            /**
             * Delete ha group configuration.
             * DELETE /cluster/ha/groups/\{group\}
             * @allowtoken 1
             * @permissions {"check":["perm","/",["Sys.Console"]]}
             */
            $delete(): Promise<null>;
            /**
             * Read ha group configuration.
             * GET /cluster/ha/groups/\{group\}
             * @allowtoken 1
             * @permissions {"check":["perm","/",["Sys.Audit"]]}
             */
            $get(): Promise<any>;
            /**
             * Update ha group configuration.
             * PUT /cluster/ha/groups/\{group\}
             * @allowtoken 1
             * @permissions {"check":["perm","/",["Sys.Console"]]}
             */
            $put(param?: { comment?: String0_4096; delete?: pveconfigidlist; digest?: String0_64; nodes?: pvehagroupnodelist; nofailback?: boolean; restricted?: boolean }): Promise<null>;
          };
        };
        status: {
          /**
           * Directory index.
           * GET /cluster/ha/status
           * @allowtoken 1
           * @permissions {"user":"all"}
           */
          $get(): Promise<clusterHaStatusIndex[]>;
          current: {
            /**
             * Get HA manger status.
             * GET /cluster/ha/status/current
             * @allowtoken 1
             * @permissions {"check":["perm","/",["Sys.Audit"]]}
             */
            $get(): Promise<clusterHaStatusCurrentStatus[]>;
          };
          manager_status: {
            /**
             * Get full HA manger status, including LRM status.
             * GET /cluster/ha/status/manager_status
             * @allowtoken 1
             * @permissions {"check":["perm","/",["Sys.Audit"]]}
             */
            $get(): Promise<any>;
          };
        };
      };
      acme: {
        /**
         * ACMEAccount index.
         * GET /cluster/acme
         * @allowtoken 1
         * @permissions {"user":"all"}
         */
        $get(): Promise<clusterAcmeIndex[]>;
        plugins: {
          /**
           * ACME plugin index.
           * GET /cluster/acme/plugins
           * @allowtoken 1
           * @permissions {"check":["perm","/",["Sys.Modify"]]}
           */
          $get(param?: { type?: Ttype_5 }): Promise<clusterAcmePluginsIndex[]>;
          /**
           * Add ACME plugin configuration.
           * POST /cluster/acme/plugins
           * @allowtoken 1
           * @permissions {"check":["perm","/",["Sys.Modify"]]}
           */
          $post(param: { api?: Tapi; data?: string; disable?: boolean; id: pveconfigid_1; nodes?: pvenodelist; type: Ttype_5; 'validation-delay'?: integer0_172800 }): Promise<null>;
          $(id: string): {
            /**
             * Delete ACME plugin configuration.
             * DELETE /cluster/acme/plugins/\{id\}
             * @allowtoken 1
             * @permissions {"check":["perm","/",["Sys.Modify"]]}
             */
            $delete(): Promise<null>;
            /**
             * Get ACME plugin configuration.
             * GET /cluster/acme/plugins/\{id\}
             * @allowtoken 1
             * @permissions {"check":["perm","/",["Sys.Modify"]]}
             */
            $get(): Promise<any>;
            /**
             * Update ACME plugin configuration.
             * PUT /cluster/acme/plugins/\{id\}
             * @allowtoken 1
             * @permissions {"check":["perm","/",["Sys.Modify"]]}
             */
            $put(param?: { api?: Tapi; data?: string; delete?: pveconfigidlist; digest?: String0_64; disable?: boolean; nodes?: pvenodelist; 'validation-delay'?: integer0_172800 }): Promise<null>;
          };
        };
        account: {
          /**
           * ACMEAccount index.
           * GET /cluster/acme/account
           * @allowtoken 1
           * @permissions {"user":"all"}
           */
          $get(): Promise<clusterAcmeAccountAccountIndex[]>;
          /**
           * Register a new ACME account with CA.
           * POST /cluster/acme/account
           * @allowtoken 1
           */
          $post(param: { contact: emaillist; directory?: Tdirectory; 'eab-hmac-key'?: string; 'eab-kid'?: string; name?: pveconfigid_1; tos_url?: string }): Promise<string>;
          $(name: string): {
            /**
             * Deactivate existing ACME account at CA.
             * DELETE /cluster/acme/account/\{name\}
             * @allowtoken 1
             */
            $delete(): Promise<string>;
            /**
             * Return existing ACME account information.
             * GET /cluster/acme/account/\{name\}
             * @allowtoken 1
             */
            $get(): Promise<clusterAcmeAccountGetAccount>;
            /**
             * Update existing ACME account information with CA. Note: not specifying any new account information triggers a refresh.
             * PUT /cluster/acme/account/\{name\}
             * @allowtoken 1
             */
            $put(param?: { contact?: emaillist }): Promise<string>;
          };
        };
        tos: {
          /**
           * Retrieve ACME TermsOfService URL from CA. Deprecated, please use /cluster/acme/meta.
           * GET /cluster/acme/tos
           * @allowtoken 1
           * @permissions {"user":"all"}
           */
          $get(param?: { directory?: Tdirectory }): Promise<string>;
        };
        meta: {
          /**
           * Retrieve ACME Directory Meta Information
           * GET /cluster/acme/meta
           * @allowtoken 1
           * @permissions {"check":["perm","/nodes/{node}",["Sys.Audit"]]}
           */
          $get(param?: { directory?: Tdirectory }): Promise<clusterAcmeMetaGetMeta>;
        };
        directories: {
          /**
           * Get named known ACME directory endpoints.
           * GET /cluster/acme/directories
           * @allowtoken 1
           * @permissions {"user":"all"}
           */
          $get(): Promise<clusterAcmeDirectoriesGetDirectories[]>;
        };
        'challenge-schema': {
          /**
           * Get schema of ACME challenge types.
           * GET /cluster/acme/challenge-schema
           * @allowtoken 1
           * @permissions {"user":"all"}
           */
          $get(): Promise<clusterAcmeChallengeSchemaChallengeschema[]>;
        };
      };
      ceph: {
        /**
         * Cluster ceph index.
         * GET /cluster/ceph
         * @allowtoken 1
         * @permissions {"user":"all"}
         */
        $get(): Promise<clusterCephCephindex[]>;
        metadata: {
          /**
           * Get ceph metadata.
           * GET /cluster/ceph/metadata
           * @allowtoken 1
           * @permissions {"check":["perm","/",["Sys.Audit","Datastore.Audit"],"any",1]}
           */
          $get(param?: { scope?: Tscope }): Promise<clusterCephMetadataMetadata>;
        };
        status: {
          /**
           * Get ceph status.
           * GET /cluster/ceph/status
           * @allowtoken 1
           * @permissions {"check":["perm","/",["Sys.Audit","Datastore.Audit"],"any",1]}
           */
          $get(): Promise<any>;
        };
        flags: {
          /**
           * get the status of all ceph flags
           * GET /cluster/ceph/flags
           * @allowtoken 1
           * @permissions {"check":["perm","/",["Sys.Audit"]]}
           */
          $get(): Promise<clusterCephFlagsGetAllFlags[]>;
          /**
           * Set/Unset multiple ceph flags at once.
           * PUT /cluster/ceph/flags
           * @allowtoken 1
           * @permissions {"check":["perm","/",["Sys.Modify"]]}
           */
          $put(param?: { nobackfill?: boolean; 'nodeep-scrub'?: boolean; nodown?: boolean; noin?: boolean; noout?: boolean; norebalance?: boolean; norecover?: boolean; noscrub?: boolean; notieragent?: boolean; noup?: boolean; pause?: boolean }): Promise<string>;
          $(flag: string): {
            /**
             * Get the status of a specific ceph flag.
             * GET /cluster/ceph/flags/\{flag\}
             * @allowtoken 1
             * @permissions {"check":["perm","/",["Sys.Audit"]]}
             */
            $get(): Promise<boolean>;
            /**
             * Set or clear (unset) a specific ceph flag
             * PUT /cluster/ceph/flags/\{flag\}
             * @allowtoken 1
             * @permissions {"check":["perm","/",["Sys.Modify"]]}
             */
            $put(param: { value: boolean }): Promise<null>;
          };
        };
      };
      jobs: {
        /**
         * Index for jobs related endpoints.
         * GET /cluster/jobs
         * @allowtoken 1
         * @permissions {"user":"all"}
         */
        $get(): Promise<clusterJobsIndex[]>;
        'realm-sync': {
          /**
           * List configured realm-sync-jobs.
           * GET /cluster/jobs/realm-sync
           * @allowtoken 1
           * @permissions {"check":["perm","/",["Sys.Audit"]]}
           */
          $get(): Promise<clusterJobsRealmSyncSyncjobIndex[]>;
          $(id: string): {
            /**
             * Delete realm-sync job definition.
             * DELETE /cluster/jobs/realm-sync/\{id\}
             * @allowtoken 1
             * @permissions {"check":["perm","/",["Sys.Modify"]]}
             */
            $delete(): Promise<null>;
            /**
             * Read realm-sync job definition.
             * GET /cluster/jobs/realm-sync/\{id\}
             * @allowtoken 1
             * @permissions {"check":["perm","/",["Sys.Audit"]]}
             */
            $get(): Promise<any>;
            /**
             * Create new realm-sync job.
             * POST /cluster/jobs/realm-sync/\{id\}
             * @allowtoken 1
             * @permissions {"check":["and",["perm","/access/realm/{realm}",["Realm.AllocateUser"]],["perm","/access/groups",["User.Modify"]]],"description":"'Realm.AllocateUser' on '/access/realm/<realm>' and 'User.Modify' permissions to '/access/groups/'."}
             */
            $post(param: { comment?: String0_512; 'enable-new'?: boolean; enabled?: boolean; realm?: pverealm; 'remove-vanished'?: Tremovevanished; schedule: pvecalendarevent; scope?: Tscope_1 }): Promise<null>;
            /**
             * Update realm-sync job definition.
             * PUT /cluster/jobs/realm-sync/\{id\}
             * @allowtoken 1
             * @permissions {"check":["and",["perm","/access/realm/{realm}",["Realm.AllocateUser"]],["perm","/access/groups",["User.Modify"]]],"description":"'Realm.AllocateUser' on '/access/realm/<realm>' and 'User.Modify' permissions to '/access/groups/'."}
             */
            $put(param: { comment?: String0_512; delete?: pveconfigidlist; 'enable-new'?: boolean; enabled?: boolean; 'remove-vanished'?: Tremovevanished; schedule: pvecalendarevent; scope?: Tscope_1 }): Promise<null>;
          };
        };
        'schedule-analyze': {
          /**
           * Returns a list of future schedule runtimes.
           * GET /cluster/jobs/schedule-analyze
           * @allowtoken 1
           * @permissions {"user":"all"}
           */
          $get(param: { iterations?: integer1_100; schedule: pvecalendarevent; starttime?: integer }): Promise<clusterJobsScheduleAnalyzeScheduleAnalyze[]>;
        };
      };
      mapping: {
        /**
         * List resource types.
         * GET /cluster/mapping
         * @allowtoken 1
         * @permissions {"user":"all"}
         */
        $get(): Promise<any[]>;
        pci: {
          /**
           * List PCI Hardware Mapping
           * GET /cluster/mapping/pci
           * @allowtoken 1
           * @permissions {"description":"Only lists entries where you have 'Mapping.Modify', 'Mapping.Use' or 'Mapping.Audit' permissions on '/mapping/pci/<id>'.","user":"all"}
           */
          $get(param?: { 'check-node'?: pvenode }): Promise<clusterMappingPciIndex[]>;
          /**
           * Create a new hardware mapping.
           * POST /cluster/mapping/pci
           * @allowtoken 1
           * @permissions {"check":["perm","/mapping/pci",["Mapping.Modify"]]}
           */
          $post(param: { description?: String0_4096; id: pveconfigid_1; map: Tmap; mdev?: boolean }): Promise<null>;
          $(id: string): {
            /**
             * Remove Hardware Mapping.
             * DELETE /cluster/mapping/pci/\{id\}
             * @allowtoken 1
             * @permissions {"check":["perm","/mapping/pci",["Mapping.Modify"]]}
             */
            $delete(): Promise<null>;
            /**
             * Get PCI Mapping.
             * GET /cluster/mapping/pci/\{id\}
             * @allowtoken 1
             * @permissions {"check":["or",["perm","/mapping/pci/{id}",["Mapping.Use"]],["perm","/mapping/pci/{id}",["Mapping.Modify"]],["perm","/mapping/pci/{id}",["Mapping.Audit"]]]}
             */
            $get(): Promise<any>;
            /**
             * Update a hardware mapping.
             * PUT /cluster/mapping/pci/\{id\}
             * @allowtoken 1
             * @permissions {"check":["perm","/mapping/pci/{id}",["Mapping.Modify"]]}
             */
            $put(param?: { delete?: pveconfigidlist; description?: String0_4096; digest?: String0_64; map?: Tmap; mdev?: boolean }): Promise<null>;
          };
        };
        usb: {
          /**
           * List USB Hardware Mappings
           * GET /cluster/mapping/usb
           * @allowtoken 1
           * @permissions {"description":"Only lists entries where you have 'Mapping.Modify', 'Mapping.Use' or 'Mapping.Audit' permissions on '/mapping/usb/<id>'.","user":"all"}
           */
          $get(param?: { 'check-node'?: pvenode }): Promise<clusterMappingUsbIndex[]>;
          /**
           * Create a new hardware mapping.
           * POST /cluster/mapping/usb
           * @allowtoken 1
           * @permissions {"check":["perm","/mapping/usb",["Mapping.Modify"]]}
           */
          $post(param: { description?: String0_4096; id: pveconfigid_1; map: Tmap_1 }): Promise<null>;
          $(id: string): {
            /**
             * Remove Hardware Mapping.
             * DELETE /cluster/mapping/usb/\{id\}
             * @allowtoken 1
             * @permissions {"check":["perm","/mapping/usb",["Mapping.Modify"]]}
             */
            $delete(): Promise<null>;
            /**
             * Get USB Mapping.
             * GET /cluster/mapping/usb/\{id\}
             * @allowtoken 1
             * @permissions {"check":["or",["perm","/mapping/usb/{id}",["Mapping.Audit"]],["perm","/mapping/usb/{id}",["Mapping.Use"]],["perm","/mapping/usb/{id}",["Mapping.Modify"]]]}
             */
            $get(): Promise<any>;
            /**
             * Update a hardware mapping.
             * PUT /cluster/mapping/usb/\{id\}
             * @allowtoken 1
             * @permissions {"check":["perm","/mapping/usb/{id}",["Mapping.Modify"]]}
             */
            $put(param: { delete?: pveconfigidlist; description?: String0_4096; digest?: String0_64; map: Tmap_1 }): Promise<null>;
          };
        };
      };
      sdn: {
        /**
         * Directory index.
         * GET /cluster/sdn
         * @allowtoken 1
         * @permissions {"check":["perm","/sdn",["SDN.Audit"]]}
         */
        $get(): Promise<clusterSdnIndex[]>;
        /**
         * Apply sdn controller changes && reload.
         * PUT /cluster/sdn
         * @allowtoken 1
         * @permissions {"check":["perm","/sdn",["SDN.Allocate"]]}
         */
        $put(): Promise<string>;
        vnets: {
          /**
           * SDN vnets index.
           * GET /cluster/sdn/vnets
           * @allowtoken 1
           * @permissions {"description":"Only list entries where you have 'SDN.Audit' or 'SDN.Allocate' permissions on '/sdn/zones/<zone>/<vnet>'","user":"all"}
           */
          $get(param?: { pending?: boolean; running?: boolean }): Promise<clusterSdnVnetsIndex[]>;
          /**
           * Create a new sdn vnet object.
           * POST /cluster/sdn/vnets
           * @allowtoken 1
           * @permissions {"check":["perm","/sdn/zones/{zone}",["SDN.Allocate"]]}
           */
          $post(param: { alias?: Talias; tag?: integer; type?: Ttype_6; vlanaware?: boolean; vnet: pvesdnvnetid; zone: string }): Promise<null>;
          $(vnet: string): {
            /**
             * Delete sdn vnet object configuration.
             * DELETE /cluster/sdn/vnets/\{vnet\}
             * @allowtoken 1
             * @permissions {"description":"Require 'SDN.Allocate' permission on '/sdn/zones/<zone>/<vnet>'","user":"all"}
             */
            $delete(): Promise<null>;
            /**
             * Read sdn vnet configuration.
             * GET /cluster/sdn/vnets/\{vnet\}
             * @allowtoken 1
             * @permissions {"description":"Require 'SDN.Audit' or 'SDN.Allocate' permissions on '/sdn/zones/<zone>/<vnet>'","user":"all"}
             */
            $get(param?: { pending?: boolean; running?: boolean }): Promise<any>;
            /**
             * Update sdn vnet object configuration.
             * PUT /cluster/sdn/vnets/\{vnet\}
             * @allowtoken 1
             * @permissions {"description":"Require 'SDN.Allocate' permission on '/sdn/zones/<zone>/<vnet>'","user":"all"}
             */
            $put(param?: { alias?: Talias; delete?: pveconfigidlist; digest?: String0_64; tag?: integer; vlanaware?: boolean; zone?: string }): Promise<null>;
            subnets: {
              /**
               * SDN subnets index.
               * GET /cluster/sdn/vnets/\{vnet\}/subnets
               * @allowtoken 1
               * @permissions {"description":"Only list entries where you have 'SDN.Audit' or 'SDN.Allocate' permissions on '/sdn/zones/<zone>/<vnet>'","user":"all"}
               */
              $get(param?: { pending?: boolean; running?: boolean }): Promise<clusterSdnVnetsSubnetsIndex[]>;
              /**
               * Create a new sdn subnet object.
               * POST /cluster/sdn/vnets/\{vnet\}/subnets
               * @allowtoken 1
               * @permissions {"description":"Require 'SDN.Allocate' permission on '/sdn/zones/<zone>/<vnet>'","user":"all"}
               */
              $post(param: { 'dhcp-dns-server'?: ip; 'dhcp-range'?: Tdhcprange; dnszoneprefix?: dnsname; gateway?: ip; snat?: boolean; subnet: pvesdnsubnetid; type: Ttype_7 }): Promise<null>;
              $(subnet: string): {
                /**
                 * Delete sdn subnet object configuration.
                 * DELETE /cluster/sdn/vnets/\{vnet\}/subnets/\{subnet\}
                 * @allowtoken 1
                 * @permissions {"description":"Require 'SDN.Allocate' permission on '/sdn/zones/<zone>/<vnet>'","user":"all"}
                 */
                $delete(): Promise<null>;
                /**
                 * Read sdn subnet configuration.
                 * GET /cluster/sdn/vnets/\{vnet\}/subnets/\{subnet\}
                 * @allowtoken 1
                 * @permissions {"description":"Require 'SDN.Audit' or 'SDN.Allocate' permissions on '/sdn/zones/<zone>/<vnet>'","user":"all"}
                 */
                $get(param?: { pending?: boolean; running?: boolean }): Promise<any>;
                /**
                 * Update sdn subnet object configuration.
                 * PUT /cluster/sdn/vnets/\{vnet\}/subnets/\{subnet\}
                 * @allowtoken 1
                 * @permissions {"description":"Require 'SDN.Allocate' permission on '/sdn/zones/<zone>/<vnet>'","user":"all"}
                 */
                $put(param?: { delete?: pveconfigidlist; 'dhcp-dns-server'?: ip; 'dhcp-range'?: Tdhcprange; digest?: String0_64; dnszoneprefix?: dnsname; gateway?: ip; snat?: boolean }): Promise<null>;
              };
            };
            ips: {
              /**
               * Delete IP Mappings in a VNet
               * DELETE /cluster/sdn/vnets/\{vnet\}/ips
               * @allowtoken 1
               * @permissions {"check":["perm","/sdn/zones/{zone}/{vnet}",["SDN.Allocate"]]}
               */
              $delete(param: { ip: ip; mac?: macaddr; zone: pvesdnzoneid }): Promise<null>;
              /**
               * Create IP Mapping in a VNet
               * POST /cluster/sdn/vnets/\{vnet\}/ips
               * @allowtoken 1
               * @permissions {"check":["perm","/sdn/zones/{zone}/{vnet}",["SDN.Allocate"]]}
               */
              $post(param: { ip: ip; mac?: macaddr; zone: pvesdnzoneid }): Promise<null>;
              /**
               * Update IP Mapping in a VNet
               * PUT /cluster/sdn/vnets/\{vnet\}/ips
               * @allowtoken 1
               * @permissions {"check":["perm","/sdn/zones/{zone}/{vnet}",["SDN.Allocate"]]}
               */
              $put(param: { ip: ip; mac?: macaddr; vmid?: pvevmid; zone: pvesdnzoneid }): Promise<null>;
            };
          };
        };
        zones: {
          /**
           * SDN zones index.
           * GET /cluster/sdn/zones
           * @allowtoken 1
           * @permissions {"description":"Only list entries where you have 'SDN.Audit' or 'SDN.Allocate' permissions on '/sdn/zones/<zone>'","user":"all"}
           */
          $get(param?: { pending?: boolean; running?: boolean; type?: Ttype_8 }): Promise<clusterSdnZonesIndex[]>;
          /**
           * Create a new sdn zone object.
           * POST /cluster/sdn/zones
           * @allowtoken 1
           * @permissions {"check":["perm","/sdn/zones",["SDN.Allocate"]]}
           */
          $post(param: { 'advertise-subnets'?: boolean; bridge?: string; 'bridge-disable-mac-learning'?: boolean; controller?: string; dhcp?: Tdhcp; 'disable-arp-nd-suppression'?: boolean; dns?: string; dnszone?: dnsname; 'dp-id'?: integer; exitnodes?: pvenodelist; 'exitnodes-local-routing'?: boolean; 'exitnodes-primary'?: pvenode; ipam?: string; mac?: macaddr; mtu?: integer; nodes?: pvenodelist; peers?: iplist; reversedns?: string; 'rt-import'?: pvesdnbgprtlist; tag?: integer_Min0; type: pveconfigid_2; 'vlan-protocol'?: Tvlanprotocol; 'vrf-vxlan'?: integer; 'vxlan-port'?: integer1_65536; zone: pvesdnzoneid }): Promise<null>;
          $(zone: string): {
            /**
             * Delete sdn zone object configuration.
             * DELETE /cluster/sdn/zones/\{zone\}
             * @allowtoken 1
             * @permissions {"check":["perm","/sdn/zones/{zone}",["SDN.Allocate"]]}
             */
            $delete(): Promise<null>;
            /**
             * Read sdn zone configuration.
             * GET /cluster/sdn/zones/\{zone\}
             * @allowtoken 1
             * @permissions {"check":["perm","/sdn/zones/{zone}",["SDN.Allocate"]]}
             */
            $get(param?: { pending?: boolean; running?: boolean }): Promise<any>;
            /**
             * Update sdn zone object configuration.
             * PUT /cluster/sdn/zones/\{zone\}
             * @allowtoken 1
             * @permissions {"check":["perm","/sdn/zones/{zone}",["SDN.Allocate"]]}
             */
            $put(param?: { 'advertise-subnets'?: boolean; bridge?: string; 'bridge-disable-mac-learning'?: boolean; controller?: string; delete?: pveconfigidlist; dhcp?: Tdhcp; digest?: String0_64; 'disable-arp-nd-suppression'?: boolean; dns?: string; dnszone?: dnsname; 'dp-id'?: integer; exitnodes?: pvenodelist; 'exitnodes-local-routing'?: boolean; 'exitnodes-primary'?: pvenode; ipam?: string; mac?: macaddr; mtu?: integer; nodes?: pvenodelist; peers?: iplist; reversedns?: string; 'rt-import'?: pvesdnbgprtlist; tag?: integer_Min0; 'vlan-protocol'?: Tvlanprotocol; 'vrf-vxlan'?: integer; 'vxlan-port'?: integer1_65536 }): Promise<null>;
          };
        };
        controllers: {
          /**
           * SDN controllers index.
           * GET /cluster/sdn/controllers
           * @allowtoken 1
           * @permissions {"description":"Only list entries where you have 'SDN.Audit' or 'SDN.Allocate' permissions on '/sdn/controllers/<controller>'","user":"all"}
           */
          $get(param?: { pending?: boolean; running?: boolean; type?: Ttype_9 }): Promise<clusterSdnControllersIndex[]>;
          /**
           * Create a new sdn controller object.
           * POST /cluster/sdn/controllers
           * @allowtoken 1
           * @permissions {"check":["perm","/sdn/controllers",["SDN.Allocate"]]}
           */
          $post(param: { asn?: integer0_4294967296; 'bgp-multipath-as-path-relax'?: boolean; controller: pvesdncontrollerid; ebgp?: boolean; 'ebgp-multihop'?: integer; 'isis-domain'?: string; 'isis-ifaces'?: pveifacelist; 'isis-net'?: string; loopback?: string; node?: pvenode; peers?: iplist; type: pveconfigid_3 }): Promise<null>;
          $(controller: string): {
            /**
             * Delete sdn controller object configuration.
             * DELETE /cluster/sdn/controllers/\{controller\}
             * @allowtoken 1
             * @permissions {"check":["perm","/sdn/controllers",["SDN.Allocate"]]}
             */
            $delete(): Promise<null>;
            /**
             * Read sdn controller configuration.
             * GET /cluster/sdn/controllers/\{controller\}
             * @allowtoken 1
             * @permissions {"check":["perm","/sdn/controllers/{controller}",["SDN.Allocate"]]}
             */
            $get(param?: { pending?: boolean; running?: boolean }): Promise<any>;
            /**
             * Update sdn controller object configuration.
             * PUT /cluster/sdn/controllers/\{controller\}
             * @allowtoken 1
             * @permissions {"check":["perm","/sdn/controllers",["SDN.Allocate"]]}
             */
            $put(param?: { asn?: integer0_4294967296; 'bgp-multipath-as-path-relax'?: boolean; delete?: pveconfigidlist; digest?: String0_64; ebgp?: boolean; 'ebgp-multihop'?: integer; 'isis-domain'?: string; 'isis-ifaces'?: pveifacelist; 'isis-net'?: string; loopback?: string; node?: pvenode; peers?: iplist }): Promise<null>;
          };
        };
        ipams: {
          /**
           * SDN ipams index.
           * GET /cluster/sdn/ipams
           * @allowtoken 1
           * @permissions {"description":"Only list entries where you have 'SDN.Audit' or 'SDN.Allocate' permissions on '/sdn/ipams/<ipam>'","user":"all"}
           */
          $get(param?: { type?: Ttype_10 }): Promise<clusterSdnIpamsIndex[]>;
          /**
           * Create a new sdn ipam object.
           * POST /cluster/sdn/ipams
           * @allowtoken 1
           * @permissions {"check":["perm","/sdn/ipams",["SDN.Allocate"]]}
           */
          $post(param: { ipam: pvesdnipamid; section?: integer; token?: string; type: pveconfigid_4; url?: string }): Promise<null>;
          $(ipam: string): {
            /**
             * Delete sdn ipam object configuration.
             * DELETE /cluster/sdn/ipams/\{ipam\}
             * @allowtoken 1
             * @permissions {"check":["perm","/sdn/ipams",["SDN.Allocate"]]}
             */
            $delete(): Promise<null>;
            /**
             * Read sdn ipam configuration.
             * GET /cluster/sdn/ipams/\{ipam\}
             * @allowtoken 1
             * @permissions {"check":["perm","/sdn/ipams/{ipam}",["SDN.Allocate"]]}
             */
            $get(): Promise<any>;
            /**
             * Update sdn ipam object configuration.
             * PUT /cluster/sdn/ipams/\{ipam\}
             * @allowtoken 1
             * @permissions {"check":["perm","/sdn/ipams",["SDN.Allocate"]]}
             */
            $put(param?: { delete?: pveconfigidlist; digest?: String0_64; section?: integer; token?: string; url?: string }): Promise<null>;
            status: {
              /**
               * List PVE IPAM Entries
               * GET /cluster/sdn/ipams/\{ipam\}/status
               * @allowtoken 1
               * @permissions {"description":"Only list entries where you have 'SDN.Audit' or 'SDN.Allocate' permissions on '/sdn/zones/<zone>/<vnet>'","user":"all"}
               */
              $get(): Promise<string[]>;
            };
          };
        };
        dns: {
          /**
           * SDN dns index.
           * GET /cluster/sdn/dns
           * @allowtoken 1
           * @permissions {"description":"Only list entries where you have 'SDN.Audit' or 'SDN.Allocate' permissions on '/sdn/dns/<dns>'","user":"all"}
           */
          $get(param?: { type?: Ttype_11 }): Promise<clusterSdnDnsIndex[]>;
          /**
           * Create a new sdn dns object.
           * POST /cluster/sdn/dns
           * @allowtoken 1
           * @permissions {"check":["perm","/sdn/dns",["SDN.Allocate"]]}
           */
          $post(param: { dns: pvesdndnsid; key: string; reversemaskv6?: integer; reversev6mask?: integer; ttl?: integer; type: pveconfigid_5; url: string }): Promise<null>;
          $(dns: string): {
            /**
             * Delete sdn dns object configuration.
             * DELETE /cluster/sdn/dns/\{dns\}
             * @allowtoken 1
             * @permissions {"check":["perm","/sdn/dns",["SDN.Allocate"]]}
             */
            $delete(): Promise<null>;
            /**
             * Read sdn dns configuration.
             * GET /cluster/sdn/dns/\{dns\}
             * @allowtoken 1
             * @permissions {"check":["perm","/sdn/dns/{dns}",["SDN.Allocate"]]}
             */
            $get(): Promise<any>;
            /**
             * Update sdn dns object configuration.
             * PUT /cluster/sdn/dns/\{dns\}
             * @allowtoken 1
             * @permissions {"check":["perm","/sdn/dns",["SDN.Allocate"]]}
             */
            $put(param?: { delete?: pveconfigidlist; digest?: String0_64; key?: string; reversemaskv6?: integer; ttl?: integer; url?: string }): Promise<null>;
          };
        };
      };
      log: {
        /**
         * Read cluster log
         * GET /cluster/log
         * @allowtoken 1
         * @permissions {"user":"all"}
         */
        $get(param?: { max?: integer_Min1 }): Promise<clusterLogLog[]>;
      };
      resources: {
        /**
         * Resources index (cluster wide).
         * GET /cluster/resources
         * @allowtoken 1
         * @permissions {"user":"all"}
         */
        $get(param?: { type?: Ttype_12 }): Promise<clusterResourcesResources[]>;
      };
      tasks: {
        /**
         * List recent tasks (cluster wide).
         * GET /cluster/tasks
         * @allowtoken 1
         * @permissions {"user":"all"}
         */
        $get(): Promise<clusterTasksTasks[]>;
      };
      options: {
        /**
         * Get datacenter options. Without 'Sys.Audit' on '/' not all options are returned.
         * GET /cluster/options
         * @allowtoken 1
         * @permissions {"check":["perm","/",["Sys.Audit"]],"user":"all"}
         */
        $get(): Promise<any>;
        /**
         * Set datacenter options.
         * PUT /cluster/options
         * @allowtoken 1
         * @permissions {"check":["perm","/",["Sys.Modify"]]}
         */
        $put(param?: { bwlimit?: Tbwlimit; console?: Tconsole; crs?: Tcrs; delete?: pveconfigidlist_1; description?: String0_65536; email_from?: emailopt; fencing?: Tfencing; ha?: Tha; http_proxy?: Thttp_proxy; keyboard?: Tkeyboard; language?: Tlanguage; mac_prefix?: macprefix; max_workers?: integer_Min1; migration?: Tmigration; migration_unsecure?: boolean; 'next-id'?: Tnextid; notify?: Tnotify; 'registered-tags'?: Tregisteredtags; 'tag-style'?: Ttagstyle; u2f?: Tu2f; 'user-tag-access'?: Tusertagaccess; webauthn?: Twebauthn }): Promise<null>;
      };
      status: {
        /**
         * Get cluster status information.
         * GET /cluster/status
         * @allowtoken 1
         * @permissions {"check":["perm","/",["Sys.Audit"]]}
         */
        $get(): Promise<clusterStatusGetStatus[]>;
      };
      nextid: {
        /**
         * Get next free VMID. Pass a VMID to assert that its free (at time of check).
         * GET /cluster/nextid
         * @allowtoken 1
         * @permissions {"user":"all"}
         */
        $get(param?: { vmid?: pvevmid }): Promise<number>;
      };
    };
    nodes: {
      /**
       * Cluster node index.
       * GET /nodes
       * @allowtoken 1
       * @permissions {"user":"all"}
       */
      $get(): Promise<nodesIndex[]>;
      $(node: string): {
        /**
         * Node index.
         * GET /nodes/\{node\}
         * @allowtoken 1
         * @permissions {"user":"all"}
         */
        $get(): Promise<nodesIndex2[]>;
        qemu: {
          /**
           * Virtual machine index (per node).
           * GET /nodes/\{node\}/qemu
           * @allowtoken 1
           * @permissions {"description":"Only list VMs where you have VM.Audit permissons on /vms/<vmid>.","user":"all"}
           */
          $get(param?: { full?: boolean }): Promise<nodesQemuVm[]>;
          /**
           * Create or restore a virtual machine.
           * POST /nodes/\{node\}/qemu
           * @allowtoken 1
           * @permissions {"description":"You need 'VM.Allocate' permissions on /vms/{vmid} or on the VM pool /pool/{pool}. For restore (option 'archive'), it is enough if the user has 'VM.Backup' permission and the VM already exists. If you create disks you need 'Datastore.AllocateSpace' on any used storage.If you use a bridge/vlan, you need 'SDN.Use' on any used bridge/vlan.","user":"all"}
           */
          $post(param: { acpi?: boolean; affinity?: pvecpuset; agent?: Tagent; arch?: Tarch; archive?: String0_255; args?: string; audio0?: Taudio0; autostart?: boolean; balloon?: integer_Min0; bios?: Tbios; boot?: pveqmboot; bootdisk?: pveqmbootdisk; bwlimit?: integer_Min0_1; cdrom?: pveqmide; cicustom?: pveqmcicustom; cipassword?: string; citype?: Tcitype; ciupgrade?: boolean; ciuser?: string; cores?: integer_Min1; cpu?: pvevmcpuconf; cpulimit?: Tcpulimit; cpuunits?: integer1_262144; description?: String0_8192; efidisk0?: Tefidisk0; force?: boolean; freeze?: boolean; hookscript?: pvevolumeid; hostpci0?: pveqmhostpci; hostpci1?: pveqmhostpci; hostpci2?: pveqmhostpci; hostpci3?: pveqmhostpci; hostpci4?: pveqmhostpci; hostpci5?: pveqmhostpci; hostpci6?: pveqmhostpci; hostpci7?: pveqmhostpci; hotplug?: pvehotplugfeatures; hugepages?: Thugepages; ide0?: Tide; ide1?: Tide; ide2?: Tide; ide3?: Tide; ipconfig0?: pveqmipconfig; ipconfig1?: pveqmipconfig; ipconfig2?: pveqmipconfig; ipconfig3?: pveqmipconfig; ipconfig4?: pveqmipconfig; ipconfig5?: pveqmipconfig; ipconfig6?: pveqmipconfig; ipconfig7?: pveqmipconfig; ivshmem?: Tivshmem; keephugepages?: boolean; keyboard?: Tkeyboard; kvm?: boolean; 'live-restore'?: boolean; localtime?: boolean; lock?: Tlock; machine?: Tmachine; memory?: Tmemory; migrate_downtime?: Tmigrate_downtime; migrate_speed?: integer_Min0; name?: dnsname; nameserver?: addresslist; net0?: Tnet; net1?: Tnet; net2?: Tnet; net3?: Tnet; numa?: boolean; numa0?: Tnuma; numa1?: Tnuma; numa2?: Tnuma; numa3?: Tnuma; onboot?: boolean; ostype?: Tostype; parallel0?: Tparallel; parallel1?: Tparallel; parallel2?: Tparallel; parallel3?: Tparallel; pool?: pvepoolid; protection?: boolean; reboot?: boolean; rng0?: Trng0; sata0?: Tsata; sata1?: Tsata; sata2?: Tsata; sata3?: Tsata; scsi0?: Tscsi; scsi1?: Tscsi; scsi2?: Tscsi; scsi3?: Tscsi; scsihw?: Tscsihw; searchdomain?: string; serial0?: Tserial; serial1?: Tserial; serial2?: Tserial; serial3?: Tserial; shares?: integer0_50000; smbios1?: pveqmsmbios1; smp?: integer_Min1; sockets?: integer_Min1; spice_enhancements?: Tspice_enhancements; sshkeys?: urlencoded; start?: boolean; startdate?: Tstartdate; startup?: pvestartuporder; storage?: pvestorageid; tablet?: boolean; tags?: pvetaglist; tdf?: boolean; template?: boolean; tpmstate0?: Ttpmstate0; unique?: boolean; unused0?: Tunused; unused1?: Tunused; unused2?: Tunused; unused3?: Tunused; usb0?: Tusb; usb1?: Tusb; usb2?: Tusb; usb3?: Tusb; vcpus?: integer_Min1; vga?: Tvga; virtio0?: Tvirtio; virtio1?: Tvirtio; virtio2?: Tvirtio; virtio3?: Tvirtio; vmgenid?: Tvmgenid; vmid: pvevmid; vmstatestorage?: pvestorageid; watchdog?: pveqmwatchdog }): Promise<string>;
          $(vmid: number): {
            /**
             * Destroy the VM and  all used/owned volumes. Removes any VM specific permissions and firewall rules
             * DELETE /nodes/\{node\}/qemu/\{vmid\}
             * @allowtoken 1
             * @permissions {"check":["perm","/vms/{vmid}",["VM.Allocate"]]}
             */
            $delete(param?: { 'destroy-unreferenced-disks'?: boolean; purge?: boolean; skiplock?: boolean }): Promise<string>;
            /**
             * Directory index
             * GET /nodes/\{node\}/qemu/\{vmid\}
             * @allowtoken 1
             * @permissions {"user":"all"}
             */
            $get(): Promise<nodesQemuVmdiridx[]>;
            firewall: {
              /**
               * Directory index.
               * GET /nodes/\{node\}/qemu/\{vmid\}/firewall
               * @allowtoken 1
               * @permissions {"user":"all"}
               */
              $get(): Promise<nodesQemuFirewallIndex[]>;
              rules: {
                /**
                 * List rules.
                 * GET /nodes/\{node\}/qemu/\{vmid\}/firewall/rules
                 * @allowtoken 1
                 * @permissions {"check":["perm","/vms/{vmid}",["VM.Audit"]]}
                 */
                $get(): Promise<nodesQemuFirewallRulesGetRules[]>;
                /**
                 * Create new rule.
                 * POST /nodes/\{node\}/qemu/\{vmid\}/firewall/rules
                 * @allowtoken 1
                 * @permissions {"check":["perm","/vms/{vmid}",["VM.Config.Network"]]}
                 */
                $post(param: { action: Taction; comment?: string; dest?: pvefwaddrspec; digest?: String0_64; dport?: pvefwdportspec; enable?: integer_Min0; 'icmp-type'?: pvefwicmptypespec; iface?: pveiface; log?: Tlog; macro?: String0_128; pos?: integer_Min0; proto?: pvefwprotocolspec; source?: pvefwaddrspec; sport?: pvefwsportspec; type: Ttype_1 }): Promise<null>;
                $(pos: string): {
                  /**
                   * Delete rule.
                   * DELETE /nodes/\{node\}/qemu/\{vmid\}/firewall/rules/\{pos\}
                   * @allowtoken 1
                   * @permissions {"check":["perm","/vms/{vmid}",["VM.Config.Network"]]}
                   */
                  $delete(param?: { digest?: String0_64 }): Promise<null>;
                  /**
                   * Get single rule data.
                   * GET /nodes/\{node\}/qemu/\{vmid\}/firewall/rules/\{pos\}
                   * @allowtoken 1
                   * @permissions {"check":["perm","/vms/{vmid}",["VM.Audit"]]}
                   */
                  $get(): Promise<nodesQemuFirewallRulesGetRule>;
                  /**
                   * Modify rule data.
                   * PUT /nodes/\{node\}/qemu/\{vmid\}/firewall/rules/\{pos\}
                   * @allowtoken 1
                   * @permissions {"check":["perm","/vms/{vmid}",["VM.Config.Network"]]}
                   */
                  $put(param?: { action?: Taction; comment?: string; delete?: pveconfigidlist_1; dest?: pvefwaddrspec; digest?: String0_64; dport?: pvefwdportspec; enable?: integer_Min0; 'icmp-type'?: pvefwicmptypespec; iface?: pveiface; log?: Tlog; macro?: String0_128; moveto?: integer_Min0; proto?: pvefwprotocolspec; source?: pvefwaddrspec; sport?: pvefwsportspec; type?: Ttype_1 }): Promise<null>;
                };
              };
              aliases: {
                /**
                 * List aliases
                 * GET /nodes/\{node\}/qemu/\{vmid\}/firewall/aliases
                 * @allowtoken 1
                 * @permissions {"check":["perm","/vms/{vmid}",["VM.Audit"]]}
                 */
                $get(): Promise<nodesQemuFirewallAliasesGetAliases[]>;
                /**
                 * Create IP or Network Alias.
                 * POST /nodes/\{node\}/qemu/\{vmid\}/firewall/aliases
                 * @allowtoken 1
                 * @permissions {"check":["perm","/vms/{vmid}",["VM.Config.Network"]]}
                 */
                $post(param: { cidr: IPorCIDR; comment?: string; name: Tname }): Promise<null>;
                $(name: string): {
                  /**
                   * Remove IP or Network alias.
                   * DELETE /nodes/\{node\}/qemu/\{vmid\}/firewall/aliases/\{name\}
                   * @allowtoken 1
                   * @permissions {"check":["perm","/vms/{vmid}",["VM.Config.Network"]]}
                   */
                  $delete(param?: { digest?: String0_64 }): Promise<null>;
                  /**
                   * Read alias.
                   * GET /nodes/\{node\}/qemu/\{vmid\}/firewall/aliases/\{name\}
                   * @allowtoken 1
                   * @permissions {"check":["perm","/vms/{vmid}",["VM.Audit"]]}
                   */
                  $get(): Promise<any>;
                  /**
                   * Update IP or Network alias.
                   * PUT /nodes/\{node\}/qemu/\{vmid\}/firewall/aliases/\{name\}
                   * @allowtoken 1
                   * @permissions {"check":["perm","/vms/{vmid}",["VM.Config.Network"]]}
                   */
                  $put(param: { cidr: IPorCIDR; comment?: string; digest?: String0_64; rename?: Tname }): Promise<null>;
                };
              };
              ipset: {
                /**
                 * List IPSets
                 * GET /nodes/\{node\}/qemu/\{vmid\}/firewall/ipset
                 * @allowtoken 1
                 * @permissions {"check":["perm","/vms/{vmid}",["VM.Audit"]]}
                 */
                $get(): Promise<nodesQemuFirewallIpsetIpsetIndex[]>;
                /**
                 * Create new IPSet
                 * POST /nodes/\{node\}/qemu/\{vmid\}/firewall/ipset
                 * @allowtoken 1
                 * @permissions {"check":["perm","/vms/{vmid}",["VM.Config.Network"]]}
                 */
                $post(param: { comment?: string; digest?: String0_64; name: Tname; rename?: Tname }): Promise<null>;
                $(name: string): {
                  /**
                   * Delete IPSet
                   * DELETE /nodes/\{node\}/qemu/\{vmid\}/firewall/ipset/\{name\}
                   * @allowtoken 1
                   * @permissions {"check":["perm","/vms/{vmid}",["VM.Config.Network"]]}
                   */
                  $delete(param?: { force?: boolean }): Promise<null>;
                  /**
                   * List IPSet content
                   * GET /nodes/\{node\}/qemu/\{vmid\}/firewall/ipset/\{name\}
                   * @allowtoken 1
                   * @permissions {"check":["perm","/vms/{vmid}",["VM.Audit"]]}
                   */
                  $get(): Promise<nodesQemuFirewallIpsetGetIpset[]>;
                  /**
                   * Add IP or Network to IPSet.
                   * POST /nodes/\{node\}/qemu/\{vmid\}/firewall/ipset/\{name\}
                   * @allowtoken 1
                   * @permissions {"check":["perm","/vms/{vmid}",["VM.Config.Network"]]}
                   */
                  $post(param: { cidr: IPorCIDRorAlias; comment?: string; nomatch?: boolean }): Promise<null>;
                  $(cidr: string): {
                    /**
                     * Remove IP or Network from IPSet.
                     * DELETE /nodes/\{node\}/qemu/\{vmid\}/firewall/ipset/\{name\}/\{cidr\}
                     * @allowtoken 1
                     * @permissions {"check":["perm","/vms/{vmid}",["VM.Config.Network"]]}
                     */
                    $delete(param?: { digest?: String0_64 }): Promise<null>;
                    /**
                     * Read IP or Network settings from IPSet.
                     * GET /nodes/\{node\}/qemu/\{vmid\}/firewall/ipset/\{name\}/\{cidr\}
                     * @allowtoken 1
                     * @permissions {"check":["perm","/vms/{vmid}",["VM.Audit"]]}
                     */
                    $get(): Promise<any>;
                    /**
                     * Update IP or Network settings
                     * PUT /nodes/\{node\}/qemu/\{vmid\}/firewall/ipset/\{name\}/\{cidr\}
                     * @allowtoken 1
                     * @permissions {"check":["perm","/vms/{vmid}",["VM.Config.Network"]]}
                     */
                    $put(param?: { comment?: string; digest?: String0_64; nomatch?: boolean }): Promise<null>;
                  };
                };
              };
              options: {
                /**
                 * Get VM firewall options.
                 * GET /nodes/\{node\}/qemu/\{vmid\}/firewall/options
                 * @allowtoken 1
                 * @permissions {"check":["perm","/vms/{vmid}",["VM.Audit"]]}
                 */
                $get(): Promise<nodesQemuFirewallOptionsGetOptions>;
                /**
                 * Set Firewall options.
                 * PUT /nodes/\{node\}/qemu/\{vmid\}/firewall/options
                 * @allowtoken 1
                 * @permissions {"check":["perm","/vms/{vmid}",["VM.Config.Network"]]}
                 */
                $put(param?: { delete?: pveconfigidlist_1; dhcp?: boolean; digest?: String0_64; enable?: boolean; ipfilter?: boolean; log_level_in?: Tlog; log_level_out?: Tlog; macfilter?: boolean; ndp?: boolean; policy_in?: Tpolicy_in; policy_out?: Tpolicy_in; radv?: boolean }): Promise<null>;
              };
              log: {
                /**
                 * Read firewall log
                 * GET /nodes/\{node\}/qemu/\{vmid\}/firewall/log
                 * @allowtoken 1
                 * @permissions {"check":["perm","/vms/{vmid}",["VM.Console"]]}
                 */
                $get(param?: { limit?: integer_Min0; since?: integer_Min0; start?: integer_Min0; until?: integer_Min0 }): Promise<nodesQemuFirewallLogLog[]>;
              };
              refs: {
                /**
                 * Lists possible IPSet/Alias reference which are allowed in source/dest properties.
                 * GET /nodes/\{node\}/qemu/\{vmid\}/firewall/refs
                 * @allowtoken 1
                 * @permissions {"check":["perm","/vms/{vmid}",["VM.Audit"]]}
                 */
                $get(param?: { type?: Ttype_2 }): Promise<nodesQemuFirewallRefsRefs[]>;
              };
            };
            agent: {
              /**
               * QEMU Guest Agent command index.
               * GET /nodes/\{node\}/qemu/\{vmid\}/agent
               * @allowtoken 1
               * @permissions {"user":"all"}
               */
              $get(): Promise<nodesQemuAgentIndex[]>;
              /**
               * Execute QEMU Guest Agent commands.
               * POST /nodes/\{node\}/qemu/\{vmid\}/agent
               * @allowtoken 1
               * @permissions {"check":["perm","/vms/{vmid}",["VM.Monitor"]]}
               */
              $post(param: { command: Tcommand }): Promise<any>;
              'fsfreeze-freeze': {
                /**
                 * Execute fsfreeze-freeze.
                 * POST /nodes/\{node\}/qemu/\{vmid\}/agent/fsfreeze-freeze
                 * @allowtoken 1
                 * @permissions {"check":["perm","/vms/{vmid}",["VM.Monitor"]]}
                 */
                $post(): Promise<any>;
              };
              'fsfreeze-status': {
                /**
                 * Execute fsfreeze-status.
                 * POST /nodes/\{node\}/qemu/\{vmid\}/agent/fsfreeze-status
                 * @allowtoken 1
                 * @permissions {"check":["perm","/vms/{vmid}",["VM.Monitor"]]}
                 */
                $post(): Promise<any>;
              };
              'fsfreeze-thaw': {
                /**
                 * Execute fsfreeze-thaw.
                 * POST /nodes/\{node\}/qemu/\{vmid\}/agent/fsfreeze-thaw
                 * @allowtoken 1
                 * @permissions {"check":["perm","/vms/{vmid}",["VM.Monitor"]]}
                 */
                $post(): Promise<any>;
              };
              fstrim: {
                /**
                 * Execute fstrim.
                 * POST /nodes/\{node\}/qemu/\{vmid\}/agent/fstrim
                 * @allowtoken 1
                 * @permissions {"check":["perm","/vms/{vmid}",["VM.Monitor"]]}
                 */
                $post(): Promise<any>;
              };
              'get-fsinfo': {
                /**
                 * Execute get-fsinfo.
                 * GET /nodes/\{node\}/qemu/\{vmid\}/agent/get-fsinfo
                 * @allowtoken 1
                 * @permissions {"check":["perm","/vms/{vmid}",["VM.Monitor"]]}
                 */
                $get(): Promise<any>;
              };
              'get-host-name': {
                /**
                 * Execute get-host-name.
                 * GET /nodes/\{node\}/qemu/\{vmid\}/agent/get-host-name
                 * @allowtoken 1
                 * @permissions {"check":["perm","/vms/{vmid}",["VM.Monitor"]]}
                 */
                $get(): Promise<any>;
              };
              'get-memory-block-info': {
                /**
                 * Execute get-memory-block-info.
                 * GET /nodes/\{node\}/qemu/\{vmid\}/agent/get-memory-block-info
                 * @allowtoken 1
                 * @permissions {"check":["perm","/vms/{vmid}",["VM.Monitor"]]}
                 */
                $get(): Promise<any>;
              };
              'get-memory-blocks': {
                /**
                 * Execute get-memory-blocks.
                 * GET /nodes/\{node\}/qemu/\{vmid\}/agent/get-memory-blocks
                 * @allowtoken 1
                 * @permissions {"check":["perm","/vms/{vmid}",["VM.Monitor"]]}
                 */
                $get(): Promise<any>;
              };
              'get-osinfo': {
                /**
                 * Execute get-osinfo.
                 * GET /nodes/\{node\}/qemu/\{vmid\}/agent/get-osinfo
                 * @allowtoken 1
                 * @permissions {"check":["perm","/vms/{vmid}",["VM.Monitor"]]}
                 */
                $get(): Promise<any>;
              };
              'get-time': {
                /**
                 * Execute get-time.
                 * GET /nodes/\{node\}/qemu/\{vmid\}/agent/get-time
                 * @allowtoken 1
                 * @permissions {"check":["perm","/vms/{vmid}",["VM.Monitor"]]}
                 */
                $get(): Promise<any>;
              };
              'get-timezone': {
                /**
                 * Execute get-timezone.
                 * GET /nodes/\{node\}/qemu/\{vmid\}/agent/get-timezone
                 * @allowtoken 1
                 * @permissions {"check":["perm","/vms/{vmid}",["VM.Monitor"]]}
                 */
                $get(): Promise<any>;
              };
              'get-users': {
                /**
                 * Execute get-users.
                 * GET /nodes/\{node\}/qemu/\{vmid\}/agent/get-users
                 * @allowtoken 1
                 * @permissions {"check":["perm","/vms/{vmid}",["VM.Monitor"]]}
                 */
                $get(): Promise<any>;
              };
              'get-vcpus': {
                /**
                 * Execute get-vcpus.
                 * GET /nodes/\{node\}/qemu/\{vmid\}/agent/get-vcpus
                 * @allowtoken 1
                 * @permissions {"check":["perm","/vms/{vmid}",["VM.Monitor"]]}
                 */
                $get(): Promise<any>;
              };
              info: {
                /**
                 * Execute info.
                 * GET /nodes/\{node\}/qemu/\{vmid\}/agent/info
                 * @allowtoken 1
                 * @permissions {"check":["perm","/vms/{vmid}",["VM.Monitor"]]}
                 */
                $get(): Promise<any>;
              };
              'network-get-interfaces': {
                /**
                 * Execute network-get-interfaces.
                 * GET /nodes/\{node\}/qemu/\{vmid\}/agent/network-get-interfaces
                 * @allowtoken 1
                 * @permissions {"check":["perm","/vms/{vmid}",["VM.Monitor"]]}
                 */
                $get(): Promise<any>;
              };
              ping: {
                /**
                 * Execute ping.
                 * POST /nodes/\{node\}/qemu/\{vmid\}/agent/ping
                 * @allowtoken 1
                 * @permissions {"check":["perm","/vms/{vmid}",["VM.Monitor"]]}
                 */
                $post(): Promise<any>;
              };
              shutdown: {
                /**
                 * Execute shutdown.
                 * POST /nodes/\{node\}/qemu/\{vmid\}/agent/shutdown
                 * @allowtoken 1
                 * @permissions {"check":["perm","/vms/{vmid}",["VM.Monitor"]]}
                 */
                $post(): Promise<any>;
              };
              'suspend-disk': {
                /**
                 * Execute suspend-disk.
                 * POST /nodes/\{node\}/qemu/\{vmid\}/agent/suspend-disk
                 * @allowtoken 1
                 * @permissions {"check":["perm","/vms/{vmid}",["VM.Monitor"]]}
                 */
                $post(): Promise<any>;
              };
              'suspend-hybrid': {
                /**
                 * Execute suspend-hybrid.
                 * POST /nodes/\{node\}/qemu/\{vmid\}/agent/suspend-hybrid
                 * @allowtoken 1
                 * @permissions {"check":["perm","/vms/{vmid}",["VM.Monitor"]]}
                 */
                $post(): Promise<any>;
              };
              'suspend-ram': {
                /**
                 * Execute suspend-ram.
                 * POST /nodes/\{node\}/qemu/\{vmid\}/agent/suspend-ram
                 * @allowtoken 1
                 * @permissions {"check":["perm","/vms/{vmid}",["VM.Monitor"]]}
                 */
                $post(): Promise<any>;
              };
              'set-user-password': {
                /**
                 * Sets the password for the given user to the given password
                 * POST /nodes/\{node\}/qemu/\{vmid\}/agent/set-user-password
                 * @allowtoken 1
                 * @permissions {"check":["perm","/vms/{vmid}",["VM.Monitor"]]}
                 */
                $post(param: { crypted?: boolean; password: String5_1024; username: string }): Promise<any>;
              };
              exec: {
                /**
                 * Executes the given command in the vm via the guest-agent and returns an object with the pid.
                 * POST /nodes/\{node\}/qemu/\{vmid\}/agent/exec
                 * @allowtoken 1
                 * @permissions {"check":["perm","/vms/{vmid}",["VM.Monitor"]]}
                 */
                $post(param: { command: Tcommand_1; 'input-data'?: String0_65536 }): Promise<nodesQemuAgentExecExec>;
              };
              'exec-status': {
                /**
                 * Gets the status of the given pid started by the guest-agent
                 * GET /nodes/\{node\}/qemu/\{vmid\}/agent/exec-status
                 * @allowtoken 1
                 * @permissions {"check":["perm","/vms/{vmid}",["VM.Monitor"]]}
                 */
                $get(param: { pid: integer }): Promise<nodesQemuAgentExecStatusExecStatus>;
              };
              'file-read': {
                /**
                 * Reads the given file via guest agent. Is limited to 16777216 bytes.
                 * GET /nodes/\{node\}/qemu/\{vmid\}/agent/file-read
                 * @allowtoken 1
                 * @permissions {"check":["perm","/vms/{vmid}",["VM.Monitor"]]}
                 */
                $get(param: { file: string }): Promise<nodesQemuAgentFileReadFileRead>;
              };
              'file-write': {
                /**
                 * Writes the given file via guest agent.
                 * POST /nodes/\{node\}/qemu/\{vmid\}/agent/file-write
                 * @allowtoken 1
                 * @permissions {"check":["perm","/vms/{vmid}",["VM.Monitor"]]}
                 */
                $post(param: { content: String0_61440; encode?: boolean; file: string }): Promise<null>;
              };
            };
            rrd: {
              /**
               * Read VM RRD statistics (returns PNG)
               * GET /nodes/\{node\}/qemu/\{vmid\}/rrd
               * @allowtoken 1
               * @permissions {"check":["perm","/vms/{vmid}",["VM.Audit"]]}
               */
              $get(param: { cf?: Tcf; ds: pveconfigidlist_1; timeframe: Ttimeframe }): Promise<nodesQemuRrdRrd>;
            };
            rrddata: {
              /**
               * Read VM RRD statistics
               * GET /nodes/\{node\}/qemu/\{vmid\}/rrddata
               * @allowtoken 1
               * @permissions {"check":["perm","/vms/{vmid}",["VM.Audit"]]}
               */
              $get(param: { cf?: Tcf; timeframe: Ttimeframe }): Promise<nodesQemuRrddataRrddata[]>;
            };
            config: {
              /**
               * Get the virtual machine configuration with pending configuration changes applied. Set the 'current' parameter to get the current configuration instead.
               * GET /nodes/\{node\}/qemu/\{vmid\}/config
               * @allowtoken 1
               * @permissions {"check":["perm","/vms/{vmid}",["VM.Audit"]]}
               */
              $get(param?: { current?: boolean; snapshot?: pveconfigid_6 }): Promise<nodesQemuConfigVmConfig>;
              /**
               * Set virtual machine options (asynchrounous API).
               * POST /nodes/\{node\}/qemu/\{vmid\}/config
               * @allowtoken 1
               * @permissions {"check":["perm","/vms/{vmid}",["VM.Config.Disk","VM.Config.CDROM","VM.Config.CPU","VM.Config.Memory","VM.Config.Network","VM.Config.HWType","VM.Config.Options","VM.Config.Cloudinit"],"any",1]}
               */
              $post(param?: { acpi?: boolean; affinity?: pvecpuset; agent?: Tagent; arch?: Tarch; args?: string; audio0?: Taudio0; autostart?: boolean; background_delay?: integer1_30; balloon?: integer_Min0; bios?: Tbios; boot?: pveqmboot; bootdisk?: pveqmbootdisk; cdrom?: pveqmide; cicustom?: pveqmcicustom; cipassword?: string; citype?: Tcitype; ciupgrade?: boolean; ciuser?: string; cores?: integer_Min1; cpu?: pvevmcpuconf; cpulimit?: Tcpulimit; cpuunits?: integer1_262144; delete?: pveconfigidlist_1; description?: String0_8192; digest?: String0_40; efidisk0?: Tefidisk0; force?: boolean; freeze?: boolean; hookscript?: pvevolumeid; hostpci0?: pveqmhostpci; hostpci1?: pveqmhostpci; hostpci2?: pveqmhostpci; hostpci3?: pveqmhostpci; hostpci4?: pveqmhostpci; hostpci5?: pveqmhostpci; hostpci6?: pveqmhostpci; hostpci7?: pveqmhostpci; hotplug?: pvehotplugfeatures; hugepages?: Thugepages; ide0?: Tide; ide1?: Tide; ide2?: Tide; ide3?: Tide; ipconfig0?: pveqmipconfig; ipconfig1?: pveqmipconfig; ipconfig2?: pveqmipconfig; ipconfig3?: pveqmipconfig; ipconfig4?: pveqmipconfig; ipconfig5?: pveqmipconfig; ipconfig6?: pveqmipconfig; ipconfig7?: pveqmipconfig; ivshmem?: Tivshmem; keephugepages?: boolean; keyboard?: Tkeyboard; kvm?: boolean; localtime?: boolean; lock?: Tlock; machine?: Tmachine; memory?: Tmemory; migrate_downtime?: Tmigrate_downtime; migrate_speed?: integer_Min0; name?: dnsname; nameserver?: addresslist; net0?: Tnet; net1?: Tnet; net2?: Tnet; net3?: Tnet; numa?: boolean; numa0?: Tnuma; numa1?: Tnuma; numa2?: Tnuma; numa3?: Tnuma; onboot?: boolean; ostype?: Tostype; parallel0?: Tparallel; parallel1?: Tparallel; parallel2?: Tparallel; parallel3?: Tparallel; protection?: boolean; reboot?: boolean; revert?: pveconfigidlist_1; rng0?: Trng0; sata0?: Tsata; sata1?: Tsata; sata2?: Tsata; sata3?: Tsata; scsi0?: Tscsi; scsi1?: Tscsi; scsi2?: Tscsi; scsi3?: Tscsi; scsihw?: Tscsihw; searchdomain?: string; serial0?: Tserial; serial1?: Tserial; serial2?: Tserial; serial3?: Tserial; shares?: integer0_50000; skiplock?: boolean; smbios1?: pveqmsmbios1; smp?: integer_Min1; sockets?: integer_Min1; spice_enhancements?: Tspice_enhancements; sshkeys?: urlencoded; startdate?: Tstartdate; startup?: pvestartuporder; tablet?: boolean; tags?: pvetaglist; tdf?: boolean; template?: boolean; tpmstate0?: Ttpmstate0; unused0?: Tunused; unused1?: Tunused; unused2?: Tunused; unused3?: Tunused; usb0?: Tusb; usb1?: Tusb; usb2?: Tusb; usb3?: Tusb; vcpus?: integer_Min1; vga?: Tvga; virtio0?: Tvirtio; virtio1?: Tvirtio; virtio2?: Tvirtio; virtio3?: Tvirtio; vmgenid?: Tvmgenid; vmstatestorage?: pvestorageid; watchdog?: pveqmwatchdog }): Promise<string>;
              /**
               * Set virtual machine options (synchrounous API) - You should consider using the POST method instead for any actions involving hotplug or storage allocation.
               * PUT /nodes/\{node\}/qemu/\{vmid\}/config
               * @allowtoken 1
               * @permissions {"check":["perm","/vms/{vmid}",["VM.Config.Disk","VM.Config.CDROM","VM.Config.CPU","VM.Config.Memory","VM.Config.Network","VM.Config.HWType","VM.Config.Options","VM.Config.Cloudinit"],"any",1]}
               */
              $put(param?: { acpi?: boolean; affinity?: pvecpuset; agent?: Tagent; arch?: Tarch; args?: string; audio0?: Taudio0; autostart?: boolean; balloon?: integer_Min0; bios?: Tbios; boot?: pveqmboot; bootdisk?: pveqmbootdisk; cdrom?: pveqmide; cicustom?: pveqmcicustom; cipassword?: string; citype?: Tcitype; ciupgrade?: boolean; ciuser?: string; cores?: integer_Min1; cpu?: pvevmcpuconf; cpulimit?: Tcpulimit; cpuunits?: integer1_262144; delete?: pveconfigidlist_1; description?: String0_8192; digest?: String0_40; efidisk0?: Tefidisk0; force?: boolean; freeze?: boolean; hookscript?: pvevolumeid; hostpci0?: pveqmhostpci; hostpci1?: pveqmhostpci; hostpci2?: pveqmhostpci; hostpci3?: pveqmhostpci; hostpci4?: pveqmhostpci; hostpci5?: pveqmhostpci; hostpci6?: pveqmhostpci; hostpci7?: pveqmhostpci; hotplug?: pvehotplugfeatures; hugepages?: Thugepages; ide0?: Tide; ide1?: Tide; ide2?: Tide; ide3?: Tide; ipconfig0?: pveqmipconfig; ipconfig1?: pveqmipconfig; ipconfig2?: pveqmipconfig; ipconfig3?: pveqmipconfig; ipconfig4?: pveqmipconfig; ipconfig5?: pveqmipconfig; ipconfig6?: pveqmipconfig; ipconfig7?: pveqmipconfig; ivshmem?: Tivshmem; keephugepages?: boolean; keyboard?: Tkeyboard; kvm?: boolean; localtime?: boolean; lock?: Tlock; machine?: Tmachine; memory?: Tmemory; migrate_downtime?: Tmigrate_downtime; migrate_speed?: integer_Min0; name?: dnsname; nameserver?: addresslist; net0?: Tnet; net1?: Tnet; net2?: Tnet; net3?: Tnet; numa?: boolean; numa0?: Tnuma; numa1?: Tnuma; numa2?: Tnuma; numa3?: Tnuma; onboot?: boolean; ostype?: Tostype; parallel0?: Tparallel; parallel1?: Tparallel; parallel2?: Tparallel; parallel3?: Tparallel; protection?: boolean; reboot?: boolean; revert?: pveconfigidlist_1; rng0?: Trng0; sata0?: Tsata; sata1?: Tsata; sata2?: Tsata; sata3?: Tsata; scsi0?: Tscsi; scsi1?: Tscsi; scsi2?: Tscsi; scsi3?: Tscsi; scsihw?: Tscsihw; searchdomain?: string; serial0?: Tserial; serial1?: Tserial; serial2?: Tserial; serial3?: Tserial; shares?: integer0_50000; skiplock?: boolean; smbios1?: pveqmsmbios1; smp?: integer_Min1; sockets?: integer_Min1; spice_enhancements?: Tspice_enhancements; sshkeys?: urlencoded; startdate?: Tstartdate; startup?: pvestartuporder; tablet?: boolean; tags?: pvetaglist; tdf?: boolean; template?: boolean; tpmstate0?: Ttpmstate0; unused0?: Tunused; unused1?: Tunused; unused2?: Tunused; unused3?: Tunused; usb0?: Tusb; usb1?: Tusb; usb2?: Tusb; usb3?: Tusb; vcpus?: integer_Min1; vga?: Tvga; virtio0?: Tvirtio; virtio1?: Tvirtio; virtio2?: Tvirtio; virtio3?: Tvirtio; vmgenid?: Tvmgenid; vmstatestorage?: pvestorageid; watchdog?: pveqmwatchdog }): Promise<null>;
            };
            pending: {
              /**
               * Get the virtual machine configuration with both current and pending values.
               * GET /nodes/\{node\}/qemu/\{vmid\}/pending
               * @allowtoken 1
               * @permissions {"check":["perm","/vms/{vmid}",["VM.Audit"]]}
               */
              $get(): Promise<nodesQemuPendingVmPending[]>;
            };
            cloudinit: {
              /**
               * Get the cloudinit configuration with both current and pending values.
               * GET /nodes/\{node\}/qemu/\{vmid\}/cloudinit
               * @allowtoken 1
               * @permissions {"check":["perm","/vms/{vmid}",["VM.Audit"]]}
               */
              $get(): Promise<nodesQemuCloudinitCloudinitPending[]>;
              /**
               * Regenerate and change cloudinit config drive.
               * PUT /nodes/\{node\}/qemu/\{vmid\}/cloudinit
               * @allowtoken 1
               * @permissions {"check":["perm","/vms/{vmid}",["VM.Config.Cloudinit"]]}
               */
              $put(): Promise<null>;
              dump: {
                /**
                 * Get automatically generated cloudinit config.
                 * GET /nodes/\{node\}/qemu/\{vmid\}/cloudinit/dump
                 * @allowtoken 1
                 * @permissions {"check":["perm","/vms/{vmid}",["VM.Audit"]]}
                 */
                $get(param: { type: Ttype_13 }): Promise<string>;
              };
            };
            unlink: {
              /**
               * Unlink/delete disk images.
               * PUT /nodes/\{node\}/qemu/\{vmid\}/unlink
               * @allowtoken 1
               * @permissions {"check":["perm","/vms/{vmid}",["VM.Config.Disk"]]}
               */
              $put(param: { force?: boolean; idlist: pveconfigidlist_1 }): Promise<null>;
            };
            vncproxy: {
              /**
               * Creates a TCP VNC proxy connections.
               * POST /nodes/\{node\}/qemu/\{vmid\}/vncproxy
               * @allowtoken 1
               * @permissions {"check":["perm","/vms/{vmid}",["VM.Console"]]}
               */
              $post(param?: { 'generate-password'?: boolean; websocket?: boolean }): Promise<nodesQemuVncproxyVncproxy>;
            };
            termproxy: {
              /**
               * Creates a TCP proxy connections.
               * POST /nodes/\{node\}/qemu/\{vmid\}/termproxy
               * @allowtoken 1
               * @permissions {"check":["perm","/vms/{vmid}",["VM.Console"]]}
               */
              $post(param?: { serial?: Tserial_1 }): Promise<nodesQemuTermproxyTermproxy>;
            };
            vncwebsocket: {
              /**
               * Opens a weksocket for VNC traffic.
               * GET /nodes/\{node\}/qemu/\{vmid\}/vncwebsocket
               * @allowtoken 1
               * @permissions {"check":["perm","/vms/{vmid}",["VM.Console"]],"description":"You also need to pass a valid ticket (vncticket)."}
               */
              $get(param: { port: integer5900_5999; vncticket: String0_512 }): Promise<nodesQemuVncwebsocketVncwebsocket>;
            };
            spiceproxy: {
              /**
               * Returns a SPICE configuration to connect to the VM.
               * POST /nodes/\{node\}/qemu/\{vmid\}/spiceproxy
               * @allowtoken 1
               * @permissions {"check":["perm","/vms/{vmid}",["VM.Console"]]}
               */
              $post(param?: { proxy?: address }): Promise<nodesQemuSpiceproxySpiceproxy>;
            };
            status: {
              /**
               * Directory index
               * GET /nodes/\{node\}/qemu/\{vmid\}/status
               * @allowtoken 1
               * @permissions {"user":"all"}
               */
              $get(): Promise<nodesQemuStatusVmcmdidx[]>;
              current: {
                /**
                 * Get virtual machine status.
                 * GET /nodes/\{node\}/qemu/\{vmid\}/status/current
                 * @allowtoken 1
                 * @permissions {"check":["perm","/vms/{vmid}",["VM.Audit"]]}
                 */
                $get(): Promise<nodesQemuStatusCurrentVmStatus>;
              };
              start: {
                /**
                 * Start virtual machine.
                 * POST /nodes/\{node\}/qemu/\{vmid\}/status/start
                 * @allowtoken 1
                 * @permissions {"check":["perm","/vms/{vmid}",["VM.PowerMgmt"]]}
                 */
                $post(param?: { 'force-cpu'?: string; machine?: Tmachine; migratedfrom?: pvenode; migration_network?: CIDR; migration_type?: Tmigration_type; skiplock?: boolean; stateuri?: String0_128; targetstorage?: storagepairlist; timeout?: integer_Min0 }): Promise<string>;
              };
              stop: {
                /**
                 * Stop virtual machine. The qemu process will exit immediately. Thisis akin to pulling the power plug of a running computer and may damage the VM data
                 * POST /nodes/\{node\}/qemu/\{vmid\}/status/stop
                 * @allowtoken 1
                 * @permissions {"check":["perm","/vms/{vmid}",["VM.PowerMgmt"]]}
                 */
                $post(param?: { keepActive?: boolean; migratedfrom?: pvenode; skiplock?: boolean; timeout?: integer_Min0 }): Promise<string>;
              };
              reset: {
                /**
                 * Reset virtual machine.
                 * POST /nodes/\{node\}/qemu/\{vmid\}/status/reset
                 * @allowtoken 1
                 * @permissions {"check":["perm","/vms/{vmid}",["VM.PowerMgmt"]]}
                 */
                $post(param?: { skiplock?: boolean }): Promise<string>;
              };
              shutdown: {
                /**
                 * Shutdown virtual machine. This is similar to pressing the power button on a physical machine.This will send an ACPI event for the guest OS, which should then proceed to a clean shutdown.
                 * POST /nodes/\{node\}/qemu/\{vmid\}/status/shutdown
                 * @allowtoken 1
                 * @permissions {"check":["perm","/vms/{vmid}",["VM.PowerMgmt"]]}
                 */
                $post(param?: { forceStop?: boolean; keepActive?: boolean; skiplock?: boolean; timeout?: integer_Min0 }): Promise<string>;
              };
              reboot: {
                /**
                 * Reboot the VM by shutting it down, and starting it again. Applies pending changes.
                 * POST /nodes/\{node\}/qemu/\{vmid\}/status/reboot
                 * @allowtoken 1
                 * @permissions {"check":["perm","/vms/{vmid}",["VM.PowerMgmt"]]}
                 */
                $post(param?: { timeout?: integer_Min0 }): Promise<string>;
              };
              suspend: {
                /**
                 * Suspend virtual machine.
                 * POST /nodes/\{node\}/qemu/\{vmid\}/status/suspend
                 * @allowtoken 1
                 * @permissions {"check":["perm","/vms/{vmid}",["VM.PowerMgmt"]],"description":"You need 'VM.PowerMgmt' on /vms/{vmid}, and if you have set 'todisk', you need also 'VM.Config.Disk' on /vms/{vmid} and 'Datastore.AllocateSpace' on the storage for the vmstate."}
                 */
                $post(param?: { skiplock?: boolean; statestorage?: pvestorageid; todisk?: boolean }): Promise<string>;
              };
              resume: {
                /**
                 * Resume virtual machine.
                 * POST /nodes/\{node\}/qemu/\{vmid\}/status/resume
                 * @allowtoken 1
                 * @permissions {"check":["perm","/vms/{vmid}",["VM.PowerMgmt"]]}
                 */
                $post(param?: { nocheck?: boolean; skiplock?: boolean }): Promise<string>;
              };
            };
            sendkey: {
              /**
               * Send key event to virtual machine.
               * PUT /nodes/\{node\}/qemu/\{vmid\}/sendkey
               * @allowtoken 1
               * @permissions {"check":["perm","/vms/{vmid}",["VM.Console"]]}
               */
              $put(param: { key: string; skiplock?: boolean }): Promise<null>;
            };
            feature: {
              /**
               * Check if feature for virtual machine is available.
               * GET /nodes/\{node\}/qemu/\{vmid\}/feature
               * @allowtoken 1
               * @permissions {"check":["perm","/vms/{vmid}",["VM.Audit"]]}
               */
              $get(param: { feature: Tfeature; snapname?: pveconfigid_6 }): Promise<nodesQemuFeatureVmFeature>;
            };
            clone: {
              /**
               * Create a copy of virtual machine/template.
               * POST /nodes/\{node\}/qemu/\{vmid\}/clone
               * @allowtoken 1
               * @permissions {"check":["and",["perm","/vms/{vmid}",["VM.Clone"]],["or",["perm","/vms/{newid}",["VM.Allocate"]],["perm","/pool/{pool}",["VM.Allocate"],"require_param","pool"]]],"description":"You need 'VM.Clone' permissions on /vms/{vmid}, and 'VM.Allocate' permissions on /vms/{newid} (or on the VM pool /pool/{pool}). You also need 'Datastore.AllocateSpace' on any used storage and 'SDN.Use' on any used bridge/vnet"}
               */
              $post(param: { bwlimit?: integer_Min0_1; description?: string; format?: Tformat; full?: boolean; name?: dnsname; newid: pvevmid; pool?: pvepoolid; snapname?: pveconfigid_6; storage?: pvestorageid; target?: pvenode }): Promise<string>;
            };
            move_disk: {
              /**
               * Move volume to different storage or to a different VM.
               * POST /nodes/\{node\}/qemu/\{vmid\}/move_disk
               * @allowtoken 1
               * @permissions {"check":["perm","/vms/{vmid}",["VM.Config.Disk"]],"description":"You need 'VM.Config.Disk' permissions on /vms/{vmid}, and 'Datastore.AllocateSpace' permissions on the storage. To move a disk to another VM, you need the permissions on the target VM as well."}
               */
              $post(param: { bwlimit?: integer_Min0_1; delete?: boolean; digest?: String0_40; disk: Tdisk; format?: Tformat; storage?: pvestorageid; 'target-digest'?: String0_40; 'target-disk'?: Tdisk; 'target-vmid'?: pvevmid }): Promise<string>;
            };
            migrate: {
              /**
               * Get preconditions for migration.
               * GET /nodes/\{node\}/qemu/\{vmid\}/migrate
               * @allowtoken 1
               * @permissions {"check":["perm","/vms/{vmid}",["VM.Migrate"]]}
               */
              $get(param?: { target?: pvenode }): Promise<nodesQemuMigrateMigrateVmPrecondition>;
              /**
               * Migrate virtual machine. Creates a new migration task.
               * POST /nodes/\{node\}/qemu/\{vmid\}/migrate
               * @allowtoken 1
               * @permissions {"check":["perm","/vms/{vmid}",["VM.Migrate"]]}
               */
              $post(param: { bwlimit?: integer_Min0_1; force?: boolean; migration_network?: CIDR; migration_type?: Tmigration_type; online?: boolean; target: pvenode; targetstorage?: storagepairlist; 'with-local-disks'?: boolean }): Promise<string>;
            };
            remote_migrate: {
              /**
               * Migrate virtual machine to a remote cluster. Creates a new migration task. EXPERIMENTAL feature!
               * POST /nodes/\{node\}/qemu/\{vmid\}/remote_migrate
               * @allowtoken 1
               * @permissions {"check":["perm","/vms/{vmid}",["VM.Migrate"]]}
               */
              $post(param: { bwlimit?: integer_Min0_1; delete?: boolean; online?: boolean; 'target-bridge': bridgepairlist; 'target-endpoint': proxmoxremote; 'target-storage': storagepairlist; 'target-vmid'?: pvevmid }): Promise<string>;
            };
            monitor: {
              /**
               * Execute QEMU monitor commands.
               * POST /nodes/\{node\}/qemu/\{vmid\}/monitor
               * @allowtoken 1
               * @permissions {"check":["perm","/vms/{vmid}",["VM.Monitor"]],"description":"Sys.Modify is required for (sub)commands which are not read-only ('info *' and 'help')"}
               */
              $post(param: { command: string }): Promise<string>;
            };
            resize: {
              /**
               * Extend volume size.
               * PUT /nodes/\{node\}/qemu/\{vmid\}/resize
               * @allowtoken 1
               * @permissions {"check":["perm","/vms/{vmid}",["VM.Config.Disk"]]}
               */
              $put(param: { digest?: String0_40; disk: Tdisk_1; size: Tsize; skiplock?: boolean }): Promise<string>;
            };
            snapshot: {
              /**
               * List all snapshots.
               * GET /nodes/\{node\}/qemu/\{vmid\}/snapshot
               * @allowtoken 1
               * @permissions {"check":["perm","/vms/{vmid}",["VM.Audit"]]}
               */
              $get(): Promise<nodesQemuSnapshotSnapshotList[]>;
              /**
               * Snapshot a VM.
               * POST /nodes/\{node\}/qemu/\{vmid\}/snapshot
               * @allowtoken 1
               * @permissions {"check":["perm","/vms/{vmid}",["VM.Snapshot"]]}
               */
              $post(param: { description?: string; snapname: pveconfigid_6; vmstate?: boolean }): Promise<string>;
              $(snapname: string): {
                /**
                 * Delete a VM snapshot.
                 * DELETE /nodes/\{node\}/qemu/\{vmid\}/snapshot/\{snapname\}
                 * @allowtoken 1
                 * @permissions {"check":["perm","/vms/{vmid}",["VM.Snapshot"]]}
                 */
                $delete(param?: { force?: boolean }): Promise<string>;
                /**
                 *
                 * @allowtoken 1
                 * @permissions {"user":"all"}
                 */
                $get(): Promise<nodesQemuSnapshotSnapshotCmdIdx[]>;
                config: {
                  /**
                   * Get snapshot configuration
                   * GET /nodes/\{node\}/qemu/\{vmid\}/snapshot/\{snapname\}/config
                   * @allowtoken 1
                   * @permissions {"check":["perm","/vms/{vmid}",["VM.Snapshot","VM.Snapshot.Rollback","VM.Audit"],"any",1]}
                   */
                  $get(): Promise<any>;
                  /**
                   * Update snapshot metadata.
                   * PUT /nodes/\{node\}/qemu/\{vmid\}/snapshot/\{snapname\}/config
                   * @allowtoken 1
                   * @permissions {"check":["perm","/vms/{vmid}",["VM.Snapshot"]]}
                   */
                  $put(param?: { description?: string }): Promise<null>;
                };
                rollback: {
                  /**
                   * Rollback VM state to specified snapshot.
                   * POST /nodes/\{node\}/qemu/\{vmid\}/snapshot/\{snapname\}/rollback
                   * @allowtoken 1
                   * @permissions {"check":["perm","/vms/{vmid}",["VM.Snapshot","VM.Snapshot.Rollback"],"any",1]}
                   */
                  $post(param?: { start?: boolean }): Promise<string>;
                };
              };
            };
            template: {
              /**
               * Create a Template.
               * POST /nodes/\{node\}/qemu/\{vmid\}/template
               * @allowtoken 1
               * @permissions {"check":["perm","/vms/{vmid}",["VM.Allocate"]],"description":"You need 'VM.Allocate' permissions on /vms/{vmid}"}
               */
              $post(param?: { disk?: Tdisk_1 }): Promise<string>;
            };
            mtunnel: {
              /**
               * Migration tunnel endpoint - only for internal use by VM migration.
               * POST /nodes/\{node\}/qemu/\{vmid\}/mtunnel
               * @allowtoken 1
               * @permissions {"check":["and",["perm","/vms/{vmid}",["VM.Allocate"]],["perm","/",["Sys.Incoming"]]],"description":"You need 'VM.Allocate' permissions on '/vms/{vmid}' and Sys.Incoming on '/'. Further permission checks happen during the actual migration."}
               */
              $post(param?: { bridges?: pvebridgeidlist; storages?: pvestorageidlist }): Promise<nodesQemuMtunnelMtunnel>;
            };
            mtunnelwebsocket: {
              /**
               * Migration tunnel endpoint for websocket upgrade - only for internal use by VM migration.
               * GET /nodes/\{node\}/qemu/\{vmid\}/mtunnelwebsocket
               * @allowtoken 1
               * @permissions {"description":"You need to pass a ticket valid for the selected socket. Tickets can be created via the mtunnel API call, which will check permissions accordingly.","user":"all"}
               */
              $get(param: { socket: string; ticket: string }): Promise<nodesQemuMtunnelwebsocketMtunnelwebsocket>;
            };
          };
        };
        lxc: {
          /**
           * LXC container index (per node).
           * GET /nodes/\{node\}/lxc
           * @allowtoken 1
           * @permissions {"description":"Only list CTs where you have VM.Audit permissons on /vms/<vmid>.","user":"all"}
           */
          $get(): Promise<nodesLxcVm[]>;
          /**
           * Create or restore a container.
           * POST /nodes/\{node\}/lxc
           * @allowtoken 1
           * @permissions {"description":"You need 'VM.Allocate' permissions on /vms/{vmid} or on the VM pool /pool/{pool}. For restore, it is enough if the user has 'VM.Backup' permission and the VM already exists. You also need 'Datastore.AllocateSpace' permissions on the storage.","user":"all"}
           */
          $post(param: { arch?: Tarch_1; bwlimit?: Tbwlimit_1; cmode?: Tcmode; console?: boolean; cores?: integer1_8192; cpulimit?: Tcpulimit_1; cpuunits?: integer0_500000; debug?: boolean; description?: String0_8192; dev0?: Tdev; dev1?: Tdev; dev2?: Tdev; dev3?: Tdev; features?: Tfeatures; force?: boolean; hookscript?: pvevolumeid; hostname?: dnsname_1; 'ignore-unpack-errors'?: boolean; lock?: Tlock_1; memory?: integer_Min16; mp0?: Tmp; mp1?: Tmp; mp2?: Tmp; mp3?: Tmp; nameserver?: lxcipwithllifacelist; net0?: Tnet_1; net1?: Tnet_1; net2?: Tnet_1; net3?: Tnet_1; onboot?: boolean; ostemplate: String0_255; ostype?: Tostype_1; password?: Tpassword; pool?: pvepoolid; protection?: boolean; restore?: boolean; rootfs?: Trootfs; searchdomain?: dnsnamelist; 'ssh-public-keys'?: string; start?: boolean; startup?: pvestartuporder; storage?: pvestorageid; swap?: integer_Min0; tags?: pvetaglist; template?: boolean; timezone?: pvecttimezone; tty?: integer0_6; unique?: boolean; unprivileged?: boolean; unused0?: Tunused_1; unused1?: Tunused_1; unused2?: Tunused_1; unused3?: Tunused_1; vmid: pvevmid }): Promise<string>;
          $(vmid: number): {
            /**
             * Destroy the container (also delete all uses files).
             * DELETE /nodes/\{node\}/lxc/\{vmid\}
             * @allowtoken 1
             * @permissions {"check":["perm","/vms/{vmid}",["VM.Allocate"]]}
             */
            $delete(param?: { 'destroy-unreferenced-disks'?: boolean; force?: boolean; purge?: boolean }): Promise<string>;
            /**
             * Directory index
             * GET /nodes/\{node\}/lxc/\{vmid\}
             * @allowtoken 1
             * @permissions {"user":"all"}
             */
            $get(): Promise<nodesLxcVmdiridx[]>;
            config: {
              /**
               * Get container configuration.
               * GET /nodes/\{node\}/lxc/\{vmid\}/config
               * @allowtoken 1
               * @permissions {"check":["perm","/vms/{vmid}",["VM.Audit"]]}
               */
              $get(param?: { current?: boolean; snapshot?: pveconfigid_6 }): Promise<nodesLxcConfigVmConfig>;
              /**
               * Set container options.
               * PUT /nodes/\{node\}/lxc/\{vmid\}/config
               * @allowtoken 1
               * @permissions {"check":["perm","/vms/{vmid}",["VM.Config.Disk","VM.Config.CPU","VM.Config.Memory","VM.Config.Network","VM.Config.Options"],"any",1],"description":"non-volume mount points in rootfs and mp[n] are restricted to root@pam"}
               */
              $put(param?: { arch?: Tarch_1; cmode?: Tcmode; console?: boolean; cores?: integer1_8192; cpulimit?: Tcpulimit_1; cpuunits?: integer0_500000; debug?: boolean; delete?: pveconfigidlist_1; description?: String0_8192; dev0?: Tdev; dev1?: Tdev; dev2?: Tdev; dev3?: Tdev; digest?: String0_40; features?: Tfeatures; hookscript?: pvevolumeid; hostname?: dnsname_1; lock?: Tlock_1; memory?: integer_Min16; mp0?: Tmp; mp1?: Tmp; mp2?: Tmp; mp3?: Tmp; nameserver?: lxcipwithllifacelist; net0?: Tnet_1; net1?: Tnet_1; net2?: Tnet_1; net3?: Tnet_1; onboot?: boolean; ostype?: Tostype_1; protection?: boolean; revert?: pveconfigidlist_1; rootfs?: Trootfs; searchdomain?: dnsnamelist; startup?: pvestartuporder; swap?: integer_Min0; tags?: pvetaglist; template?: boolean; timezone?: pvecttimezone; tty?: integer0_6; unprivileged?: boolean; unused0?: Tunused_1; unused1?: Tunused_1; unused2?: Tunused_1; unused3?: Tunused_1 }): Promise<null>;
            };
            status: {
              /**
               * Directory index
               * GET /nodes/\{node\}/lxc/\{vmid\}/status
               * @allowtoken 1
               * @permissions {"user":"all"}
               */
              $get(): Promise<nodesLxcStatusVmcmdidx[]>;
              current: {
                /**
                 * Get virtual machine status.
                 * GET /nodes/\{node\}/lxc/\{vmid\}/status/current
                 * @allowtoken 1
                 * @permissions {"check":["perm","/vms/{vmid}",["VM.Audit"]]}
                 */
                $get(): Promise<nodesLxcStatusCurrentVmStatus>;
              };
              start: {
                /**
                 * Start the container.
                 * POST /nodes/\{node\}/lxc/\{vmid\}/status/start
                 * @allowtoken 1
                 * @permissions {"check":["perm","/vms/{vmid}",["VM.PowerMgmt"]]}
                 */
                $post(param?: { debug?: boolean; skiplock?: boolean }): Promise<string>;
              };
              stop: {
                /**
                 * Stop the container. This will abruptly stop all processes running in the container.
                 * POST /nodes/\{node\}/lxc/\{vmid\}/status/stop
                 * @allowtoken 1
                 * @permissions {"check":["perm","/vms/{vmid}",["VM.PowerMgmt"]]}
                 */
                $post(param?: { skiplock?: boolean }): Promise<string>;
              };
              shutdown: {
                /**
                 * Shutdown the container. This will trigger a clean shutdown of the container, see lxc-stop(1) for details.
                 * POST /nodes/\{node\}/lxc/\{vmid\}/status/shutdown
                 * @allowtoken 1
                 * @permissions {"check":["perm","/vms/{vmid}",["VM.PowerMgmt"]]}
                 */
                $post(param?: { forceStop?: boolean; timeout?: integer_Min0 }): Promise<string>;
              };
              suspend: {
                /**
                 * Suspend the container. This is experimental.
                 * POST /nodes/\{node\}/lxc/\{vmid\}/status/suspend
                 * @allowtoken 1
                 * @permissions {"check":["perm","/vms/{vmid}",["VM.PowerMgmt"]]}
                 */
                $post(): Promise<string>;
              };
              resume: {
                /**
                 * Resume the container.
                 * POST /nodes/\{node\}/lxc/\{vmid\}/status/resume
                 * @allowtoken 1
                 * @permissions {"check":["perm","/vms/{vmid}",["VM.PowerMgmt"]]}
                 */
                $post(): Promise<string>;
              };
              reboot: {
                /**
                 * Reboot the container by shutting it down, and starting it again. Applies pending changes.
                 * POST /nodes/\{node\}/lxc/\{vmid\}/status/reboot
                 * @allowtoken 1
                 * @permissions {"check":["perm","/vms/{vmid}",["VM.PowerMgmt"]]}
                 */
                $post(param?: { timeout?: integer_Min0 }): Promise<string>;
              };
            };
            snapshot: {
              /**
               * List all snapshots.
               * GET /nodes/\{node\}/lxc/\{vmid\}/snapshot
               * @allowtoken 1
               * @permissions {"check":["perm","/vms/{vmid}",["VM.Audit"]]}
               */
              $get(): Promise<nodesLxcSnapshotList[]>;
              /**
               * Snapshot a container.
               * POST /nodes/\{node\}/lxc/\{vmid\}/snapshot
               * @allowtoken 1
               * @permissions {"check":["perm","/vms/{vmid}",["VM.Snapshot"]]}
               */
              $post(param: { description?: string; snapname: pveconfigid_6 }): Promise<string>;
              $(snapname: string): {
                /**
                 * Delete a LXC snapshot.
                 * DELETE /nodes/\{node\}/lxc/\{vmid\}/snapshot/\{snapname\}
                 * @allowtoken 1
                 * @permissions {"check":["perm","/vms/{vmid}",["VM.Snapshot"]]}
                 */
                $delete(param?: { force?: boolean }): Promise<string>;
                /**
                 *
                 * @allowtoken 1
                 * @permissions {"user":"all"}
                 */
                $get(): Promise<nodesLxcSnapshotSnapshotCmdIdx[]>;
                rollback: {
                  /**
                   * Rollback LXC state to specified snapshot.
                   * POST /nodes/\{node\}/lxc/\{vmid\}/snapshot/\{snapname\}/rollback
                   * @allowtoken 1
                   * @permissions {"check":["perm","/vms/{vmid}",["VM.Snapshot","VM.Snapshot.Rollback"],"any",1]}
                   */
                  $post(param?: { start?: boolean }): Promise<string>;
                };
                config: {
                  /**
                   * Get snapshot configuration
                   * GET /nodes/\{node\}/lxc/\{vmid\}/snapshot/\{snapname\}/config
                   * @allowtoken 1
                   * @permissions {"check":["perm","/vms/{vmid}",["VM.Snapshot","VM.Snapshot.Rollback","VM.Audit"],"any",1]}
                   */
                  $get(): Promise<any>;
                  /**
                   * Update snapshot metadata.
                   * PUT /nodes/\{node\}/lxc/\{vmid\}/snapshot/\{snapname\}/config
                   * @allowtoken 1
                   * @permissions {"check":["perm","/vms/{vmid}",["VM.Snapshot"]]}
                   */
                  $put(param?: { description?: string }): Promise<null>;
                };
              };
            };
            firewall: {
              /**
               * Directory index.
               * GET /nodes/\{node\}/lxc/\{vmid\}/firewall
               * @allowtoken 1
               * @permissions {"user":"all"}
               */
              $get(): Promise<nodesLxcFirewallIndex[]>;
              rules: {
                /**
                 * List rules.
                 * GET /nodes/\{node\}/lxc/\{vmid\}/firewall/rules
                 * @allowtoken 1
                 * @permissions {"check":["perm","/vms/{vmid}",["VM.Audit"]]}
                 */
                $get(): Promise<nodesLxcFirewallRulesGetRules[]>;
                /**
                 * Create new rule.
                 * POST /nodes/\{node\}/lxc/\{vmid\}/firewall/rules
                 * @allowtoken 1
                 * @permissions {"check":["perm","/vms/{vmid}",["VM.Config.Network"]]}
                 */
                $post(param: { action: Taction; comment?: string; dest?: pvefwaddrspec; digest?: String0_64; dport?: pvefwdportspec; enable?: integer_Min0; 'icmp-type'?: pvefwicmptypespec; iface?: pveiface; log?: Tlog; macro?: String0_128; pos?: integer_Min0; proto?: pvefwprotocolspec; source?: pvefwaddrspec; sport?: pvefwsportspec; type: Ttype_1 }): Promise<null>;
                $(pos: string): {
                  /**
                   * Delete rule.
                   * DELETE /nodes/\{node\}/lxc/\{vmid\}/firewall/rules/\{pos\}
                   * @allowtoken 1
                   * @permissions {"check":["perm","/vms/{vmid}",["VM.Config.Network"]]}
                   */
                  $delete(param?: { digest?: String0_64 }): Promise<null>;
                  /**
                   * Get single rule data.
                   * GET /nodes/\{node\}/lxc/\{vmid\}/firewall/rules/\{pos\}
                   * @allowtoken 1
                   * @permissions {"check":["perm","/vms/{vmid}",["VM.Audit"]]}
                   */
                  $get(): Promise<nodesLxcFirewallRulesGetRule>;
                  /**
                   * Modify rule data.
                   * PUT /nodes/\{node\}/lxc/\{vmid\}/firewall/rules/\{pos\}
                   * @allowtoken 1
                   * @permissions {"check":["perm","/vms/{vmid}",["VM.Config.Network"]]}
                   */
                  $put(param?: { action?: Taction; comment?: string; delete?: pveconfigidlist_1; dest?: pvefwaddrspec; digest?: String0_64; dport?: pvefwdportspec; enable?: integer_Min0; 'icmp-type'?: pvefwicmptypespec; iface?: pveiface; log?: Tlog; macro?: String0_128; moveto?: integer_Min0; proto?: pvefwprotocolspec; source?: pvefwaddrspec; sport?: pvefwsportspec; type?: Ttype_1 }): Promise<null>;
                };
              };
              aliases: {
                /**
                 * List aliases
                 * GET /nodes/\{node\}/lxc/\{vmid\}/firewall/aliases
                 * @allowtoken 1
                 * @permissions {"check":["perm","/vms/{vmid}",["VM.Audit"]]}
                 */
                $get(): Promise<nodesLxcFirewallAliasesGetAliases[]>;
                /**
                 * Create IP or Network Alias.
                 * POST /nodes/\{node\}/lxc/\{vmid\}/firewall/aliases
                 * @allowtoken 1
                 * @permissions {"check":["perm","/vms/{vmid}",["VM.Config.Network"]]}
                 */
                $post(param: { cidr: IPorCIDR; comment?: string; name: Tname }): Promise<null>;
                $(name: string): {
                  /**
                   * Remove IP or Network alias.
                   * DELETE /nodes/\{node\}/lxc/\{vmid\}/firewall/aliases/\{name\}
                   * @allowtoken 1
                   * @permissions {"check":["perm","/vms/{vmid}",["VM.Config.Network"]]}
                   */
                  $delete(param?: { digest?: String0_64 }): Promise<null>;
                  /**
                   * Read alias.
                   * GET /nodes/\{node\}/lxc/\{vmid\}/firewall/aliases/\{name\}
                   * @allowtoken 1
                   * @permissions {"check":["perm","/vms/{vmid}",["VM.Audit"]]}
                   */
                  $get(): Promise<any>;
                  /**
                   * Update IP or Network alias.
                   * PUT /nodes/\{node\}/lxc/\{vmid\}/firewall/aliases/\{name\}
                   * @allowtoken 1
                   * @permissions {"check":["perm","/vms/{vmid}",["VM.Config.Network"]]}
                   */
                  $put(param: { cidr: IPorCIDR; comment?: string; digest?: String0_64; rename?: Tname }): Promise<null>;
                };
              };
              ipset: {
                /**
                 * List IPSets
                 * GET /nodes/\{node\}/lxc/\{vmid\}/firewall/ipset
                 * @allowtoken 1
                 * @permissions {"check":["perm","/vms/{vmid}",["VM.Audit"]]}
                 */
                $get(): Promise<nodesLxcFirewallIpsetIpsetIndex[]>;
                /**
                 * Create new IPSet
                 * POST /nodes/\{node\}/lxc/\{vmid\}/firewall/ipset
                 * @allowtoken 1
                 * @permissions {"check":["perm","/vms/{vmid}",["VM.Config.Network"]]}
                 */
                $post(param: { comment?: string; digest?: String0_64; name: Tname; rename?: Tname }): Promise<null>;
                $(name: string): {
                  /**
                   * Delete IPSet
                   * DELETE /nodes/\{node\}/lxc/\{vmid\}/firewall/ipset/\{name\}
                   * @allowtoken 1
                   * @permissions {"check":["perm","/vms/{vmid}",["VM.Config.Network"]]}
                   */
                  $delete(param?: { force?: boolean }): Promise<null>;
                  /**
                   * List IPSet content
                   * GET /nodes/\{node\}/lxc/\{vmid\}/firewall/ipset/\{name\}
                   * @allowtoken 1
                   * @permissions {"check":["perm","/vms/{vmid}",["VM.Audit"]]}
                   */
                  $get(): Promise<nodesLxcFirewallIpsetGetIpset[]>;
                  /**
                   * Add IP or Network to IPSet.
                   * POST /nodes/\{node\}/lxc/\{vmid\}/firewall/ipset/\{name\}
                   * @allowtoken 1
                   * @permissions {"check":["perm","/vms/{vmid}",["VM.Config.Network"]]}
                   */
                  $post(param: { cidr: IPorCIDRorAlias; comment?: string; nomatch?: boolean }): Promise<null>;
                  $(cidr: string): {
                    /**
                     * Remove IP or Network from IPSet.
                     * DELETE /nodes/\{node\}/lxc/\{vmid\}/firewall/ipset/\{name\}/\{cidr\}
                     * @allowtoken 1
                     * @permissions {"check":["perm","/vms/{vmid}",["VM.Config.Network"]]}
                     */
                    $delete(param?: { digest?: String0_64 }): Promise<null>;
                    /**
                     * Read IP or Network settings from IPSet.
                     * GET /nodes/\{node\}/lxc/\{vmid\}/firewall/ipset/\{name\}/\{cidr\}
                     * @allowtoken 1
                     * @permissions {"check":["perm","/vms/{vmid}",["VM.Audit"]]}
                     */
                    $get(): Promise<any>;
                    /**
                     * Update IP or Network settings
                     * PUT /nodes/\{node\}/lxc/\{vmid\}/firewall/ipset/\{name\}/\{cidr\}
                     * @allowtoken 1
                     * @permissions {"check":["perm","/vms/{vmid}",["VM.Config.Network"]]}
                     */
                    $put(param?: { comment?: string; digest?: String0_64; nomatch?: boolean }): Promise<null>;
                  };
                };
              };
              options: {
                /**
                 * Get VM firewall options.
                 * GET /nodes/\{node\}/lxc/\{vmid\}/firewall/options
                 * @allowtoken 1
                 * @permissions {"check":["perm","/vms/{vmid}",["VM.Audit"]]}
                 */
                $get(): Promise<nodesLxcFirewallOptionsGetOptions>;
                /**
                 * Set Firewall options.
                 * PUT /nodes/\{node\}/lxc/\{vmid\}/firewall/options
                 * @allowtoken 1
                 * @permissions {"check":["perm","/vms/{vmid}",["VM.Config.Network"]]}
                 */
                $put(param?: { delete?: pveconfigidlist_1; dhcp?: boolean; digest?: String0_64; enable?: boolean; ipfilter?: boolean; log_level_in?: Tlog; log_level_out?: Tlog; macfilter?: boolean; ndp?: boolean; policy_in?: Tpolicy_in; policy_out?: Tpolicy_in; radv?: boolean }): Promise<null>;
              };
              log: {
                /**
                 * Read firewall log
                 * GET /nodes/\{node\}/lxc/\{vmid\}/firewall/log
                 * @allowtoken 1
                 * @permissions {"check":["perm","/vms/{vmid}",["VM.Console"]]}
                 */
                $get(param?: { limit?: integer_Min0; since?: integer_Min0; start?: integer_Min0; until?: integer_Min0 }): Promise<nodesLxcFirewallLogLog[]>;
              };
              refs: {
                /**
                 * Lists possible IPSet/Alias reference which are allowed in source/dest properties.
                 * GET /nodes/\{node\}/lxc/\{vmid\}/firewall/refs
                 * @allowtoken 1
                 * @permissions {"check":["perm","/vms/{vmid}",["VM.Audit"]]}
                 */
                $get(param?: { type?: Ttype_2 }): Promise<nodesLxcFirewallRefsRefs[]>;
              };
            };
            rrd: {
              /**
               * Read VM RRD statistics (returns PNG)
               * GET /nodes/\{node\}/lxc/\{vmid\}/rrd
               * @allowtoken 1
               * @permissions {"check":["perm","/vms/{vmid}",["VM.Audit"]]}
               */
              $get(param: { cf?: Tcf; ds: pveconfigidlist_1; timeframe: Ttimeframe }): Promise<nodesLxcRrdRrd>;
            };
            rrddata: {
              /**
               * Read VM RRD statistics
               * GET /nodes/\{node\}/lxc/\{vmid\}/rrddata
               * @allowtoken 1
               * @permissions {"check":["perm","/vms/{vmid}",["VM.Audit"]]}
               */
              $get(param: { cf?: Tcf; timeframe: Ttimeframe }): Promise<nodesLxcRrddataRrddata[]>;
            };
            vncproxy: {
              /**
               * Creates a TCP VNC proxy connections.
               * POST /nodes/\{node\}/lxc/\{vmid\}/vncproxy
               * @allowtoken 1
               * @permissions {"check":["perm","/vms/{vmid}",["VM.Console"]]}
               */
              $post(param?: { height?: integer16_2160; websocket?: boolean; width?: integer16_4096 }): Promise<nodesLxcVncproxyVncproxy>;
            };
            termproxy: {
              /**
               * Creates a TCP proxy connection.
               * POST /nodes/\{node\}/lxc/\{vmid\}/termproxy
               * @allowtoken 1
               * @permissions {"check":["perm","/vms/{vmid}",["VM.Console"]]}
               */
              $post(): Promise<nodesLxcTermproxyTermproxy>;
            };
            vncwebsocket: {
              /**
               * Opens a weksocket for VNC traffic.
               * GET /nodes/\{node\}/lxc/\{vmid\}/vncwebsocket
               * @allowtoken 1
               * @permissions {"check":["perm","/vms/{vmid}",["VM.Console"]],"description":"You also need to pass a valid ticket (vncticket)."}
               */
              $get(param: { port: integer5900_5999; vncticket: String0_512 }): Promise<nodesLxcVncwebsocketVncwebsocket>;
            };
            spiceproxy: {
              /**
               * Returns a SPICE configuration to connect to the CT.
               * POST /nodes/\{node\}/lxc/\{vmid\}/spiceproxy
               * @allowtoken 1
               * @permissions {"check":["perm","/vms/{vmid}",["VM.Console"]]}
               */
              $post(param?: { proxy?: address }): Promise<nodesLxcSpiceproxySpiceproxy>;
            };
            remote_migrate: {
              /**
               * Migrate the container to another cluster. Creates a new migration task. EXPERIMENTAL feature!
               * POST /nodes/\{node\}/lxc/\{vmid\}/remote_migrate
               * @allowtoken 1
               * @permissions {"check":["perm","/vms/{vmid}",["VM.Migrate"]]}
               */
              $post(param: { bwlimit?: Tbwlimit_1; delete?: boolean; online?: boolean; restart?: boolean; 'target-bridge': bridgepairlist; 'target-endpoint': proxmoxremote; 'target-storage': storagepairlist; 'target-vmid'?: pvevmid; timeout?: integer }): Promise<string>;
            };
            migrate: {
              /**
               * Migrate the container to another node. Creates a new migration task.
               * POST /nodes/\{node\}/lxc/\{vmid\}/migrate
               * @allowtoken 1
               * @permissions {"check":["perm","/vms/{vmid}",["VM.Migrate"]]}
               */
              $post(param: { bwlimit?: Tbwlimit_1; online?: boolean; restart?: boolean; target: pvenode; 'target-storage'?: storagepairlist; timeout?: integer }): Promise<string>;
            };
            feature: {
              /**
               * Check if feature for virtual machine is available.
               * GET /nodes/\{node\}/lxc/\{vmid\}/feature
               * @allowtoken 1
               * @permissions {"check":["perm","/vms/{vmid}",["VM.Audit"]]}
               */
              $get(param: { feature: Tfeature; snapname?: pveconfigid_6 }): Promise<nodesLxcFeatureVmFeature>;
            };
            template: {
              /**
               * Create a Template.
               * POST /nodes/\{node\}/lxc/\{vmid\}/template
               * @allowtoken 1
               * @permissions {"check":["perm","/vms/{vmid}",["VM.Allocate"]],"description":"You need 'VM.Allocate' permissions on /vms/{vmid}"}
               */
              $post(): Promise<null>;
            };
            clone: {
              /**
               * Create a container clone/copy
               * POST /nodes/\{node\}/lxc/\{vmid\}/clone
               * @allowtoken 1
               * @permissions {"check":["and",["perm","/vms/{vmid}",["VM.Clone"]],["or",["perm","/vms/{newid}",["VM.Allocate"]],["perm","/pool/{pool}",["VM.Allocate"],"require_param","pool"]]],"description":"You need 'VM.Clone' permissions on /vms/{vmid}, and 'VM.Allocate' permissions on /vms/{newid} (or on the VM pool /pool/{pool}). You also need 'Datastore.AllocateSpace' on any used storage, and 'SDN.Use' on any bridge."}
               */
              $post(param: { bwlimit?: Tbwlimit_1; description?: string; full?: boolean; hostname?: dnsname; newid: pvevmid; pool?: pvepoolid; snapname?: pveconfigid_6; storage?: pvestorageid; target?: pvenode }): Promise<string>;
            };
            resize: {
              /**
               * Resize a container mount point.
               * PUT /nodes/\{node\}/lxc/\{vmid\}/resize
               * @allowtoken 1
               * @permissions {"check":["perm","/vms/{vmid}",["VM.Config.Disk"],"any",1]}
               */
              $put(param: { digest?: String0_40; disk: Tdisk_2; size: Tsize }): Promise<string>;
            };
            move_volume: {
              /**
               * Move a rootfs-/mp-volume to a different storage or to a different container.
               * POST /nodes/\{node\}/lxc/\{vmid\}/move_volume
               * @allowtoken 1
               * @permissions {"check":["perm","/vms/{vmid}",["VM.Config.Disk"]],"description":"You need 'VM.Config.Disk' permissions on /vms/{vmid}, and 'Datastore.AllocateSpace' permissions on the storage. To move a volume to another container, you need the permissions on the target container as well."}
               */
              $post(param: { bwlimit?: Tbwlimit_1; delete?: boolean; digest?: String0_40; storage?: pvestorageid; 'target-digest'?: String0_40; 'target-vmid'?: pvevmid; 'target-volume'?: Ttargetvolume; volume: Ttargetvolume }): Promise<string>;
            };
            pending: {
              /**
               * Get container configuration, including pending changes.
               * GET /nodes/\{node\}/lxc/\{vmid\}/pending
               * @allowtoken 1
               * @permissions {"check":["perm","/vms/{vmid}",["VM.Audit"]]}
               */
              $get(): Promise<nodesLxcPendingVmPending[]>;
            };
            interfaces: {
              /**
               * Get IP addresses of the specified container interface.
               * GET /nodes/\{node\}/lxc/\{vmid\}/interfaces
               * @allowtoken 1
               * @permissions {"check":["perm","/vms/{vmid}",["VM.Audit"]]}
               */
              $get(): Promise<nodesLxcInterfacesIp[]>;
            };
            mtunnel: {
              /**
               * Migration tunnel endpoint - only for internal use by CT migration.
               * POST /nodes/\{node\}/lxc/\{vmid\}/mtunnel
               * @allowtoken 1
               * @permissions {"check":["and",["perm","/vms/{vmid}",["VM.Allocate"]],["perm","/",["Sys.Incoming"]]],"description":"You need 'VM.Allocate' permissions on '/vms/{vmid}' and Sys.Incoming on '/'. Further permission checks happen during the actual migration."}
               */
              $post(param?: { bridges?: pvebridgeidlist; storages?: pvestorageidlist }): Promise<nodesLxcMtunnelMtunnel>;
            };
            mtunnelwebsocket: {
              /**
               * Migration tunnel endpoint for websocket upgrade - only for internal use by VM migration.
               * GET /nodes/\{node\}/lxc/\{vmid\}/mtunnelwebsocket
               * @allowtoken 1
               * @permissions {"description":"You need to pass a ticket valid for the selected socket. Tickets can be created via the mtunnel API call, which will check permissions accordingly.","user":"all"}
               */
              $get(param: { socket: string; ticket: string }): Promise<nodesLxcMtunnelwebsocketMtunnelwebsocket>;
            };
          };
        };
        ceph: {
          /**
           * Directory index.
           * GET /nodes/\{node\}/ceph
           * @allowtoken 1
           * @permissions {"check":["perm","/",["Sys.Audit","Datastore.Audit"],"any",1]}
           */
          $get(): Promise<nodesCephIndex[]>;
          cfg: {
            /**
             * Directory index.
             * GET /nodes/\{node\}/ceph/cfg
             * @allowtoken 1
             * @permissions {"user":"all"}
             */
            $get(): Promise<nodesCephCfgIndex[]>;
            raw: {
              /**
               * Get the Ceph configuration file.
               * GET /nodes/\{node\}/ceph/cfg/raw
               * @allowtoken 1
               * @permissions {"check":["perm","/",["Sys.Audit","Datastore.Audit"],"any",1]}
               */
              $get(): Promise<string>;
            };
            db: {
              /**
               * Get the Ceph configuration database.
               * GET /nodes/\{node\}/ceph/cfg/db
               * @allowtoken 1
               * @permissions {"check":["perm","/",["Sys.Audit","Datastore.Audit"],"any",1]}
               */
              $get(): Promise<nodesCephCfgDbDb[]>;
            };
            value: {
              /**
               * Get configured values from either the config file or config DB.
               * GET /nodes/\{node\}/ceph/cfg/value
               * @allowtoken 1
               * @permissions {"check":["perm","/",["Sys.Audit"]]}
               */
              $get(param: { 'config-keys': Tconfigkeys }): Promise<any>;
            };
          };
          osd: {
            /**
             * Get Ceph osd list/tree.
             * GET /nodes/\{node\}/ceph/osd
             * @allowtoken 1
             * @permissions {"check":["perm","/",["Sys.Audit","Datastore.Audit"],"any",1]}
             */
            $get(): Promise<any>;
            /**
             * Create OSD
             * POST /nodes/\{node\}/ceph/osd
             * @allowtoken 1
             */
            $post(param: { 'crush-device-class'?: string; db_dev?: string; db_dev_size?: Trate; dev: string; encrypted?: boolean; 'osds-per-device'?: integer_Min1_1; wal_dev?: string; wal_dev_size?: Twal_dev_size }): Promise<string>;
            $(osdid: string): {
              /**
               * Destroy OSD
               * DELETE /nodes/\{node\}/ceph/osd/\{osdid\}
               * @allowtoken 1
               */
              $delete(param?: { cleanup?: boolean }): Promise<string>;
              /**
               * OSD index.
               * GET /nodes/\{node\}/ceph/osd/\{osdid\}
               * @allowtoken 1
               * @permissions {"user":"all"}
               */
              $get(): Promise<nodesCephOsdOsdindex[]>;
              metadata: {
                /**
                 * Get OSD details
                 * GET /nodes/\{node\}/ceph/osd/\{osdid\}/metadata
                 * @allowtoken 1
                 * @permissions {"check":["perm","/",["Sys.Audit"],"any",1]}
                 */
                $get(): Promise<nodesCephOsdMetadataOsddetails>;
              };
              'lv-info': {
                /**
                 * Get OSD volume details
                 * GET /nodes/\{node\}/ceph/osd/\{osdid\}/lv-info
                 * @allowtoken 1
                 * @permissions {"check":["perm","/",["Sys.Audit"],"any",1]}
                 */
                $get(param?: { type?: Ttype_14 }): Promise<nodesCephOsdLvInfoOsdvolume>;
              };
              in: {
                /**
                 * ceph osd in
                 * POST /nodes/\{node\}/ceph/osd/\{osdid\}/in
                 * @allowtoken 1
                 * @permissions {"check":["perm","/",["Sys.Modify"]]}
                 */
                $post(): Promise<null>;
              };
              out: {
                /**
                 * ceph osd out
                 * POST /nodes/\{node\}/ceph/osd/\{osdid\}/out
                 * @allowtoken 1
                 * @permissions {"check":["perm","/",["Sys.Modify"]]}
                 */
                $post(): Promise<null>;
              };
              scrub: {
                /**
                 * Instruct the OSD to scrub.
                 * POST /nodes/\{node\}/ceph/osd/\{osdid\}/scrub
                 * @allowtoken 1
                 * @permissions {"check":["perm","/",["Sys.Modify"]]}
                 */
                $post(param?: { deep?: boolean }): Promise<null>;
              };
            };
          };
          mds: {
            /**
             * MDS directory index.
             * GET /nodes/\{node\}/ceph/mds
             * @allowtoken 1
             * @permissions {"check":["perm","/",["Sys.Audit","Datastore.Audit"],"any",1]}
             */
            $get(): Promise<nodesCephMdsIndex[]>;
            $(name: string): {
              /**
               * Destroy Ceph Metadata Server
               * DELETE /nodes/\{node\}/ceph/mds/\{name\}
               * @allowtoken 1
               * @permissions {"check":["perm","/",["Sys.Modify"]]}
               */
              $delete(): Promise<string>;
              /**
               * Create Ceph Metadata Server (MDS)
               * POST /nodes/\{node\}/ceph/mds/\{name\}
               * @allowtoken 1
               * @permissions {"check":["perm","/",["Sys.Modify"]]}
               */
              $post(param?: { hotstandby?: boolean }): Promise<string>;
            };
          };
          mgr: {
            /**
             * MGR directory index.
             * GET /nodes/\{node\}/ceph/mgr
             * @allowtoken 1
             * @permissions {"check":["perm","/",["Sys.Audit","Datastore.Audit"],"any",1]}
             */
            $get(): Promise<nodesCephMgrIndex[]>;
            $(id: string): {
              /**
               * Destroy Ceph Manager.
               * DELETE /nodes/\{node\}/ceph/mgr/\{id\}
               * @allowtoken 1
               * @permissions {"check":["perm","/",["Sys.Modify"]]}
               */
              $delete(): Promise<string>;
              /**
               * Create Ceph Manager
               * POST /nodes/\{node\}/ceph/mgr/\{id\}
               * @allowtoken 1
               * @permissions {"check":["perm","/",["Sys.Modify"]]}
               */
              $post(): Promise<string>;
            };
          };
          mon: {
            /**
             * Get Ceph monitor list.
             * GET /nodes/\{node\}/ceph/mon
             * @allowtoken 1
             * @permissions {"check":["perm","/",["Sys.Audit","Datastore.Audit"],"any",1]}
             */
            $get(): Promise<nodesCephMonListmon[]>;
            $(monid: string): {
              /**
               * Destroy Ceph Monitor and Manager.
               * DELETE /nodes/\{node\}/ceph/mon/\{monid\}
               * @allowtoken 1
               * @permissions {"check":["perm","/",["Sys.Modify"]]}
               */
              $delete(): Promise<string>;
              /**
               * Create Ceph Monitor and Manager
               * POST /nodes/\{node\}/ceph/mon/\{monid\}
               * @allowtoken 1
               * @permissions {"check":["perm","/",["Sys.Modify"]]}
               */
              $post(param?: { 'mon-address'?: iplist }): Promise<string>;
            };
          };
          fs: {
            /**
             * Directory index.
             * GET /nodes/\{node\}/ceph/fs
             * @allowtoken 1
             * @permissions {"check":["perm","/",["Sys.Audit","Datastore.Audit"],"any",1]}
             */
            $get(): Promise<nodesCephFsIndex[]>;
            $(name: string): {
              /**
               * Create a Ceph filesystem
               * POST /nodes/\{node\}/ceph/fs/\{name\}
               * @allowtoken 1
               * @permissions {"check":["perm","/",["Sys.Modify"]]}
               */
              $post(param?: { 'add-storage'?: boolean; pg_num?: integer8_32768 }): Promise<string>;
            };
          };
          pool: {
            /**
             * List all pools and their settings (which are settable by the POST/PUT endpoints).
             * GET /nodes/\{node\}/ceph/pool
             * @allowtoken 1
             * @permissions {"check":["perm","/",["Sys.Audit","Datastore.Audit"],"any",1]}
             */
            $get(): Promise<nodesCephPoolLspools[]>;
            /**
             * Create Ceph pool
             * POST /nodes/\{node\}/ceph/pool
             * @allowtoken 1
             * @permissions {"check":["perm","/",["Sys.Modify"]]}
             */
            $post(param: { add_storages?: boolean; application?: Tapplication; crush_rule?: Tcrush_rule; 'erasure-coding'?: Terasurecoding; min_size?: integer1_7; name: Tname_1; pg_autoscale_mode?: Tpg_autoscale_mode; pg_num?: integer1_32768; pg_num_min?: integerMax32768; size?: integer1_7_1; target_size?: Ttarget_size; target_size_ratio?: Ttarget_size_ratio }): Promise<string>;
            $(name: string): {
              /**
               * Destroy pool
               * DELETE /nodes/\{node\}/ceph/pool/\{name\}
               * @allowtoken 1
               * @permissions {"check":["perm","/",["Sys.Modify"]]}
               */
              $delete(param?: { force?: boolean; remove_ecprofile?: boolean; remove_storages?: boolean }): Promise<string>;
              /**
               * Pool index.
               * GET /nodes/\{node\}/ceph/pool/\{name\}
               * @allowtoken 1
               * @permissions {"check":["perm","/",["Sys.Audit","Datastore.Audit"],"any",1]}
               */
              $get(): Promise<nodesCephPoolPoolindex[]>;
              /**
               * Change POOL settings
               * PUT /nodes/\{node\}/ceph/pool/\{name\}
               * @allowtoken 1
               * @permissions {"check":["perm","/",["Sys.Modify"]]}
               */
              $put(param?: { application?: Tapplication; crush_rule?: Tcrush_rule; min_size?: integer1_7; pg_autoscale_mode?: Tpg_autoscale_mode; pg_num?: integer1_32768; pg_num_min?: integerMax32768; size?: integer1_7_1; target_size?: Ttarget_size; target_size_ratio?: Ttarget_size_ratio }): Promise<string>;
              status: {
                /**
                 * Show the current pool status.
                 * GET /nodes/\{node\}/ceph/pool/\{name\}/status
                 * @allowtoken 1
                 * @permissions {"check":["perm","/",["Sys.Audit","Datastore.Audit"],"any",1]}
                 */
                $get(param?: { verbose?: boolean }): Promise<nodesCephPoolStatusGetpool>;
              };
            };
          };
          init: {
            /**
             * Create initial ceph default configuration and setup symlinks.
             * POST /nodes/\{node\}/ceph/init
             * @allowtoken 1
             * @permissions {"check":["perm","/",["Sys.Modify"]]}
             */
            $post(param?: { 'cluster-network'?: CIDR_1; disable_cephx?: boolean; min_size?: integer1_7_2; network?: CIDR_1; pg_bits?: integer6_14; size?: integer1_7_2 }): Promise<null>;
          };
          stop: {
            /**
             * Stop ceph services.
             * POST /nodes/\{node\}/ceph/stop
             * @allowtoken 1
             * @permissions {"check":["perm","/",["Sys.Modify"]]}
             */
            $post(param?: { service?: Tservice }): Promise<string>;
          };
          start: {
            /**
             * Start ceph services.
             * POST /nodes/\{node\}/ceph/start
             * @allowtoken 1
             * @permissions {"check":["perm","/",["Sys.Modify"]]}
             */
            $post(param?: { service?: Tservice }): Promise<string>;
          };
          restart: {
            /**
             * Restart ceph services.
             * POST /nodes/\{node\}/ceph/restart
             * @allowtoken 1
             * @permissions {"check":["perm","/",["Sys.Modify"]]}
             */
            $post(param?: { service?: Tservice_1 }): Promise<string>;
          };
          status: {
            /**
             * Get ceph status.
             * GET /nodes/\{node\}/ceph/status
             * @allowtoken 1
             * @permissions {"check":["perm","/",["Sys.Audit","Datastore.Audit"],"any",1]}
             */
            $get(): Promise<any>;
          };
          crush: {
            /**
             * Get OSD crush map
             * GET /nodes/\{node\}/ceph/crush
             * @allowtoken 1
             * @permissions {"check":["perm","/",["Sys.Audit","Datastore.Audit"],"any",1]}
             */
            $get(): Promise<string>;
          };
          log: {
            /**
             * Read ceph log
             * GET /nodes/\{node\}/ceph/log
             * @allowtoken 1
             * @permissions {"check":["perm","/nodes/{node}",["Sys.Syslog"]]}
             */
            $get(param?: { limit?: integer_Min0; start?: integer_Min0 }): Promise<nodesCephLogLog[]>;
          };
          rules: {
            /**
             * List ceph rules.
             * GET /nodes/\{node\}/ceph/rules
             * @allowtoken 1
             * @permissions {"check":["perm","/",["Sys.Audit","Datastore.Audit"],"any",1]}
             */
            $get(): Promise<nodesCephRulesRules[]>;
          };
          'cmd-safety': {
            /**
             * Heuristical check if it is safe to perform an action.
             * GET /nodes/\{node\}/ceph/cmd-safety
             * @allowtoken 1
             * @permissions {"check":["perm","/",["Sys.Audit"]]}
             */
            $get(param: { action: Taction_1; id: string; service: Tservice_2 }): Promise<nodesCephCmdSafetyCmdSafety>;
          };
        };
        vzdump: {
          /**
           * Create backup.
           * POST /nodes/\{node\}/vzdump
           * @allowtoken 1
           * @permissions {"description":"The user needs 'VM.Backup' permissions on any VM, and 'Datastore.AllocateSpace' on the backup storage. The 'tmpdir', 'dumpdir' and 'script' parameters are restricted to the 'root@pam' user. The 'maxfiles' and 'prune-backups' settings require 'Datastore.Allocate' on the backup storage. The 'bwlimit', 'performance' and 'ionice' parameters require 'Sys.Modify' on '/'. ","user":"all"}
           */
          $post(param?: { all?: boolean; bwlimit?: integer_Min0; compress?: Tcompress; dumpdir?: string; exclude?: pvevmidlist; 'exclude-path'?: Tmatchcalendar; ionice?: integer0_8; lockwait?: integer_Min0; mailnotification?: Tmailnotification; mailto?: emailorusernamelist; maxfiles?: integer_Min1; mode?: Tmode_2; 'notes-template'?: String0_1024; 'notification-policy'?: Tnotificationpolicy; 'notification-target'?: pveconfigid_1; performance?: backupperformance; pigz?: integer; pool?: string; protected?: boolean; 'prune-backups'?: prunebackups; quiet?: boolean; remove?: boolean; script?: string; stdexcludes?: boolean; stdout?: boolean; stop?: boolean; stopwait?: integer_Min0; storage?: pvestorageid; tmpdir?: string; vmid?: pvevmidlist; zstd?: integer }): Promise<string>;
          defaults: {
            /**
             * Get the currently configured vzdump defaults.
             * GET /nodes/\{node\}/vzdump/defaults
             * @allowtoken 1
             * @permissions {"description":"The user needs 'Datastore.Audit' or 'Datastore.AllocateSpace' permissions for the specified storage (or default storage if none specified). Some properties are only returned when the user has 'Sys.Audit' permissions for the node.","user":"all"}
             */
            $get(param?: { storage?: pvestorageid }): Promise<nodesVzdumpDefaultsDefaults>;
          };
          extractconfig: {
            /**
             * Extract configuration from vzdump backup archive.
             * GET /nodes/\{node\}/vzdump/extractconfig
             * @allowtoken 1
             * @permissions {"description":"The user needs 'VM.Backup' permissions on the backed up guest ID, and 'Datastore.AllocateSpace' on the backup storage.","user":"all"}
             */
            $get(param: { volume: string }): Promise<string>;
          };
        };
        services: {
          /**
           * Service list.
           * GET /nodes/\{node\}/services
           * @allowtoken 1
           * @permissions {"check":["perm","/nodes/{node}",["Sys.Audit"]]}
           */
          $get(): Promise<nodesServicesIndex[]>;
          $(service: string): {
            /**
             * Directory index
             * GET /nodes/\{node\}/services/\{service\}
             * @allowtoken 1
             * @permissions {"check":["perm","/nodes/{node}",["Sys.Audit"]]}
             */
            $get(): Promise<nodesServicesSrvcmdidx[]>;
            state: {
              /**
               * Read service properties
               * GET /nodes/\{node\}/services/\{service\}/state
               * @allowtoken 1
               * @permissions {"check":["perm","/nodes/{node}",["Sys.Audit"]]}
               */
              $get(): Promise<any>;
            };
            start: {
              /**
               * Start service.
               * POST /nodes/\{node\}/services/\{service\}/start
               * @allowtoken 1
               * @permissions {"check":["perm","/nodes/{node}",["Sys.Modify"]]}
               */
              $post(): Promise<string>;
            };
            stop: {
              /**
               * Stop service.
               * POST /nodes/\{node\}/services/\{service\}/stop
               * @allowtoken 1
               * @permissions {"check":["perm","/nodes/{node}",["Sys.Modify"]]}
               */
              $post(): Promise<string>;
            };
            restart: {
              /**
               * Hard restart service. Use reload if you want to reduce interruptions.
               * POST /nodes/\{node\}/services/\{service\}/restart
               * @allowtoken 1
               * @permissions {"check":["perm","/nodes/{node}",["Sys.Modify"]]}
               */
              $post(): Promise<string>;
            };
            reload: {
              /**
               * Reload service. Falls back to restart if service cannot be reloaded.
               * POST /nodes/\{node\}/services/\{service\}/reload
               * @allowtoken 1
               * @permissions {"check":["perm","/nodes/{node}",["Sys.Modify"]]}
               */
              $post(): Promise<string>;
            };
          };
        };
        subscription: {
          /**
           * Delete subscription key of this node.
           * DELETE /nodes/\{node\}/subscription
           * @allowtoken 1
           * @permissions {"check":["perm","/nodes/{node}",["Sys.Modify"]]}
           */
          $delete(): Promise<null>;
          /**
           * Read subscription info.
           * GET /nodes/\{node\}/subscription
           * @allowtoken 1
           * @permissions {"user":"all"}
           */
          $get(): Promise<any>;
          /**
           * Update subscription info.
           * POST /nodes/\{node\}/subscription
           * @allowtoken 1
           * @permissions {"check":["perm","/nodes/{node}",["Sys.Modify"]]}
           */
          $post(param?: { force?: boolean }): Promise<null>;
          /**
           * Set subscription key.
           * PUT /nodes/\{node\}/subscription
           * @allowtoken 1
           * @permissions {"check":["perm","/nodes/{node}",["Sys.Modify"]]}
           */
          $put(param: { key: Tkey }): Promise<null>;
        };
        network: {
          /**
           * Revert network configuration changes.
           * DELETE /nodes/\{node\}/network
           * @allowtoken 1
           * @permissions {"check":["perm","/nodes/{node}",["Sys.Modify"]]}
           */
          $delete(): Promise<null>;
          /**
           * List available networks
           * GET /nodes/\{node\}/network
           * @allowtoken 1
           * @permissions {"user":"all"}
           */
          $get(param?: { type?: Ttype_15 }): Promise<nodesNetworkIndex[]>;
          /**
           * Create network device configuration
           * POST /nodes/\{node\}/network
           * @allowtoken 1
           * @permissions {"check":["perm","/nodes/{node}",["Sys.Modify"]]}
           */
          $post(param: { address?: ipv4; address6?: ipv6; autostart?: boolean; 'bond-primary'?: pveiface_1; bond_mode?: Tbond_mode; bond_xmit_hash_policy?: Tbond_xmit_hash_policy; bridge_ports?: pveifacelist; bridge_vlan_aware?: boolean; cidr?: CIDRv4; cidr6?: CIDRv6; comments?: string; comments6?: string; gateway?: ipv4; gateway6?: ipv6; iface: pveiface; mtu?: integer1280_65520; netmask?: ipv4mask; netmask6?: integer0_128; ovs_bonds?: pveifacelist; ovs_bridge?: pveiface_1; ovs_options?: String0_1024; ovs_ports?: pveifacelist; ovs_tag?: integer1_4094; slaves?: pveifacelist; type: Ttype_16; 'vlan-id'?: integer1_4094; 'vlan-raw-device'?: pveiface_1 }): Promise<null>;
          /**
           * Reload network configuration
           * PUT /nodes/\{node\}/network
           * @allowtoken 1
           * @permissions {"check":["perm","/nodes/{node}",["Sys.Modify"]]}
           */
          $put(): Promise<string>;
          $(iface: string): {
            /**
             * Delete network device configuration
             * DELETE /nodes/\{node\}/network/\{iface\}
             * @allowtoken 1
             * @permissions {"check":["perm","/nodes/{node}",["Sys.Modify"]]}
             */
            $delete(): Promise<null>;
            /**
             * Read network device configuration
             * GET /nodes/\{node\}/network/\{iface\}
             * @allowtoken 1
             * @permissions {"check":["perm","/nodes/{node}",["Sys.Audit"]]}
             */
            $get(): Promise<nodesNetworkNetworkConfig>;
            /**
             * Update network device configuration
             * PUT /nodes/\{node\}/network/\{iface\}
             * @allowtoken 1
             * @permissions {"check":["perm","/nodes/{node}",["Sys.Modify"]]}
             */
            $put(param: { address?: ipv4; address6?: ipv6; autostart?: boolean; 'bond-primary'?: pveiface_1; bond_mode?: Tbond_mode; bond_xmit_hash_policy?: Tbond_xmit_hash_policy; bridge_ports?: pveifacelist; bridge_vlan_aware?: boolean; cidr?: CIDRv4; cidr6?: CIDRv6; comments?: string; comments6?: string; delete?: pveconfigidlist_1; gateway?: ipv4; gateway6?: ipv6; mtu?: integer1280_65520; netmask?: ipv4mask; netmask6?: integer0_128; ovs_bonds?: pveifacelist; ovs_bridge?: pveiface_1; ovs_options?: String0_1024; ovs_ports?: pveifacelist; ovs_tag?: integer1_4094; slaves?: pveifacelist; type: Ttype_16; 'vlan-id'?: integer1_4094; 'vlan-raw-device'?: pveiface_1 }): Promise<null>;
          };
        };
        tasks: {
          /**
           * Read task list for one node (finished tasks).
           * GET /nodes/\{node\}/tasks
           * @allowtoken 1
           * @permissions {"description":"List task associated with the current user, or all task the user has 'Sys.Audit' permissions on /nodes/<node> (the <node> the task runs on).","user":"all"}
           */
          $get(param?: { errors?: boolean; limit?: integer_Min0; since?: integer; source?: Tsource; start?: integer_Min0; statusfilter?: pvetaskstatustypelist; typefilter?: string; until?: integer; userfilter?: string; vmid?: pvevmid }): Promise<nodesTasksNodeTasks[]>;
          $(upid: string): {
            /**
             * Stop a task.
             * DELETE /nodes/\{node\}/tasks/\{upid\}
             * @allowtoken 1
             * @permissions {"description":"The user needs 'Sys.Modify' permissions on '/nodes/<node>' if they aren't the owner of the task.","user":"all"}
             */
            $delete(): Promise<null>;
            /**
             *
             * @allowtoken 1
             * @permissions {"user":"all"}
             */
            $get(): Promise<nodesTasksUpidIndex[]>;
            log: {
              /**
               * Read task log.
               * GET /nodes/\{node\}/tasks/\{upid\}/log
               * @allowtoken 1
               * @permissions {"description":"The user needs 'Sys.Audit' permissions on '/nodes/<node>' if they aren't the owner of the task.","user":"all"}
               */
              $get(param?: { download?: boolean; limit?: integer_Min0; start?: integer_Min0 }): Promise<nodesTasksLogReadTaskLog[]>;
            };
            status: {
              /**
               * Read task status.
               * GET /nodes/\{node\}/tasks/\{upid\}/status
               * @allowtoken 1
               * @permissions {"description":"The user needs 'Sys.Audit' permissions on '/nodes/<node>' if they are not the owner of the task.","user":"all"}
               */
              $get(): Promise<nodesTasksStatusReadTaskStatus>;
            };
          };
        };
        scan: {
          /**
           * Index of available scan methods
           * GET /nodes/\{node\}/scan
           * @allowtoken 1
           * @permissions {"user":"all"}
           */
          $get(): Promise<nodesScanIndex[]>;
          nfs: {
            /**
             * Scan remote NFS server.
             * GET /nodes/\{node\}/scan/nfs
             * @allowtoken 1
             * @permissions {"check":["perm","/storage",["Datastore.Allocate"]]}
             */
            $get(param: { server: pvestorageserver }): Promise<nodesScanNfsNfsscan[]>;
          };
          cifs: {
            /**
             * Scan remote CIFS server.
             * GET /nodes/\{node\}/scan/cifs
             * @allowtoken 1
             * @permissions {"check":["perm","/storage",["Datastore.Allocate"]]}
             */
            $get(param: { domain?: string; password?: string; server: pvestorageserver; username?: string }): Promise<nodesScanCifsCifsscan[]>;
          };
          pbs: {
            /**
             * Scan remote Proxmox Backup Server.
             * GET /nodes/\{node\}/scan/pbs
             * @allowtoken 1
             * @permissions {"check":["perm","/storage",["Datastore.Allocate"]]}
             */
            $get(param: { fingerprint?: Tfingerprint; password: string; port?: integer1_65535; server: pvestorageserver; username: string }): Promise<nodesScanPbsPbsscan[]>;
          };
          glusterfs: {
            /**
             * Scan remote GlusterFS server.
             * GET /nodes/\{node\}/scan/glusterfs
             * @allowtoken 1
             * @permissions {"check":["perm","/storage",["Datastore.Allocate"]]}
             */
            $get(param: { server: pvestorageserver }): Promise<nodesScanGlusterfsGlusterfsscan[]>;
          };
          iscsi: {
            /**
             * Scan remote iSCSI server.
             * GET /nodes/\{node\}/scan/iscsi
             * @allowtoken 1
             * @permissions {"check":["perm","/storage",["Datastore.Allocate"]]}
             */
            $get(param: { portal: pvestorageportaldns }): Promise<nodesScanIscsiIscsiscan[]>;
          };
          lvm: {
            /**
             * List local LVM volume groups.
             * GET /nodes/\{node\}/scan/lvm
             * @allowtoken 1
             * @permissions {"check":["perm","/storage",["Datastore.Allocate"]]}
             */
            $get(): Promise<nodesScanLvmLvmscan[]>;
          };
          lvmthin: {
            /**
             * List local LVM Thin Pools.
             * GET /nodes/\{node\}/scan/lvmthin
             * @allowtoken 1
             * @permissions {"check":["perm","/storage",["Datastore.Allocate"]]}
             */
            $get(param: { vg: Tvg }): Promise<nodesScanLvmthinLvmthinscan[]>;
          };
          zfs: {
            /**
             * Scan zfs pool list on local node.
             * GET /nodes/\{node\}/scan/zfs
             * @allowtoken 1
             * @permissions {"check":["perm","/storage",["Datastore.Allocate"]]}
             */
            $get(): Promise<nodesScanZfsZfsscan[]>;
          };
        };
        hardware: {
          /**
           * Index of hardware types
           * GET /nodes/\{node\}/hardware
           * @allowtoken 1
           * @permissions {"user":"all"}
           */
          $get(): Promise<nodesHardwareIndex[]>;
          pci: {
            /**
             * List local PCI devices.
             * GET /nodes/\{node\}/hardware/pci
             * @allowtoken 1
             * @permissions {"check":["perm","/",["Sys.Audit","Sys.Modify"],"any",1]}
             */
            $get(param?: { 'pci-class-blacklist'?: stringlist; verbose?: boolean }): Promise<nodesHardwarePciPciscan[]>;
            $(pciid: string): {
              /**
               * Index of available pci methods
               * GET /nodes/\{node\}/hardware/pci/\{pciid\}
               * @allowtoken 1
               * @permissions {"user":"all"}
               */
              $get(): Promise<nodesHardwarePciPciindex[]>;
              mdev: {
                /**
                 * List mediated device types for given PCI device.
                 * GET /nodes/\{node\}/hardware/pci/\{pciid\}/mdev
                 * @allowtoken 1
                 * @permissions {"check":["perm","/",["Sys.Audit","Sys.Modify"],"any",1]}
                 */
                $get(): Promise<nodesHardwarePciMdevMdevscan[]>;
              };
            };
          };
          usb: {
            /**
             * List local USB devices.
             * GET /nodes/\{node\}/hardware/usb
             * @allowtoken 1
             * @permissions {"check":["perm","/",["Sys.Modify"]]}
             */
            $get(): Promise<nodesHardwareUsbUsbscan[]>;
          };
        };
        capabilities: {
          /**
           * Node capabilities index.
           * GET /nodes/\{node\}/capabilities
           * @allowtoken 1
           * @permissions {"user":"all"}
           */
          $get(): Promise<nodesCapabilitiesIndex[]>;
          qemu: {
            /**
             * QEMU capabilities index.
             * GET /nodes/\{node\}/capabilities/qemu
             * @allowtoken 1
             * @permissions {"user":"all"}
             */
            $get(): Promise<nodesCapabilitiesQemuQemuCapsIndex[]>;
            cpu: {
              /**
               * List all custom and default CPU models.
               * GET /nodes/\{node\}/capabilities/qemu/cpu
               * @allowtoken 1
               * @permissions {"description":"Only returns custom models when the current user has Sys.Audit on /nodes.","user":"all"}
               */
              $get(): Promise<nodesCapabilitiesQemuCpuIndex[]>;
            };
            machines: {
              /**
               * Get available QEMU/KVM machine types.
               * GET /nodes/\{node\}/capabilities/qemu/machines
               * @allowtoken 1
               * @permissions {"user":"all"}
               */
              $get(): Promise<nodesCapabilitiesQemuMachinesTypes[]>;
            };
          };
        };
        storage: {
          /**
           * Get status for all datastores.
           * GET /nodes/\{node\}/storage
           * @allowtoken 1
           * @permissions {"description":"Only list entries where you have 'Datastore.Audit' or 'Datastore.AllocateSpace' permissions on '/storage/<storage>'","user":"all"}
           */
          $get(param?: { content?: pvestoragecontentlist; enabled?: boolean; format?: boolean; storage?: pvestorageid; target?: pvenode }): Promise<nodesStorageIndex[]>;
          $(storage: string): {
            /**
             *
             * @allowtoken 1
             * @permissions {"check":["perm","/storage/{storage}",["Datastore.Audit","Datastore.AllocateSpace"],"any",1]}
             */
            $get(): Promise<nodesStorageDiridx[]>;
            prunebackups: {
              /**
               * Prune backups. Only those using the standard naming scheme are considered.
               * DELETE /nodes/\{node\}/storage/\{storage\}/prunebackups
               * @allowtoken 1
               * @permissions {"description":"You need the 'Datastore.Allocate' privilege on the storage (or if a VM ID is specified, 'Datastore.AllocateSpace' and 'VM.Backup' for the VM).","user":"all"}
               */
              $delete(param?: { 'prune-backups'?: prunebackups; type?: Ttype_17; vmid?: pvevmid }): Promise<string>;
              /**
               * Get prune information for backups. NOTE: this is only a preview and might not be what a subsequent prune call does if backups are removed/added in the meantime.
               * GET /nodes/\{node\}/storage/\{storage\}/prunebackups
               * @allowtoken 1
               * @permissions {"check":["perm","/storage/{storage}",["Datastore.Audit","Datastore.AllocateSpace"],"any",1]}
               */
              $get(param?: { 'prune-backups'?: prunebackups; type?: Ttype_17; vmid?: pvevmid }): Promise<nodesStoragePrunebackupsDryrun[]>;
            };
            content: {
              /**
               * List storage content.
               * GET /nodes/\{node\}/storage/\{storage\}/content
               * @allowtoken 1
               * @permissions {"check":["perm","/storage/{storage}",["Datastore.Audit","Datastore.AllocateSpace"],"any",1]}
               */
              $get(param?: { content?: pvestoragecontent; vmid?: pvevmid }): Promise<nodesStorageContentIndex[]>;
              /**
               * Allocate disk images.
               * POST /nodes/\{node\}/storage/\{storage\}/content
               * @allowtoken 1
               * @permissions {"check":["perm","/storage/{storage}",["Datastore.AllocateSpace"]]}
               */
              $post(param: { filename: string; format?: Tformat_1; size: Tsize_1; vmid: pvevmid }): Promise<string>;
              $(volume: string): {
                /**
                 * Delete volume
                 * DELETE /nodes/\{node\}/storage/\{storage\}/content/\{volume\}
                 * @allowtoken 1
                 * @permissions {"description":"You need 'Datastore.Allocate' privilege on the storage (or 'Datastore.AllocateSpace' for backup volumes if you have VM.Backup privilege on the VM).","user":"all"}
                 */
                $delete(param?: { delay?: integer1_30 }): Promise<string>;
                /**
                 * Get volume attributes
                 * GET /nodes/\{node\}/storage/\{storage\}/content/\{volume\}
                 * @allowtoken 1
                 * @permissions {"description":"You need read access for the volume.","user":"all"}
                 */
                $get(): Promise<nodesStorageContentInfo>;
                /**
                 * Copy a volume. This is experimental code - do not use.
                 * POST /nodes/\{node\}/storage/\{storage\}/content/\{volume\}
                 * @allowtoken 1
                 */
                $post(param: { target: string; target_node?: pvenode }): Promise<string>;
                /**
                 * Update volume attributes
                 * PUT /nodes/\{node\}/storage/\{storage\}/content/\{volume\}
                 * @allowtoken 1
                 * @permissions {"description":"You need read access for the volume.","user":"all"}
                 */
                $put(param?: { notes?: string; protected?: boolean }): Promise<null>;
              };
            };
            'file-restore': {
              list: {
                /**
                 * List files and directories for single file restore under the given path.
                 * GET /nodes/\{node\}/storage/\{storage\}/file-restore/list
                 * @allowtoken 1
                 * @permissions {"description":"You need read access for the volume.","user":"all"}
                 */
                $get(param: { filepath: string; volume: string }): Promise<nodesStorageFileRestoreListList[]>;
              };
              download: {
                /**
                 * Extract a file or directory (as zip archive) from a PBS backup.
                 * GET /nodes/\{node\}/storage/\{storage\}/file-restore/download
                 * @allowtoken 1
                 * @permissions {"description":"You need read access for the volume.","user":"all"}
                 */
                $get(param: { filepath: string; tar?: boolean; volume: string }): Promise<any>; // TODO Promise<ReadableStream>;
              };
            };
            status: {
              /**
               * Read storage status.
               * GET /nodes/\{node\}/storage/\{storage\}/status
               * @allowtoken 1
               * @permissions {"check":["perm","/storage/{storage}",["Datastore.Audit","Datastore.AllocateSpace"],"any",1]}
               */
              $get(): Promise<any>;
            };
            rrd: {
              /**
               * Read storage RRD statistics (returns PNG).
               * GET /nodes/\{node\}/storage/\{storage\}/rrd
               * @allowtoken 1
               * @permissions {"check":["perm","/storage/{storage}",["Datastore.Audit","Datastore.AllocateSpace"],"any",1]}
               */
              $get(param: { cf?: Tcf; ds: pveconfigidlist_1; timeframe: Ttimeframe }): Promise<nodesStorageRrdRrd>;
            };
            rrddata: {
              /**
               * Read storage RRD statistics.
               * GET /nodes/\{node\}/storage/\{storage\}/rrddata
               * @allowtoken 1
               * @permissions {"check":["perm","/storage/{storage}",["Datastore.Audit","Datastore.AllocateSpace"],"any",1]}
               */
              $get(param: { cf?: Tcf; timeframe: Ttimeframe }): Promise<nodesStorageRrddataRrddata[]>;
            };
            upload: {
              /**
               * Upload templates and ISO images.
               * POST /nodes/\{node\}/storage/\{storage\}/upload
               * @allowtoken 1
               * @permissions {"check":["perm","/storage/{storage}",["Datastore.AllocateTemplate"]]}
               */
              $post(param: { checksum?: string; 'checksum-algorithm'?: Tchecksumalgorithm; content: pvestoragecontent_1; filename: String0_255; tmpfilename?: Ttmpfilename }): Promise<string>;
            };
            'download-url': {
              /**
               * Download templates and ISO images by using an URL.
               * POST /nodes/\{node\}/storage/\{storage\}/download-url
               * @allowtoken 1
               * @permissions {"check":["and",["perm","/storage/{storage}",["Datastore.AllocateTemplate"]],["perm","/",["Sys.Audit","Sys.Modify"]]]}
               */
              $post(param: { checksum?: string; 'checksum-algorithm'?: Tchecksumalgorithm; compression?: string; content: pvestoragecontent_1; filename: String0_255; url: Turl; 'verify-certificates'?: boolean }): Promise<string>;
            };
          };
        };
        disks: {
          /**
           * Node index.
           * GET /nodes/\{node\}/disks
           * @allowtoken 1
           * @permissions {"user":"all"}
           */
          $get(): Promise<nodesDisksIndex[]>;
          lvm: {
            /**
             * List LVM Volume Groups
             * GET /nodes/\{node\}/disks/lvm
             * @allowtoken 1
             * @permissions {"check":["perm","/",["Sys.Audit"]]}
             */
            $get(): Promise<nodesDisksLvmIndex>;
            /**
             * Create an LVM Volume Group
             * POST /nodes/\{node\}/disks/lvm
             * @allowtoken 1
             * @permissions {"check":["perm","/",["Sys.Modify"]],"description":"Requires additionally 'Datastore.Allocate' on /storage when setting 'add_storage'"}
             */
            $post(param: { add_storage?: boolean; device: string; name: pvestorageid }): Promise<string>;
            $(name: string): {
              /**
               * Remove an LVM Volume Group.
               * DELETE /nodes/\{node\}/disks/lvm/\{name\}
               * @allowtoken 1
               * @permissions {"check":["perm","/",["Sys.Modify"]],"description":"Requires additionally 'Datastore.Allocate' on /storage when setting 'cleanup-config'"}
               */
              $delete(param?: { 'cleanup-config'?: boolean; 'cleanup-disks'?: boolean }): Promise<string>;
            };
          };
          lvmthin: {
            /**
             * List LVM thinpools
             * GET /nodes/\{node\}/disks/lvmthin
             * @allowtoken 1
             * @permissions {"check":["perm","/",["Sys.Audit"]]}
             */
            $get(): Promise<nodesDisksLvmthinIndex[]>;
            /**
             * Create an LVM thinpool
             * POST /nodes/\{node\}/disks/lvmthin
             * @allowtoken 1
             * @permissions {"check":["perm","/",["Sys.Modify"]],"description":"Requires additionally 'Datastore.Allocate' on /storage when setting 'add_storage'"}
             */
            $post(param: { add_storage?: boolean; device: string; name: pvestorageid }): Promise<string>;
            $(name: string): {
              /**
               * Remove an LVM thin pool.
               * DELETE /nodes/\{node\}/disks/lvmthin/\{name\}
               * @allowtoken 1
               * @permissions {"check":["perm","/",["Sys.Modify"]],"description":"Requires additionally 'Datastore.Allocate' on /storage when setting 'cleanup-config'"}
               */
              $delete(param: { 'cleanup-config'?: boolean; 'cleanup-disks'?: boolean; 'volume-group': pvestorageid }): Promise<string>;
            };
          };
          directory: {
            /**
             * PVE Managed Directory storages.
             * GET /nodes/\{node\}/disks/directory
             * @allowtoken 1
             * @permissions {"check":["perm","/",["Sys.Audit"]]}
             */
            $get(): Promise<nodesDisksDirectoryIndex[]>;
            /**
             * Create a Filesystem on an unused disk. Will be mounted under '/mnt/pve/NAME'.
             * POST /nodes/\{node\}/disks/directory
             * @allowtoken 1
             * @permissions {"check":["perm","/",["Sys.Modify"]],"description":"Requires additionally 'Datastore.Allocate' on /storage when setting 'add_storage'"}
             */
            $post(param: { add_storage?: boolean; device: string; filesystem?: Tfilesystem; name: pvestorageid }): Promise<string>;
            $(name: string): {
              /**
               * Unmounts the storage and removes the mount unit.
               * DELETE /nodes/\{node\}/disks/directory/\{name\}
               * @allowtoken 1
               * @permissions {"check":["perm","/",["Sys.Modify"]],"description":"Requires additionally 'Datastore.Allocate' on /storage when setting 'cleanup-config'"}
               */
              $delete(param?: { 'cleanup-config'?: boolean; 'cleanup-disks'?: boolean }): Promise<string>;
            };
          };
          zfs: {
            /**
             * List Zpools.
             * GET /nodes/\{node\}/disks/zfs
             * @allowtoken 1
             * @permissions {"check":["perm","/",["Sys.Audit"]]}
             */
            $get(): Promise<nodesDisksZfsIndex[]>;
            /**
             * Create a ZFS pool.
             * POST /nodes/\{node\}/disks/zfs
             * @allowtoken 1
             * @permissions {"check":["perm","/",["Sys.Modify"]],"description":"Requires additionally 'Datastore.Allocate' on /storage when setting 'add_storage'"}
             */
            $post(param: { add_storage?: boolean; ashift?: integer9_16; compression?: Tcompression; devices: stringlist; 'draid-config'?: Tdraidconfig; name: pvestorageid; raidlevel: Traidlevel }): Promise<string>;
            $(name: string): {
              /**
               * Destroy a ZFS pool.
               * DELETE /nodes/\{node\}/disks/zfs/\{name\}
               * @allowtoken 1
               * @permissions {"check":["perm","/",["Sys.Modify"]],"description":"Requires additionally 'Datastore.Allocate' on /storage when setting 'cleanup-config'"}
               */
              $delete(param?: { 'cleanup-config'?: boolean; 'cleanup-disks'?: boolean }): Promise<string>;
              /**
               * Get details about a zpool.
               * GET /nodes/\{node\}/disks/zfs/\{name\}
               * @allowtoken 1
               * @permissions {"check":["perm","/",["Sys.Audit"]]}
               */
              $get(): Promise<nodesDisksZfsDetail>;
            };
          };
          list: {
            /**
             * List local disks.
             * GET /nodes/\{node\}/disks/list
             * @allowtoken 1
             * @permissions {"check":["or",["perm","/",["Sys.Audit"]],["perm","/nodes/{node}",["Sys.Audit"]]]}
             */
            $get(param?: { 'include-partitions'?: boolean; skipsmart?: boolean; type?: Ttype_18 }): Promise<nodesDisksListList[]>;
          };
          smart: {
            /**
             * Get SMART Health of a disk.
             * GET /nodes/\{node\}/disks/smart
             * @allowtoken 1
             * @permissions {"check":["perm","/",["Sys.Audit"]]}
             */
            $get(param: { disk: Tdisk_3; healthonly?: boolean }): Promise<nodesDisksSmartSmart>;
          };
          initgpt: {
            /**
             * Initialize Disk with GPT
             * POST /nodes/\{node\}/disks/initgpt
             * @allowtoken 1
             * @permissions {"check":["perm","/",["Sys.Modify"]]}
             */
            $post(param: { disk: Tdisk_3; uuid?: Tuuid }): Promise<string>;
          };
          wipedisk: {
            /**
             * Wipe a disk or partition.
             * PUT /nodes/\{node\}/disks/wipedisk
             * @allowtoken 1
             */
            $put(param: { disk: Tdisk_3 }): Promise<string>;
          };
        };
        apt: {
          /**
           * Directory index for apt (Advanced Package Tool).
           * GET /nodes/\{node\}/apt
           * @allowtoken 1
           * @permissions {"user":"all"}
           */
          $get(): Promise<nodesAptIndex[]>;
          update: {
            /**
             * List available updates.
             * GET /nodes/\{node\}/apt/update
             * @allowtoken 1
             * @permissions {"check":["perm","/nodes/{node}",["Sys.Modify"]]}
             */
            $get(): Promise<nodesAptUpdateListUpdates[]>;
            /**
             * This is used to resynchronize the package index files from their sources (apt-get update).
             * POST /nodes/\{node\}/apt/update
             * @allowtoken 1
             * @permissions {"check":["perm","/nodes/{node}",["Sys.Modify"]]}
             */
            $post(param?: { notify?: boolean; quiet?: boolean }): Promise<string>;
          };
          changelog: {
            /**
             * Get package changelogs.
             * GET /nodes/\{node\}/apt/changelog
             * @allowtoken 1
             * @permissions {"check":["perm","/nodes/{node}",["Sys.Modify"]]}
             */
            $get(param: { name: string; version?: string }): Promise<string>;
          };
          repositories: {
            /**
             * Get APT repository information.
             * GET /nodes/\{node\}/apt/repositories
             * @allowtoken 1
             * @permissions {"check":["perm","/nodes/{node}",["Sys.Audit"]]}
             */
            $get(): Promise<nodesAptRepositoriesRepositories>;
            /**
             * Change the properties of a repository. Currently only allows enabling/disabling.
             * POST /nodes/\{node\}/apt/repositories
             * @allowtoken 1
             * @permissions {"check":["perm","/nodes/{node}",["Sys.Modify"]]}
             */
            $post(param: { digest?: String0_80; enabled?: boolean; index: integer; path: string }): Promise<null>;
            /**
             * Add a standard repository to the configuration
             * PUT /nodes/\{node\}/apt/repositories
             * @allowtoken 1
             * @permissions {"check":["perm","/nodes/{node}",["Sys.Modify"]]}
             */
            $put(param: { digest?: String0_80; handle: string }): Promise<null>;
          };
          versions: {
            /**
             * Get package information for important Proxmox packages.
             * GET /nodes/\{node\}/apt/versions
             * @allowtoken 1
             * @permissions {"check":["perm","/nodes/{node}",["Sys.Audit"]]}
             */
            $get(): Promise<nodesAptVersionsVersions[]>;
          };
        };
        firewall: {
          /**
           * Directory index.
           * GET /nodes/\{node\}/firewall
           * @allowtoken 1
           * @permissions {"user":"all"}
           */
          $get(): Promise<nodesFirewallIndex[]>;
          rules: {
            /**
             * List rules.
             * GET /nodes/\{node\}/firewall/rules
             * @allowtoken 1
             * @permissions {"check":["perm","/nodes/{node}",["Sys.Audit"]]}
             */
            $get(): Promise<nodesFirewallRulesGetRules[]>;
            /**
             * Create new rule.
             * POST /nodes/\{node\}/firewall/rules
             * @allowtoken 1
             * @permissions {"check":["perm","/nodes/{node}",["Sys.Modify"]]}
             */
            $post(param: { action: Taction; comment?: string; dest?: pvefwaddrspec; digest?: String0_64; dport?: pvefwdportspec; enable?: integer_Min0; 'icmp-type'?: pvefwicmptypespec; iface?: pveiface; log?: Tlog; macro?: String0_128; pos?: integer_Min0; proto?: pvefwprotocolspec; source?: pvefwaddrspec; sport?: pvefwsportspec; type: Ttype_1 }): Promise<null>;
            $(pos: string): {
              /**
               * Delete rule.
               * DELETE /nodes/\{node\}/firewall/rules/\{pos\}
               * @allowtoken 1
               * @permissions {"check":["perm","/nodes/{node}",["Sys.Modify"]]}
               */
              $delete(param?: { digest?: String0_64 }): Promise<null>;
              /**
               * Get single rule data.
               * GET /nodes/\{node\}/firewall/rules/\{pos\}
               * @allowtoken 1
               * @permissions {"check":["perm","/nodes/{node}",["Sys.Audit"]]}
               */
              $get(): Promise<nodesFirewallRulesGetRule>;
              /**
               * Modify rule data.
               * PUT /nodes/\{node\}/firewall/rules/\{pos\}
               * @allowtoken 1
               * @permissions {"check":["perm","/nodes/{node}",["Sys.Modify"]]}
               */
              $put(param?: { action?: Taction; comment?: string; delete?: pveconfigidlist_1; dest?: pvefwaddrspec; digest?: String0_64; dport?: pvefwdportspec; enable?: integer_Min0; 'icmp-type'?: pvefwicmptypespec; iface?: pveiface; log?: Tlog; macro?: String0_128; moveto?: integer_Min0; proto?: pvefwprotocolspec; source?: pvefwaddrspec; sport?: pvefwsportspec; type?: Ttype_1 }): Promise<null>;
            };
          };
          options: {
            /**
             * Get host firewall options.
             * GET /nodes/\{node\}/firewall/options
             * @allowtoken 1
             * @permissions {"check":["perm","/nodes/{node}",["Sys.Audit"]]}
             */
            $get(): Promise<nodesFirewallOptionsGetOptions>;
            /**
             * Set Firewall options.
             * PUT /nodes/\{node\}/firewall/options
             * @allowtoken 1
             * @permissions {"check":["perm","/nodes/{node}",["Sys.Modify"]]}
             */
            $put(param?: { delete?: pveconfigidlist_1; digest?: String0_64; enable?: boolean; log_level_in?: Tlog; log_level_out?: Tlog; log_nf_conntrack?: boolean; ndp?: boolean; nf_conntrack_allow_invalid?: boolean; nf_conntrack_helpers?: pvefwconntrackhelper; nf_conntrack_max?: integer_Min32768; nf_conntrack_tcp_timeout_established?: integer_Min7875; nf_conntrack_tcp_timeout_syn_recv?: integer30_60; nosmurfs?: boolean; protection_synflood?: boolean; protection_synflood_burst?: integer; protection_synflood_rate?: integer; smurf_log_level?: Tlog; tcp_flags_log_level?: Tlog; tcpflags?: boolean }): Promise<null>;
          };
          log: {
            /**
             * Read firewall log
             * GET /nodes/\{node\}/firewall/log
             * @allowtoken 1
             * @permissions {"check":["perm","/nodes/{node}",["Sys.Syslog"]]}
             */
            $get(param?: { limit?: integer_Min0; since?: integer_Min0; start?: integer_Min0; until?: integer_Min0 }): Promise<nodesFirewallLogLog[]>;
          };
        };
        replication: {
          /**
           * List status of all replication jobs on this node.
           * GET /nodes/\{node\}/replication
           * @allowtoken 1
           * @permissions {"description":"Requires the VM.Audit permission on /vms/<vmid>.","user":"all"}
           */
          $get(param?: { guest?: pvevmid }): Promise<nodesReplicationStatus[]>;
          $(id: string): {
            /**
             * Directory index.
             * GET /nodes/\{node\}/replication/\{id\}
             * @allowtoken 1
             * @permissions {"user":"all"}
             */
            $get(): Promise<nodesReplicationIndex[]>;
            status: {
              /**
               * Get replication job status.
               * GET /nodes/\{node\}/replication/\{id\}/status
               * @allowtoken 1
               * @permissions {"description":"Requires the VM.Audit permission on /vms/<vmid>.","user":"all"}
               */
              $get(): Promise<any>;
            };
            log: {
              /**
               * Read replication job log.
               * GET /nodes/\{node\}/replication/\{id\}/log
               * @allowtoken 1
               * @permissions {"description":"Requires the VM.Audit permission on /vms/<vmid>, or 'Sys.Audit' on '/nodes/<node>'","user":"all"}
               */
              $get(param?: { limit?: integer_Min0; start?: integer_Min0 }): Promise<nodesReplicationLogReadJobLog[]>;
            };
            schedule_now: {
              /**
               * Schedule replication job to start as soon as possible.
               * POST /nodes/\{node\}/replication/\{id\}/schedule_now
               * @allowtoken 1
               * @permissions {"check":["perm","/storage",["Datastore.Allocate"]]}
               */
              $post(): Promise<string>;
            };
          };
        };
        certificates: {
          /**
           * Node index.
           * GET /nodes/\{node\}/certificates
           * @allowtoken 1
           * @permissions {"user":"all"}
           */
          $get(): Promise<nodesCertificatesIndex[]>;
          acme: {
            /**
             * ACME index.
             * GET /nodes/\{node\}/certificates/acme
             * @allowtoken 1
             * @permissions {"user":"all"}
             */
            $get(): Promise<nodesCertificatesAcmeIndex[]>;
            certificate: {
              /**
               * Revoke existing certificate from CA.
               * DELETE /nodes/\{node\}/certificates/acme/certificate
               * @allowtoken 1
               * @permissions {"check":["perm","/nodes/{node}",["Sys.Modify"]]}
               */
              $delete(): Promise<string>;
              /**
               * Order a new certificate from ACME-compatible CA.
               * POST /nodes/\{node\}/certificates/acme/certificate
               * @allowtoken 1
               * @permissions {"check":["perm","/nodes/{node}",["Sys.Modify"]]}
               */
              $post(param?: { force?: boolean }): Promise<string>;
              /**
               * Renew existing certificate from CA.
               * PUT /nodes/\{node\}/certificates/acme/certificate
               * @allowtoken 1
               * @permissions {"check":["perm","/nodes/{node}",["Sys.Modify"]]}
               */
              $put(param?: { force?: boolean }): Promise<string>;
            };
          };
          info: {
            /**
             * Get information about node's certificates.
             * GET /nodes/\{node\}/certificates/info
             * @allowtoken 1
             * @permissions {"user":"all"}
             */
            $get(): Promise<nodesCertificatesInfoInfo[]>;
          };
          custom: {
            /**
             * DELETE custom certificate chain and key.
             * DELETE /nodes/\{node\}/certificates/custom
             * @allowtoken 1
             * @permissions {"check":["perm","/nodes/{node}",["Sys.Modify"]]}
             */
            $delete(param?: { restart?: boolean }): Promise<null>;
            /**
             * Upload or update custom certificate chain and key.
             * POST /nodes/\{node\}/certificates/custom
             * @allowtoken 1
             * @permissions {"check":["perm","/nodes/{node}",["Sys.Modify"]]}
             */
            $post(param: { certificates: pemcertificatechain; force?: boolean; key?: pemstring; restart?: boolean }): Promise<nodesCertificatesCustomUploadCustomCert>;
          };
        };
        config: {
          /**
           * Get node configuration options.
           * GET /nodes/\{node\}/config
           * @allowtoken 1
           * @permissions {"check":["perm","/",["Sys.Audit"]]}
           */
          $get(param?: { property?: Tproperty }): Promise<nodesConfigGetConfig>;
          /**
           * Set node configuration options.
           * PUT /nodes/\{node\}/config
           * @allowtoken 1
           * @permissions {"check":["perm","/",["Sys.Modify"]]}
           */
          $put(param?: { acme?: Tacme; acmedomain0?: Tacmedomain; acmedomain1?: Tacmedomain; acmedomain2?: Tacmedomain; acmedomain3?: Tacmedomain; delete?: pveconfigidlist_1; description?: String0_65536; digest?: String0_40; 'startall-onboot-delay'?: integer0_300; wakeonlan?: macaddr }): Promise<null>;
        };
        sdn: {
          /**
           * SDN index.
           * GET /nodes/\{node\}/sdn
           * @allowtoken 1
           * @permissions {"user":"all"}
           */
          $get(): Promise<nodesSdnSdnindex[]>;
          zones: {
            /**
             * Get status for all zones.
             * GET /nodes/\{node\}/sdn/zones
             * @allowtoken 1
             * @permissions {"description":"Only list entries where you have 'SDN.Audit'","user":"all"}
             */
            $get(): Promise<nodesSdnZonesIndex[]>;
            $(zone: string): {
              /**
               *
               * @allowtoken 1
               * @permissions {"check":["perm","/sdn/zones/{zone}",["SDN.Audit"],"any",1]}
               */
              $get(): Promise<nodesSdnZonesDiridx[]>;
              content: {
                /**
                 * List zone content.
                 * GET /nodes/\{node\}/sdn/zones/\{zone\}/content
                 * @allowtoken 1
                 * @permissions {"check":["perm","/sdn/zones/{zone}",["SDN.Audit"],"any",1]}
                 */
                $get(): Promise<nodesSdnZonesContentIndex[]>;
              };
            };
          };
        };
        version: {
          /**
           * API version details
           * GET /nodes/\{node\}/version
           * @allowtoken 1
           * @permissions {"user":"all"}
           */
          $get(): Promise<nodesVersionVersion>;
        };
        status: {
          /**
           * Read node status
           * GET /nodes/\{node\}/status
           * @allowtoken 1
           * @permissions {"check":["perm","/nodes/{node}",["Sys.Audit"]]}
           */
          $get(): Promise<any>;
          /**
           * Reboot or shutdown a node.
           * POST /nodes/\{node\}/status
           * @allowtoken 1
           * @permissions {"check":["perm","/nodes/{node}",["Sys.PowerMgmt"]]}
           */
          $post(param: { command: Tcommand_2 }): Promise<null>;
        };
        netstat: {
          /**
           * Read tap/vm network device interface counters
           * GET /nodes/\{node\}/netstat
           * @allowtoken 1
           * @permissions {"check":["perm","/nodes/{node}",["Sys.Audit"]]}
           */
          $get(): Promise<nodesNetstatNetstat[]>;
        };
        execute: {
          /**
           * Execute multiple commands in order, root only.
           * POST /nodes/\{node\}/execute
           * @allowtoken 1
           */
          $post(param: { commands: pvecommandbatch }): Promise<nodesExecuteExecute[]>;
        };
        wakeonlan: {
          /**
           * Try to wake a node via 'wake on LAN' network packet.
           * POST /nodes/\{node\}/wakeonlan
           * @allowtoken 1
           * @permissions {"check":["perm","/nodes/{node}",["Sys.PowerMgmt"]]}
           */
          $post(): Promise<string>;
        };
        rrd: {
          /**
           * Read node RRD statistics (returns PNG)
           * GET /nodes/\{node\}/rrd
           * @allowtoken 1
           * @permissions {"check":["perm","/nodes/{node}",["Sys.Audit"]]}
           */
          $get(param: { cf?: Tcf; ds: pveconfigidlist_1; timeframe: Ttimeframe }): Promise<nodesRrdRrd>;
        };
        rrddata: {
          /**
           * Read node RRD statistics
           * GET /nodes/\{node\}/rrddata
           * @allowtoken 1
           * @permissions {"check":["perm","/nodes/{node}",["Sys.Audit"]]}
           */
          $get(param: { cf?: Tcf; timeframe: Ttimeframe }): Promise<nodesRrddataRrddata[]>;
        };
        syslog: {
          /**
           * Read system log
           * GET /nodes/\{node\}/syslog
           * @allowtoken 1
           * @permissions {"check":["perm","/nodes/{node}",["Sys.Syslog"]]}
           */
          $get(param?: { limit?: integer_Min0; service?: String0_128; since?: Tsince; start?: integer_Min0; until?: Tsince }): Promise<nodesSyslogSyslog[]>;
        };
        journal: {
          /**
           * Read Journal
           * GET /nodes/\{node\}/journal
           * @allowtoken 1
           * @permissions {"check":["perm","/nodes/{node}",["Sys.Syslog"]]}
           */
          $get(param?: { endcursor?: string; lastentries?: integer_Min0; since?: integer_Min0; startcursor?: string; until?: integer_Min0 }): Promise<string[]>;
        };
        vncshell: {
          /**
           * Creates a VNC Shell proxy.
           * POST /nodes/\{node\}/vncshell
           * @allowtoken 1
           * @permissions {"check":["perm","/nodes/{node}",["Sys.Console"]]}
           */
          $post(param?: { cmd?: Tcmd; 'cmd-opts'?: string; height?: integer16_2160; websocket?: boolean; width?: integer16_4096 }): Promise<nodesVncshellVncshell>;
        };
        termproxy: {
          /**
           * Creates a VNC Shell proxy.
           * POST /nodes/\{node\}/termproxy
           * @allowtoken 1
           * @permissions {"check":["perm","/nodes/{node}",["Sys.Console"]]}
           */
          $post(param?: { cmd?: Tcmd; 'cmd-opts'?: string }): Promise<nodesTermproxyTermproxy>;
        };
        vncwebsocket: {
          /**
           * Opens a websocket for VNC traffic.
           * GET /nodes/\{node\}/vncwebsocket
           * @allowtoken 1
           * @permissions {"check":["perm","/nodes/{node}",["Sys.Console"]],"description":"You also need to pass a valid ticket (vncticket)."}
           */
          $get(param: { port: integer5900_5999; vncticket: String0_512 }): Promise<nodesVncwebsocketVncwebsocket>;
        };
        spiceshell: {
          /**
           * Creates a SPICE shell.
           * POST /nodes/\{node\}/spiceshell
           * @allowtoken 1
           * @permissions {"check":["perm","/nodes/{node}",["Sys.Console"]]}
           */
          $post(param?: { cmd?: Tcmd; 'cmd-opts'?: string; proxy?: address }): Promise<nodesSpiceshellSpiceshell>;
        };
        dns: {
          /**
           * Read DNS settings.
           * GET /nodes/\{node\}/dns
           * @allowtoken 1
           * @permissions {"check":["perm","/nodes/{node}",["Sys.Audit"]]}
           */
          $get(): Promise<nodesDnsDns>;
          /**
           * Write DNS settings.
           * PUT /nodes/\{node\}/dns
           * @allowtoken 1
           * @permissions {"check":["perm","/nodes/{node}",["Sys.Modify"]]}
           */
          $put(param: { dns1?: ip; dns2?: ip; dns3?: ip; search: string }): Promise<null>;
        };
        time: {
          /**
           * Read server time and time zone settings.
           * GET /nodes/\{node\}/time
           * @allowtoken 1
           * @permissions {"check":["perm","/nodes/{node}",["Sys.Audit"]]}
           */
          $get(): Promise<nodesTimeTime>;
          /**
           * Set time zone.
           * PUT /nodes/\{node\}/time
           * @allowtoken 1
           * @permissions {"check":["perm","/nodes/{node}",["Sys.Modify"]]}
           */
          $put(param: { timezone: string }): Promise<null>;
        };
        aplinfo: {
          /**
           * Get list of appliances.
           * GET /nodes/\{node\}/aplinfo
           * @allowtoken 1
           * @permissions {"user":"all"}
           */
          $get(): Promise<nodesAplinfoAplinfo[]>;
          /**
           * Download appliance templates.
           * POST /nodes/\{node\}/aplinfo
           * @allowtoken 1
           * @permissions {"check":["perm","/storage/{storage}",["Datastore.AllocateTemplate"]]}
           */
          $post(param: { storage: pvestorageid; template: String0_255 }): Promise<string>;
        };
        'query-url-metadata': {
          /**
           * Query metadata of an URL: file size, file name and mime type.
           * GET /nodes/\{node\}/query-url-metadata
           * @allowtoken 1
           * @permissions {"check":["perm","/",["Sys.Audit","Sys.Modify"]]}
           */
          $get(param: { url: Turl; 'verify-certificates'?: boolean }): Promise<nodesQueryUrlMetadataQueryUrlMetadata>;
        };
        report: {
          /**
           * Gather various systems information about a node
           * GET /nodes/\{node\}/report
           * @allowtoken 1
           * @permissions {"check":["perm","/nodes/{node}",["Sys.Audit"]]}
           */
          $get(): Promise<string>;
        };
        startall: {
          /**
           * Start all VMs and containers located on this node (by default only those with onboot=1).
           * POST /nodes/\{node\}/startall
           * @allowtoken 1
           * @permissions {"description":"The 'VM.PowerMgmt' permission is required on '/' or on '/vms/<ID>' for each ID passed via the 'vms' parameter.","user":"all"}
           */
          $post(param?: { force?: boolean; vms?: pvevmidlist }): Promise<string>;
        };
        stopall: {
          /**
           * Stop all VMs and Containers.
           * POST /nodes/\{node\}/stopall
           * @allowtoken 1
           * @permissions {"description":"The 'VM.PowerMgmt' permission is required on '/' or on '/vms/<ID>' for each ID passed via the 'vms' parameter.","user":"all"}
           */
          $post(param?: { 'force-stop'?: boolean; timeout?: integer0_7200; vms?: pvevmidlist }): Promise<string>;
        };
        suspendall: {
          /**
           * Suspend all VMs.
           * POST /nodes/\{node\}/suspendall
           * @allowtoken 1
           * @permissions {"description":"The 'VM.PowerMgmt' permission is required on '/' or on '/vms/<ID>' for each ID passed via the 'vms' parameter. Additionally, you need 'VM.Config.Disk' on the '/vms/{vmid}' path and 'Datastore.AllocateSpace' for the configured state-storage(s)","user":"all"}
           */
          $post(param?: { vms?: pvevmidlist }): Promise<string>;
        };
        migrateall: {
          /**
           * Migrate all VMs and Containers.
           * POST /nodes/\{node\}/migrateall
           * @allowtoken 1
           * @permissions {"description":"The 'VM.Migrate' permission is required on '/' or on '/vms/<ID>' for each ID passed via the 'vms' parameter.","user":"all"}
           */
          $post(param: { maxworkers?: integer_Min1; target: pvenode; vms?: pvevmidlist; 'with-local-disks'?: boolean }): Promise<string>;
        };
        hosts: {
          /**
           * Get the content of /etc/hosts.
           * GET /nodes/\{node\}/hosts
           * @allowtoken 1
           * @permissions {"check":["perm","/",["Sys.Audit"]]}
           */
          $get(): Promise<nodesHostsGetEtcHosts>;
          /**
           * Write /etc/hosts.
           * POST /nodes/\{node\}/hosts
           * @allowtoken 1
           * @permissions {"check":["perm","/nodes/{node}",["Sys.Modify"]]}
           */
          $post(param: { data: string; digest?: String0_64 }): Promise<null>;
        };
      };
    };
    storage: {
      /**
       * Storage index.
       * GET /storage
       * @allowtoken 1
       * @permissions {"description":"Only list entries where you have 'Datastore.Audit' or 'Datastore.AllocateSpace' permissions on '/storage/<storage>'","user":"all"}
       */
      $get(param?: { type?: Ttype_19 }): Promise<storageIndex[]>;
      /**
       * Create a new storage.
       * POST /storage
       * @allowtoken 1
       * @permissions {"check":["perm","/storage",["Datastore.Allocate"]]}
       */
      $post(param: { authsupported?: string; base?: pvevolumeid; blocksize?: string; bwlimit?: Tbwlimit; comstar_hg?: string; comstar_tg?: string; content?: pvestoragecontentlist; 'content-dirs'?: pvediroverridelist; 'create-base-path'?: boolean; 'create-subdirs'?: boolean; 'data-pool'?: string; datastore?: string; disable?: boolean; domain?: String0_256; 'encryption-key'?: string; export?: pvestoragepath; fingerprint?: Tfingerprint; format?: pvestorageformat; 'fs-name'?: pveconfigid_1; fuse?: boolean; is_mountpoint?: string; iscsiprovider?: string; keyring?: string; krbd?: boolean; lio_tpg?: string; 'master-pubkey'?: string; 'max-protected-backups'?: integer_Min__1; maxfiles?: integer_Min0; mkdir?: boolean; monhost?: pvestorageportaldnslist; mountpoint?: pvestoragepath; namespace?: string; nocow?: boolean; nodes?: pvenodelist; nowritecache?: boolean; options?: pvestorageoptions; password?: String0_256; path?: pvestoragepath; pool?: string; port?: integer1_65535; portal?: pvestorageportaldns; preallocation?: Tpreallocation; 'prune-backups'?: prunebackups; saferemove?: boolean; saferemove_throughput?: string; server?: pvestorageserver; server2?: pvestorageserver; share?: string; shared?: boolean; smbversion?: Tsmbversion; sparse?: boolean; storage: pvestorageid; subdir?: pvestoragepath; tagged_only?: boolean; target?: string; thinpool?: pvestoragevgname; transport?: Ttransport; type: Ttype_19; username?: string; vgname?: pvestoragevgname; volume?: string }): Promise<storageCreate>;
      $(storage: string): {
        /**
         * Delete storage configuration.
         * DELETE /storage/\{storage\}
         * @allowtoken 1
         * @permissions {"check":["perm","/storage",["Datastore.Allocate"]]}
         */
        $delete(): Promise<null>;
        /**
         * Read storage configuration.
         * GET /storage/\{storage\}
         * @allowtoken 1
         * @permissions {"check":["perm","/storage/{storage}",["Datastore.Allocate"]]}
         */
        $get(): Promise<any>;
        /**
         * Update storage configuration.
         * PUT /storage/\{storage\}
         * @allowtoken 1
         * @permissions {"check":["perm","/storage",["Datastore.Allocate"]]}
         */
        $put(param?: { blocksize?: string; bwlimit?: Tbwlimit; comstar_hg?: string; comstar_tg?: string; content?: pvestoragecontentlist; 'content-dirs'?: pvediroverridelist; 'create-base-path'?: boolean; 'create-subdirs'?: boolean; 'data-pool'?: string; delete?: pveconfigidlist; digest?: String0_64; disable?: boolean; domain?: String0_256; 'encryption-key'?: string; fingerprint?: Tfingerprint; format?: pvestorageformat; 'fs-name'?: pveconfigid_1; fuse?: boolean; is_mountpoint?: string; keyring?: string; krbd?: boolean; lio_tpg?: string; 'master-pubkey'?: string; 'max-protected-backups'?: integer_Min__1; maxfiles?: integer_Min0; mkdir?: boolean; monhost?: pvestorageportaldnslist; mountpoint?: pvestoragepath; namespace?: string; nocow?: boolean; nodes?: pvenodelist; nowritecache?: boolean; options?: pvestorageoptions; password?: String0_256; pool?: string; port?: integer1_65535; preallocation?: Tpreallocation; 'prune-backups'?: prunebackups; saferemove?: boolean; saferemove_throughput?: string; server?: pvestorageserver; server2?: pvestorageserver; shared?: boolean; smbversion?: Tsmbversion; sparse?: boolean; subdir?: pvestoragepath; tagged_only?: boolean; transport?: Ttransport; username?: string }): Promise<storageUpdate>;
      };
    };
    access: {
      /**
       * Directory index.
       * GET /access
       * @allowtoken 1
       * @permissions {"user":"all"}
       */
      $get(): Promise<accessIndex[]>;
      users: {
        /**
         * User index.
         * GET /access/users
         * @allowtoken 1
         * @permissions {"description":"The returned list is restricted to users where you have 'User.Modify' or 'Sys.Audit' permissions on '/access/groups' or on a group the user belongs too. But it always includes the current (authenticated) user.","user":"all"}
         */
        $get(param?: { enabled?: boolean; full?: boolean }): Promise<accessUsersIndex[]>;
        /**
         * Create new user.
         * POST /access/users
         * @allowtoken 1
         * @permissions {"check":["and",["userid-param","Realm.AllocateUser"],["userid-group",["User.Modify"],"groups_param","create"]],"description":"You need 'Realm.AllocateUser' on '/access/realm/<realm>' on the realm of user <userid>, and 'User.Modify' permissions to '/access/groups/<group>' for any group specified (or 'User.Modify' on '/access/groups' if you pass no groups."}
         */
        $post(param: { comment?: string; email?: emailopt; enable?: boolean; expire?: integer_Min0; firstname?: string; groups?: pvegroupidlist; keys?: string; lastname?: string; password?: String5_64; userid: pveuserid }): Promise<null>;
        $(userid: string): {
          /**
           * Delete user.
           * DELETE /access/users/\{userid\}
           * @allowtoken 1
           * @permissions {"check":["and",["userid-param","Realm.AllocateUser"],["userid-group",["User.Modify"]]]}
           */
          $delete(): Promise<null>;
          /**
           * Get user configuration.
           * GET /access/users/\{userid\}
           * @allowtoken 1
           * @permissions {"check":["userid-group",["User.Modify","Sys.Audit"]]}
           */
          $get(): Promise<accessUsersReadUser>;
          /**
           * Update user configuration.
           * PUT /access/users/\{userid\}
           * @allowtoken 1
           * @permissions {"check":["userid-group",["User.Modify"],"groups_param","update"]}
           */
          $put(param?: { append?: boolean; comment?: string; email?: emailopt; enable?: boolean; expire?: integer_Min0; firstname?: string; groups?: pvegroupidlist; keys?: string; lastname?: string }): Promise<null>;
          tfa: {
            /**
             * Get user TFA types (Personal and Realm).
             * GET /access/users/\{userid\}/tfa
             * @allowtoken 1
             * @permissions {"check":["or",["userid-param","self"],["userid-group",["User.Modify","Sys.Audit"]]]}
             */
            $get(param?: { multiple?: boolean }): Promise<accessUsersTfaReadUserTfaType>;
          };
          'unlock-tfa': {
            /**
             * Unlock a user's TFA authentication.
             * PUT /access/users/\{userid\}/unlock-tfa
             * @allowtoken 1
             * @permissions {"check":["userid-group",["User.Modify"]]}
             */
            $put(): Promise<boolean>;
          };
          token: {
            /**
             * Get user API tokens.
             * GET /access/users/\{userid\}/token
             * @allowtoken 1
             * @permissions {"check":["or",["userid-param","self"],["userid-group",["User.Modify"]]]}
             */
            $get(): Promise<accessUsersTokenTokenIndex[]>;
            $(tokenid: string): {
              /**
               * Remove API token for a specific user.
               * DELETE /access/users/\{userid\}/token/\{tokenid\}
               * @allowtoken 1
               * @permissions {"check":["or",["userid-param","self"],["userid-group",["User.Modify"]]]}
               */
              $delete(): Promise<null>;
              /**
               * Get specific API token information.
               * GET /access/users/\{userid\}/token/\{tokenid\}
               * @allowtoken 1
               * @permissions {"check":["or",["userid-param","self"],["userid-group",["User.Modify"]]]}
               */
              $get(): Promise<accessUsersTokenReadToken>;
              /**
               * Generate a new API token for a specific user. NOTE: returns API token value, which needs to be stored as it cannot be retrieved afterwards!
               * POST /access/users/\{userid\}/token/\{tokenid\}
               * @allowtoken 1
               * @permissions {"check":["or",["userid-param","self"],["userid-group",["User.Modify"]]]}
               */
              $post(param?: { comment?: string; expire?: integer_Min0; privsep?: boolean }): Promise<accessUsersTokenGenerateToken>;
              /**
               * Update API token for a specific user.
               * PUT /access/users/\{userid\}/token/\{tokenid\}
               * @allowtoken 1
               * @permissions {"check":["or",["userid-param","self"],["userid-group",["User.Modify"]]]}
               */
              $put(param?: { comment?: string; expire?: integer_Min0; privsep?: boolean }): Promise<accessUsersTokenUpdateTokenInfo>;
            };
          };
        };
      };
      groups: {
        /**
         * Group index.
         * GET /access/groups
         * @allowtoken 1
         * @permissions {"description":"The returned list is restricted to groups where you have 'User.Modify', 'Sys.Audit'  or 'Group.Allocate' permissions on /access/groups/<group>.","user":"all"}
         */
        $get(): Promise<accessGroupsIndex[]>;
        /**
         * Create new group.
         * POST /access/groups
         * @allowtoken 1
         * @permissions {"check":["perm","/access/groups",["Group.Allocate"]]}
         */
        $post(param: { comment?: string; groupid: pvegroupid }): Promise<null>;
        $(groupid: string): {
          /**
           * Delete group.
           * DELETE /access/groups/\{groupid\}
           * @allowtoken 1
           * @permissions {"check":["perm","/access/groups",["Group.Allocate"]]}
           */
          $delete(): Promise<null>;
          /**
           * Get group configuration.
           * GET /access/groups/\{groupid\}
           * @allowtoken 1
           * @permissions {"check":["perm","/access/groups",["Sys.Audit","Group.Allocate"],"any",1]}
           */
          $get(): Promise<accessGroupsReadGroup>;
          /**
           * Update group data.
           * PUT /access/groups/\{groupid\}
           * @allowtoken 1
           * @permissions {"check":["perm","/access/groups",["Group.Allocate"]]}
           */
          $put(param?: { comment?: string }): Promise<null>;
        };
      };
      roles: {
        /**
         * Role index.
         * GET /access/roles
         * @allowtoken 1
         * @permissions {"user":"all"}
         */
        $get(): Promise<accessRolesIndex[]>;
        /**
         * Create new role.
         * POST /access/roles
         * @allowtoken 1
         * @permissions {"check":["perm","/access",["Sys.Modify"]]}
         */
        $post(param: { privs?: pveprivlist; roleid: pveroleid }): Promise<null>;
        $(roleid: string): {
          /**
           * Delete role.
           * DELETE /access/roles/\{roleid\}
           * @allowtoken 1
           * @permissions {"check":["perm","/access",["Sys.Modify"]]}
           */
          $delete(): Promise<null>;
          /**
           * Get role configuration.
           * GET /access/roles/\{roleid\}
           * @allowtoken 1
           * @permissions {"user":"all"}
           */
          $get(): Promise<accessRolesReadRole>;
          /**
           * Update an existing role.
           * PUT /access/roles/\{roleid\}
           * @allowtoken 1
           * @permissions {"check":["perm","/access",["Sys.Modify"]]}
           */
          $put(param?: { append?: boolean; privs?: pveprivlist }): Promise<null>;
        };
      };
      acl: {
        /**
         * Get Access Control List (ACLs).
         * GET /access/acl
         * @allowtoken 1
         * @permissions {"description":"The returned list is restricted to objects where you have rights to modify permissions.","user":"all"}
         */
        $get(): Promise<accessAclReadAcl[]>;
        /**
         * Update Access Control List (add or remove permissions).
         * PUT /access/acl
         * @allowtoken 1
         * @permissions {"check":["perm-modify","{path}"]}
         */
        $put(param: { delete?: boolean; groups?: pvegroupidlist; path: string; propagate?: boolean; roles: pveroleidlist; tokens?: pvetokenidlist; users?: pveuseridlist }): Promise<null>;
      };
      domains: {
        /**
         * Authentication domain index.
         * GET /access/domains
         * @allowtoken 1
         * @permissions {"description":"Anyone can access that, because we need that list for the login box (before the user is authenticated).","user":"world"}
         */
        $get(): Promise<accessDomainsIndex[]>;
        /**
         * Add an authentication server.
         * POST /access/domains
         * @allowtoken 1
         * @permissions {"check":["perm","/access/realm",["Realm.Allocate"]]}
         */
        $post(param: { 'acr-values'?: string; autocreate?: boolean; base_dn?: String0_256; bind_dn?: String0_256; capath?: string; 'case-sensitive'?: boolean; cert?: string; certkey?: string; 'check-connection'?: boolean; 'client-id'?: String0_256; 'client-key'?: String0_256; comment?: String0_4096; default?: boolean; domain?: Tdomain; filter?: String0_2048; group_classes?: ldapsimpleattrlist; group_dn?: String0_256; group_filter?: String0_2048; group_name_attr?: ldapsimpleattr; 'issuer-url'?: String0_256; mode?: Tmode_3; password?: string; port?: integer1_65535; prompt?: Tprompt; realm: pverealm; scopes?: string; secure?: boolean; server1?: address_1; server2?: address_1; sslversion?: Tsslversion; 'sync-defaults-options'?: realmsyncoptions; sync_attributes?: Tsync_attributes; tfa?: pvetfaconfig; type: Ttype_20; user_attr?: Tuser_attr; user_classes?: ldapsimpleattrlist; 'username-claim'?: string; verify?: boolean }): Promise<null>;
        $(realm: string): {
          /**
           * Delete an authentication server.
           * DELETE /access/domains/\{realm\}
           * @allowtoken 1
           * @permissions {"check":["perm","/access/realm",["Realm.Allocate"]]}
           */
          $delete(): Promise<null>;
          /**
           * Get auth server configuration.
           * GET /access/domains/\{realm\}
           * @allowtoken 1
           * @permissions {"check":["perm","/access/realm",["Realm.Allocate","Sys.Audit"],"any",1]}
           */
          $get(): Promise<any>;
          /**
           * Update authentication server settings.
           * PUT /access/domains/\{realm\}
           * @allowtoken 1
           * @permissions {"check":["perm","/access/realm",["Realm.Allocate"]]}
           */
          $put(param?: { 'acr-values'?: string; autocreate?: boolean; base_dn?: String0_256; bind_dn?: String0_256; capath?: string; 'case-sensitive'?: boolean; cert?: string; certkey?: string; 'check-connection'?: boolean; 'client-id'?: String0_256; 'client-key'?: String0_256; comment?: String0_4096; default?: boolean; delete?: pveconfigidlist; digest?: String0_64; domain?: Tdomain; filter?: String0_2048; group_classes?: ldapsimpleattrlist; group_dn?: String0_256; group_filter?: String0_2048; group_name_attr?: ldapsimpleattr; 'issuer-url'?: String0_256; mode?: Tmode_3; password?: string; port?: integer1_65535; prompt?: Tprompt; scopes?: string; secure?: boolean; server1?: address_1; server2?: address_1; sslversion?: Tsslversion; 'sync-defaults-options'?: realmsyncoptions; sync_attributes?: Tsync_attributes; tfa?: pvetfaconfig; user_attr?: Tuser_attr; user_classes?: ldapsimpleattrlist; verify?: boolean }): Promise<null>;
          sync: {
            /**
             * Syncs users and/or groups from the configured LDAP to user.cfg. NOTE: Synced groups will have the name 'name-$realm', so make sure those groups do not exist to prevent overwriting.
             * POST /access/domains/\{realm\}/sync
             * @allowtoken 1
             * @permissions {"check":["and",["perm","/access/realm/{realm}",["Realm.AllocateUser"]],["perm","/access/groups",["User.Modify"]]],"description":"'Realm.AllocateUser' on '/access/realm/<realm>' and  'User.Modify' permissions to '/access/groups/'."}
             */
            $post(param?: { 'dry-run'?: boolean; 'enable-new'?: boolean; full?: boolean; purge?: boolean; 'remove-vanished'?: Tremovevanished; scope?: Tscope_1 }): Promise<string>;
          };
        };
      };
      openid: {
        /**
         * Directory index.
         * GET /access/openid
         * @allowtoken 1
         * @permissions {"user":"all"}
         */
        $get(): Promise<accessOpenidIndex[]>;
        'auth-url': {
          /**
           * Get the OpenId Authorization Url for the specified realm.
           * POST /access/openid/auth-url
           * @allowtoken 1
           * @permissions {"user":"world"}
           */
          $post(param: { realm: pverealm; 'redirect-url': String0_255 }): Promise<string>;
        };
        login: {
          /**
           * Verify OpenID authorization code and create a ticket.
           * POST /access/openid/login
           * @allowtoken 1
           * @permissions {"user":"world"}
           */
          $post(param: { code: String0_4096; 'redirect-url': String0_255; state: String0_1024 }): Promise<accessOpenidLoginLogin>;
        };
      };
      tfa: {
        /**
         * List TFA configurations of users.
         * GET /access/tfa
         * @allowtoken 1
         * @permissions {"description":"Returns all or just the logged-in user, depending on privileges.","user":"all"}
         */
        $get(): Promise<accessTfaListTfa[]>;
        $(userid: string): {
          /**
           * List TFA configurations of users.
           * GET /access/tfa/\{userid\}
           * @allowtoken 1
           * @permissions {"check":["or",["userid-param","self"],["userid-group",["User.Modify","Sys.Audit"]]]}
           */
          $get(): Promise<accessTfaListUserTfa[]>;
          /**
           * Add a TFA entry for a user.
           * POST /access/tfa/\{userid\}
           * @allowtoken 0
           * @permissions {"check":["or",["userid-param","self"],["userid-group",["User.Modify"]]]}
           */
          $post(param: { challenge?: string; description?: String0_255; password?: String5_64; totp?: string; type: Ttype_21; value?: string }): Promise<accessTfaAddTfaEntry>;
          $(id: string): {
            /**
             * Delete a TFA entry by ID.
             * DELETE /access/tfa/\{userid\}/\{id\}
             * @allowtoken 0
             * @permissions {"check":["or",["userid-param","self"],["userid-group",["User.Modify"]]]}
             */
            $delete(param?: { password?: String5_64 }): Promise<null>;
            /**
             * Fetch a requested TFA entry if present.
             * GET /access/tfa/\{userid\}/\{id\}
             * @allowtoken 1
             * @permissions {"check":["or",["userid-param","self"],["userid-group",["User.Modify","Sys.Audit"]]]}
             */
            $get(): Promise<accessTfaGetTfaEntry>;
            /**
             * Add a TFA entry for a user.
             * PUT /access/tfa/\{userid\}/\{id\}
             * @allowtoken 0
             * @permissions {"check":["or",["userid-param","self"],["userid-group",["User.Modify"]]]}
             */
            $put(param?: { description?: String0_255; enable?: boolean; password?: String5_64 }): Promise<null>;
          };
        };
      };
      ticket: {
        /**
         * Dummy. Useful for formatters which want to provide a login page.
         * GET /access/ticket
         * @allowtoken 1
         * @permissions {"user":"world"}
         */
        $get(): Promise<null>;
        /**
         * Create or verify authentication ticket.
         * POST /access/ticket
         * @allowtoken 0
         * @permissions {"description":"You need to pass valid credientials.","user":"world"}
         */
        $post(param: { 'new-format'?: boolean; otp?: string; password: string; path?: String0_64; privs?: pveprivlist_1; realm?: pverealm; 'tfa-challenge'?: string; username: String0_64 }): Promise<accessTicketCreateTicket>;
      };
      password: {
        /**
         * Change user password.
         * PUT /access/password
         * @allowtoken 0
         * @permissions {"check":["or",["userid-param","self"],["and",["userid-param","Realm.AllocateUser"],["userid-group",["User.Modify"]]]],"description":"Each user is allowed to change his own password. A user can change the password of another user if he has 'Realm.AllocateUser' (on the realm of user <userid>) and 'User.Modify' permission on /access/groups/<group> on a group where user <userid> is member of."}
         */
        $put(param: { password: String5_64; userid: pveuserid }): Promise<null>;
      };
      permissions: {
        /**
         * Retrieve effective permissions of given user/token.
         * GET /access/permissions
         * @allowtoken 1
         * @permissions {"description":"Each user/token is allowed to dump their own permissions. A user can dump the permissions of another user if they have 'Sys.Audit' permission on /access.","user":"all"}
         */
        $get(param?: { path?: string; userid?: Tuserid }): Promise<any>;
      };
    };
    pools: {
      /**
       * Delete pool.
       * DELETE /pools
       * @allowtoken 1
       * @permissions {"check":["perm","/pool/{poolid}",["Pool.Allocate"]],"description":"You can only delete empty pools (no members)."}
       */
      $delete(param: { poolid: pvepoolid }): Promise<null>;
      /**
       * List pools or get pool configuration.
       * GET /pools
       * @allowtoken 1
       * @permissions {"description":"List all pools where you have Pool.Audit permissions on /pool/<pool>, or the pool specific with {poolid}","user":"all"}
       */
      $get(param?: { poolid?: pvepoolid; type?: Ttype_22 }): Promise<poolsIndex[]>;
      /**
       * Create new pool.
       * POST /pools
       * @allowtoken 1
       * @permissions {"check":["perm","/pool/{poolid}",["Pool.Allocate"]]}
       */
      $post(param: { comment?: string; poolid: pvepoolid }): Promise<null>;
      /**
       * Update pool.
       * PUT /pools
       * @allowtoken 1
       * @permissions {"check":["perm","/pool/{poolid}",["Pool.Allocate"]],"description":"You also need the right to modify permissions on any object you add/delete."}
       */
      $put(param: { 'allow-move'?: boolean; comment?: string; delete?: boolean; poolid: pvepoolid; storage?: pvestorageidlist; vms?: pvevmidlist }): Promise<null>;
      $(poolid: string): {
        /**
         * Delete pool (deprecated, no support for nested pools, use 'DELETE /pools/?poolid=\{poolid\}').
         * DELETE /pools/\{poolid\}
         * @allowtoken 1
         * @permissions {"check":["perm","/pool/{poolid}",["Pool.Allocate"]],"description":"You can only delete empty pools (no members)."}
         */
        $delete(): Promise<null>;
        /**
         * Get pool configuration (deprecated, no support for nested pools, use 'GET /pools/?poolid=\{poolid\}').
         * GET /pools/\{poolid\}
         * @allowtoken 1
         * @permissions {"check":["perm","/pool/{poolid}",["Pool.Audit"]]}
         */
        $get(param?: { type?: Ttype_22 }): Promise<poolsReadPool>;
        /**
         * Update pool data (deprecated, no support for nested pools - use 'PUT /pools/?poolid=\{poolid\}' instead).
         * PUT /pools/\{poolid\}
         * @allowtoken 1
         * @permissions {"check":["perm","/pool/{poolid}",["Pool.Allocate"]],"description":"You also need the right to modify permissions on any object you add/delete."}
         */
        $put(param?: { 'allow-move'?: boolean; comment?: string; delete?: boolean; storage?: pvestorageidlist; vms?: pvevmidlist }): Promise<null>;
      };
    };
    version: {
      /**
       * API version details, including some parts of the global datacenter config.
       * GET /version
       * @allowtoken 1
       * @permissions {"user":"all"}
       */
      $get(): Promise<versionVersion>;
    };
  }
}
