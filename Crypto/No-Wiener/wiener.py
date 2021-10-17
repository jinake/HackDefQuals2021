#!/usr/bin/python3
# -*- coding: utf-8 -*-

### DEPENDENCIES ###
    
    # sudo apt install libmpc-dev
    # pip3 install gmpy2

#import gmpy2
from Crypto.PublicKey import RSA

with open('./key.rsa.pub', 'r') as fd:
    
    pub_key = RSA.importKey(fd.read())
    
    e = pub_key.e
    N = pub_key.n

    print(f'e : {e}\n')
    print(f'N : {N}\n')
    

with open('flag.enc', 'rb') as fd:
    
    C = int.from_bytes(fd.read(), byteorder="big") 
    
    print(f'C : {C}\n')

def cfer(n, d):
    '''
        Continued Fraction Expansion of Rationals
        e/N === n/d
    '''
    e = []

    q = n // d
    r = n % d
    e.append(q)

    while r != 0:
        n, d = d, r
        q = n // d
        r = n % d
        e.append(q)

    return e

def convergents(e):
    n = [] # Nominators
    d = [] # Denominators

    for i in range(len(e)):
        if i == 0:
            ni = e[i]
            di = 1
        elif i == 1:
            ni = e[i]*e[i-1] + 1
            di = e[i]
        else: # i > 1
            ni = e[i]*n[i-1] + n[i-2]
            di = e[i]*d[i-1] + d[i-2]

        n.append(ni)
        d.append(di)
        yield (ni, di)

def phi_N(e, k_d):
    return (e*k_d[1] - 1.0)/k_d[0]

def _x(N, phi_N,):
    return -1 * ((N - phi_N) + 1)

if __name__ == '__main__':
    
    iterador = convergents(cfer(e, N))
    next(iterador)

    while True:

        k_d = next(iterador)
        print(k_d)

        a = 1
        b = _x(N, phi_N(e, k_d))
        c = N

        r = b*2 - 4*a*c

        if r > 0:
            x1 = (((-b) + sqrt(r))/(2*a))
            x2 = (((-b) - sqrt(r))/(2*a))

            print(x1, x2, k_d)
            break