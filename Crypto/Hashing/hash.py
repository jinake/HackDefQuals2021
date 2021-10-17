#!/bin/python3

from pwn import *
from itertools import permutations
import hashlib

io = remote('52.33.132.169', 1449)
print(io.recvline().decode().strip())
second_line = io.recvline().decode().strip()
print(second_line)
print(io.recvline().decode().strip())

start = second_line.split(' ')[6]
string_length = int(second_line.split(' ')[9])
end = second_line.split(' ')[21]

print(f'\nstart: {start}')
print(f'length: {string_length}')
print(f'end: {end}\n')

words = permutations(string.printable, string_length - len(start))

while True:
    word = start + ''.join(next(words))
    sha1_hash = hashlib.sha1(word.encode('utf-8')).hexdigest()
    if sha1_hash.endswith(end):
        print(f'Cadena: {word} ---> Hash: {sha1_hash}\n')
        io.sendline(str.encode(word))
        print(io.recvline().decode())
        io.close()
        break