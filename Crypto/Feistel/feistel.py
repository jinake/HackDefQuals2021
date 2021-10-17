import sys
import base64
from collections import deque

def xor(a, b):
    assert len(a) == len(b), "XOR"
    xored = [ chr(ord(s1) ^ ord(s2)) for s1,s2 in zip (a, b) ]
    return "".join(xored)

def funcion_f(a, b):
    assert len(a) == len(b), "F"
    functioned = [ chr(ord(s1) ^ ord(s2)) for s1,s2 in zip (a, b) ]
    return "".join(functioned)

def round(cadena, llave, last = False):
    assert len(cadena) % 16 == 0, "ROUND"
    izq, der = cadena[:8], cadena[8:]
    if last == False:
        return der + xor(funcion_f(der, llave), izq)
    if last == True:
        return xor(funcion_f(der, llave), izq) + der

def key_scheduling_algorithm(key, ronda):
    assert len(key) % 8 == 0, "KSA"
    llave = deque([c for c in key])
    llave.rotate(ronda)
    return ''.join([str(k) for k in list(llave)])

def encrypt(mensaje, llave, rondas):
    tmp, res = "", ""
    if len(mensaje) % 16 != 0:
        mensaje += 'f' * (16 - (len(mensaje) % 16))
    for bloque in range(1,(len(mensaje)/16)+1):
        tmp = mensaje[(bloque-1)*16:bloque*16]
        for r in range(1,rondas+1):
            if r != rondas:
                tmp = round(tmp, key_scheduling_algorithm(llave, r))
            else:
                tmp = round(tmp, key_scheduling_algorithm(llave, r), True)
        res += tmp
    return res

if __name__ == '__main__':
    mensaje = sys.argv[1]
    llave = sys.argv[2]
    rondas = sys.argv[3]
    if len(sys.argv) < 3:
        print("USO python3 ./feistel.py 'mensaje_a_cifrar' 'llave' numero_de_rondas")
    cifrado = encrypt(mensaje, llave, int(rondas))
    print("ENCRYPTED: " + base64.b64encode(cifrado))
