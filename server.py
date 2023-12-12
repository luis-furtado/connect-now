import socket
import _thread
from datetime import datetime
import sys

class Server():

    def __init__(self):
        self.currentUsers = {}

        self.socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.server_address = ('localhost', int(sys.argv[1]))
        self.socket.bind(self.server_address)
        self.socket.listen(10)

        print('Starting up on {} port {}'.format(*self.server_address))
        self.waitNewConnections()

    def waitNewConnections(self):
        while True:
            connection, _ = self.socket.accept()

            connection.sendall(bytes(sys.argv[3], encoding='utf-8'))
            _thread.start_new_thread(self.onNewConnectionHook, (connection,))
                 

    def onNewConnectionHook(self, connection):
        try:
            if len(self.currentUsers) < int(sys.argv[2]):
                connection.sendall(bytes(sys.argv[3], encoding='utf-8'))
                client_name = connection.recv(64).decode('utf-8')
                self.currentUsers[connection] = client_name

                print(f'{self.getCurrentTime()} O usuário {client_name} entrou em {sys.argv[3]}!')

                while True:
                    data = connection.recv(64).decode('utf-8')
                    if data != '':
                        self.multicast(data, owner=connection)
                    else:
                        return
            else:
                connection.sendall(bytes('A sala está lotada!', encoding='utf-8'))

        except:
            print(f'{self.getCurrentTime()} {client_name} saiu de {sys.argv[3]}!')
            self.currentUsers.pop(connection)
            connection.close()

    def getCurrentTime(self):
        return datetime.now().strftime("%H:%M:%S")

    def multicast(self, message, owner=None):
        #enviar mensagem com hora exata, nome e mensagem de cada usuário
        for conn in self.currentUsers:
            data = f'{self.getCurrentTime()} {self.currentUsers[owner]}: {message}'
            conn.sendall(bytes(data, encoding='utf-8'))  


if __name__ == "__main__":
    Server()