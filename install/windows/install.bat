msiexec.exe /i "%~dp0ZeroTier One.msi"
call zerotier-cli.bat join a53c095f7a9a53a6
netsh advfirewall firewall add rule name="gorominion" dir=in action=allow program="%~dp0deno.exe" protocol=TCP localport=31280
%~dp0gorominion.exe install
%~dp0gorominion.exe restart
