import string

def convert(plain):
    encrypted = [0] * len(plain)
    i = 0
    i2 = 0
    for i3 in range(len(plain)):
        i2 ^= ((plain[i3] << 4) & 255) + i
        i = (plain[i3] & 240) >> 4
        encrypted[i3] = i2
    print(encrypted)

def convert2(plain):
    encrypted = [0] * len(plain)
    i = 0
    i2 = 0
    for i3 in range(len(plain)):
        a = plain[i3] << 4
        b = a & 255
        c = b + i
        i2 ^= c
        d = plain[i3] & 240
        i = d >> 4
        encrypted[i3] = i2
        print(f'i:{i}\ni2:{i2}\ni3:{i3}\nencrypted[{i3}]:{encrypted[i3]}')
    print(encrypted)

def decrypt(encrypted_flag):
    
    plain = [0] * len(encrypted_flag)
    candidates = []
    i = 0
    i2 = 0

    for i3 in range(len(encrypted_flag)):
        for c in string.printable:
            if i2 ^ (((ord(c) << 4) & 255) + i) == encrypted_flag[i3]:
                candidates.append(c)
        print(candidates)
        c = input('Which one sir? ')
        plain[i3] = c
        i2 ^= (((ord(plain[i3]) << 4) & 255) + i)
        i = (ord(plain[i3]) & 240) >> 4
        print(f'i3: {i3} - i2: {i2} - i: {i}')
        candidates = []

if __name__ == "__main__":

    encrypted_flag = [128, 148, 162, 20, 82, 4, 98, 212,   3,   7,  52, 115, 164, 150, 245, 226,  33, 247, 149,  83,  21, 102, 176]
   
    decrypt(encrypted_flag)