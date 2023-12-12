import sys
import socket
import threading


class Client():

    def __init__(self, client_name):
        self.socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.server_address = ('localhost', int(sys.argv[2]))

        self.socket.connect_ex(self.server_address)
        self.client_name = client_name
        
        if(self.socket.recv(1024).decode("utf-8")!= 'A sala está lotada!'):
            print(' ')
            print(self.socket.recv(1024).decode("utf-8"))
            send = threading.Thread(target=self.sendMessage)
            send.start()
            receive = threading.Thread(target=self.receiveMessage)
            receive.start()
        else:
            print(self.socket.recv(1024).decode("utf-8"))
            self.socket.close()
            quit()

    def sendMessage(self):
        self.socket.send(bytes(self.client_name, encoding='utf-8'))  
        while True:
            try:
                c = input()
                sys.stdout.write("\x1b[1A\x1b[2K") # Delete previous line
                self.socket.send(bytes(c, encoding='utf-8')) 
            except:
                self.socket.close()
                return

    def receiveMessage(self):
        while True:
            try:
                print(self.socket.recv(1024).decode("utf-8"))
            except:
                self.socket.close()
                return

if __name__ == "__main__":
    client_name = sys.argv[1]
    Client(client_name)